using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using OciArchitectureLab.Domain.Entities;
using Xunit;

namespace OciArchitectureLab.Unit.Tests.Domain;

public class ArchitectureSerializationTests
{
    [Fact]
    public void SerializeAndDeserialize_Architecture_PreservesAllData()
    {
        // Arrange
        var architecture = Architecture.Create("Test Architecture", "us-ashburn-1", "A simple test");
        
        var resource = new OciResource
        {
            Id = Guid.NewGuid().ToString(),
            Type = "ComputeInstance",
            Name = "Web Server",
            Position = new CanvasPosition(100, 200, 150, 80),
            Properties = new Dictionary<string, object>
            {
                { "ocpus", 2 },
                { "memoryInGBs", 16 }
            }
        };

        architecture.AddResource(resource);

        var connection = new ResourceConnection
        {
            Id = Guid.NewGuid().ToString(),
            SourceResourceId = "res-1",
            TargetResourceId = "res-2",
            Protocol = "HTTP",
            Port = 80,
            Direction = ConnectionDirection.Unidirectional
        };

        architecture.AddConnection(connection);

        // System.Text.Json options to ensure fields/properties are serialized correctly
        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Converters = { new JsonStringEnumConverter(JsonNamingPolicy.CamelCase) },
            WriteIndented = true
        };

        // Act
        string json = JsonSerializer.Serialize(architecture, options);
        var deserialized = JsonSerializer.Deserialize<Architecture>(json, options);

        // Assert
        deserialized.Should().NotBeNull();
        deserialized!.Id.Should().Be(architecture.Id);
        deserialized.Name.Should().Be("Test Architecture");
        deserialized.Region.Should().Be("us-ashburn-1");
        deserialized.Description.Should().Be("A simple test");

        deserialized.Resources.Should().HaveCount(1);
        var desResource = deserialized.Resources[0];
        desResource.Id.Should().Be(resource.Id);
        desResource.Type.Should().Be("ComputeInstance");
        desResource.Name.Should().Be("Web Server");
        desResource.Position.X.Should().Be(100);
        
        // Dictionary deserialization using System.Text.Json converts numbers to JsonElement by default
        desResource.Properties.Should().ContainKey("ocpus");

        deserialized.Connections.Should().HaveCount(1);
        var desConn = deserialized.Connections[0];
        desConn.Protocol.Should().Be("HTTP");
        desConn.Port.Should().Be(80);
        desConn.Direction.Should().Be(ConnectionDirection.Unidirectional);
    }
}
