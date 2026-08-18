using FluentAssertions;
using OciArchitectureLab.Application.Export.Services;
using OciArchitectureLab.Domain.Entities;
using Xunit;

namespace OciArchitectureLab.Unit.Tests.Application.Export;

public class TerraformGeneratorServiceTests
{
    private readonly TerraformGeneratorService _sut;

    public TerraformGeneratorServiceTests()
    {
        _sut = new TerraformGeneratorService();
    }

    [Fact]
    public void GenerateTerraform_ShouldIncludeProviderAndVcn()
    {
        // Arrange
        var architectureJson = @"
        {
            ""id"": ""test-id"",
            ""name"": ""My Arch"",
            ""region"": ""us-ashburn-1"",
            ""resources"": [],
            ""connections"": []
        }";
        var architecture = System.Text.Json.JsonSerializer.Deserialize<Architecture>(architectureJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // Act
        var terraform = _sut.GenerateTerraform(architecture!);

        // Assert
        terraform.Should().Contain("provider \"oci\"");
        terraform.Should().Contain("region = \"us-ashburn-1\"");
        terraform.Should().Contain("resource \"oci_core_vcn\"");
        terraform.Should().Contain("my_arch_vcn");
    }

    [Fact]
    public void GenerateTerraform_ShouldMapResourcesCorrectly()
    {
        // Arrange
        var architectureJson = @"
        {
            ""id"": ""test-id"",
            ""name"": ""My Arch"",
            ""resources"": [
                { ""id"": ""n1"", ""type"": ""InternetGateway"", ""name"": ""Main IGW"" },
                { ""id"": ""n2"", ""type"": ""LoadBalancer"", ""name"": ""Public LB"" },
                { ""id"": ""n3"", ""type"": ""ComputeInstance"", ""name"": ""Web Server 1"" },
                { ""id"": ""n4"", ""type"": ""Database"", ""name"": ""User DB"" }
            ],
            ""connections"": []
        }";
        var architecture = System.Text.Json.JsonSerializer.Deserialize<Architecture>(architectureJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // Act
        var terraform = _sut.GenerateTerraform(architecture!);

        // Assert
        terraform.Should().Contain("resource \"oci_core_internet_gateway\" \"main_igw\"");
        terraform.Should().Contain("resource \"oci_load_balancer_load_balancer\" \"public_lb\"");
        terraform.Should().Contain("resource \"oci_core_instance\" \"web_server_1\"");
        terraform.Should().Contain("resource \"oci_database_autonomous_database\" \"user_db\"");
    }
}
