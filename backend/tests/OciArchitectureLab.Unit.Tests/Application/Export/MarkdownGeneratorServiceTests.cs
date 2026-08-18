using FluentAssertions;
using OciArchitectureLab.Application.Export.Services;
using OciArchitectureLab.Domain.Entities;
using Xunit;

namespace OciArchitectureLab.Unit.Tests.Application.Export;

public class MarkdownGeneratorServiceTests
{
    private readonly MarkdownGeneratorService _sut;

    public MarkdownGeneratorServiceTests()
    {
        _sut = new MarkdownGeneratorService();
    }

    [Fact]
    public void GenerateMarkdown_ShouldIncludeArchitectureNameAndNodes()
    {
        // Arrange
        var architectureJson = @"
        {
            ""id"": ""test-id"",
            ""name"": ""Test Arch"",
            ""resources"": [
                { ""id"": ""n1"", ""type"": ""Compute"", ""name"": ""Web Server"" }
            ],
            ""connections"": []
        }";
        var architecture = System.Text.Json.JsonSerializer.Deserialize<Architecture>(architectureJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // Act
        var markdown = _sut.GenerateMarkdown(architecture!);

        // Assert
        markdown.Should().Contain("# Technical Documentation: Test Arch");
        markdown.Should().Contain("| **Web Server** | `Compute` |");
    }

    [Fact]
    public void GenerateMarkdown_ShouldIncludeConnections()
    {
        // Arrange
        var architectureJson = @"
        {
            ""id"": ""test-id"",
            ""name"": ""Test Arch"",
            ""resources"": [
                { ""id"": ""n1"", ""type"": ""Internet Gateway"", ""name"": ""IGW"" },
                { ""id"": ""n2"", ""type"": ""Load Balancer"", ""name"": ""LB"" }
            ],
            ""connections"": [
                { ""id"": ""c1"", ""sourceResourceId"": ""n1"", ""targetResourceId"": ""n2"", ""protocol"": ""HTTPS"", ""port"": 443 }
            ]
        }";
        var architecture = System.Text.Json.JsonSerializer.Deserialize<Architecture>(architectureJson, new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        // Act
        var markdown = _sut.GenerateMarkdown(architecture!);

        // Assert
        markdown.Should().Contain("| IGW | LB | `HTTPS` | `443` |");
    }
}
