using System.Text;
using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Application.Export.Services;

public interface ITerraformGeneratorService
{
    string GenerateTerraform(Architecture architecture);
}

public class TerraformGeneratorService : ITerraformGeneratorService
{
    public string GenerateTerraform(Architecture architecture)
    {
        var sb = new StringBuilder();

        // 1. Provider configuration
        sb.AppendLine("terraform {");
        sb.AppendLine("  required_providers {");
        sb.AppendLine("    oci = {");
        sb.AppendLine("      source  = \"oracle/oci\"");
        sb.AppendLine("      version = \"~> 5.0\"");
        sb.AppendLine("    }");
        sb.AppendLine("  }");
        sb.AppendLine("}");
        sb.AppendLine();
        
        sb.AppendLine("provider \"oci\" {");
        sb.AppendLine($"  region = \"{architecture.Region}\"");
        sb.AppendLine("}");
        sb.AppendLine();

        // 2. Foundational Networking (VCN)
        sb.AppendLine("resource \"oci_core_vcn\" \"main_vcn\" {");
        sb.AppendLine($"  compartment_id = var.compartment_id");
        sb.AppendLine("  cidr_blocks    = [\"10.0.0.0/16\"]");
        sb.AppendLine($"  display_name   = \"{Sanitize(architecture.Name)}_vcn\"");
        sb.AppendLine("}");
        sb.AppendLine();

        sb.AppendLine("resource \"oci_core_subnet\" \"main_subnet\" {");
        sb.AppendLine("  compartment_id = var.compartment_id");
        sb.AppendLine("  vcn_id         = oci_core_vcn.main_vcn.id");
        sb.AppendLine("  cidr_block     = \"10.0.1.0/24\"");
        sb.AppendLine($"  display_name   = \"{Sanitize(architecture.Name)}_subnet\"");
        sb.AppendLine("}");
        sb.AppendLine();

        // 3. Resources Mapping
        foreach (var resource in architecture.Resources.OrderBy(r => r.Type).ThenBy(r => r.Name))
        {
            var resName = Sanitize(resource.Name);
            var resType = resource.Type;

            switch (resType)
            {
                case "InternetGateway":
                    sb.AppendLine($"resource \"oci_core_internet_gateway\" \"{resName}\" {{");
                    sb.AppendLine($"  compartment_id = var.compartment_id");
                    sb.AppendLine($"  vcn_id         = oci_core_vcn.main_vcn.id");
                    sb.AppendLine($"  enabled        = true");
                    sb.AppendLine($"  display_name   = \"{resource.Name}\"");
                    sb.AppendLine($"}}");
                    sb.AppendLine();
                    break;
                case "LoadBalancer":
                    sb.AppendLine($"resource \"oci_load_balancer_load_balancer\" \"{resName}\" {{");
                    sb.AppendLine($"  compartment_id = var.compartment_id");
                    sb.AppendLine($"  display_name   = \"{resource.Name}\"");
                    sb.AppendLine($"  shape_name     = \"flexible\"");
                    sb.AppendLine($"  subnet_ids     = [oci_core_subnet.main_subnet.id]");
                    sb.AppendLine($"}}");
                    sb.AppendLine();
                    break;
                case "ComputeInstance":
                    sb.AppendLine($"resource \"oci_core_instance\" \"{resName}\" {{");
                    sb.AppendLine($"  compartment_id      = var.compartment_id");
                    sb.AppendLine($"  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name");
                    sb.AppendLine($"  shape               = \"VM.Standard.E4.Flex\"");
                    sb.AppendLine($"  display_name        = \"{resource.Name}\"");
                    sb.AppendLine($"  create_vnic_details {{");
                    sb.AppendLine($"    subnet_id = oci_core_subnet.main_subnet.id");
                    sb.AppendLine($"  }}");
                    sb.AppendLine($"}}");
                    sb.AppendLine();
                    break;
                case "Database":
                    sb.AppendLine($"resource \"oci_database_autonomous_database\" \"{resName}\" {{");
                    sb.AppendLine($"  compartment_id           = var.compartment_id");
                    sb.AppendLine($"  db_name                  = \"{resName}db\"");
                    sb.AppendLine($"  cpu_core_count           = 1");
                    sb.AppendLine($"  data_storage_size_in_tbs = 1");
                    sb.AppendLine($"  display_name             = \"{resource.Name}\"");
                    sb.AppendLine($"}}");
                    sb.AppendLine();
                    break;
                default:
                    // Fallback as a comment for unknown resources
                    sb.AppendLine($"// TODO: Add terraform definition for {resType} ({resource.Name})");
                    sb.AppendLine();
                    break;
            }
        }

        return sb.ToString();
    }

    private static string Sanitize(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) return "resource";
        
        // Terraform resource names can only contain letters, numbers, underscores, and hyphens.
        var sanitized = new StringBuilder();
        foreach (var c in name.ToLowerInvariant())
        {
            if (char.IsLetterOrDigit(c))
            {
                sanitized.Append(c);
            }
            else if (c == ' ' || c == '-')
            {
                sanitized.Append('_');
            }
        }

        var result = sanitized.ToString();
        return string.IsNullOrEmpty(result) ? "resource" : result;
    }
}
