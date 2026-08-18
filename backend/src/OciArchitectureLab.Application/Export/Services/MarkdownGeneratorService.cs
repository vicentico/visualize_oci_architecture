using System.Text;
using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Application.Export.Services;

public interface IMarkdownGeneratorService
{
    string GenerateMarkdown(Architecture architecture);
}

public class MarkdownGeneratorService : IMarkdownGeneratorService
{
    public string GenerateMarkdown(Architecture architecture)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"# Technical Documentation: {architecture.Name}");
        sb.AppendLine();
        sb.AppendLine($"**ID:** `{architecture.Id}`");
        sb.AppendLine();

        sb.AppendLine("## 1. Components");
        sb.AppendLine();
        if (architecture.Resources.Any())
        {
            sb.AppendLine("| Component Name | Type |");
            sb.AppendLine("| --- | --- |");
            foreach (var node in architecture.Resources.OrderBy(n => n.Type).ThenBy(n => n.Name))
            {
                sb.AppendLine($"| **{Escape(node.Name)}** | `{Escape(node.Type)}` |");
            }
        }
        else
        {
            sb.AppendLine("*No components defined in this architecture.*");
        }
        sb.AppendLine();

        sb.AppendLine("## 2. Network Connections");
        sb.AppendLine();
        if (architecture.Connections.Any())
        {
            sb.AppendLine("| Source | Target | Protocol | Port |");
            sb.AppendLine("| --- | --- | --- | --- |");
            foreach (var conn in architecture.Connections)
            {
                var sourceNode = architecture.Resources.FirstOrDefault(n => n.Id == conn.SourceResourceId);
                var targetNode = architecture.Resources.FirstOrDefault(n => n.Id == conn.TargetResourceId);

                var sourceName = sourceNode != null ? Escape(sourceNode.Name) : "Unknown";
                var targetName = targetNode != null ? Escape(targetNode.Name) : "Unknown";
                
                var protocol = string.IsNullOrEmpty(conn.Protocol) ? "Any" : Escape(conn.Protocol);
                var port = conn.Port.HasValue ? Escape(conn.Port.Value.ToString()) : "Any";

                sb.AppendLine($"| {sourceName} | {targetName} | `{protocol}` | `{port}` |");
            }
        }
        else
        {
            sb.AppendLine("*No connections defined in this architecture.*");
        }
        sb.AppendLine();

        sb.AppendLine("---");
        sb.AppendLine("*Generated automatically by Visual OCI Architecture Lab.*");

        return sb.ToString();
    }

    private static string Escape(string? input)
    {
        if (string.IsNullOrWhiteSpace(input)) return string.Empty;
        return input.Replace("|", "\\|").Replace("\n", " ").Replace("\r", "");
    }
}
