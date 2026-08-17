using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Unit.Tests.Domain;

/// <summary>
/// Unit tests for the Architecture domain entity.
/// Tests business rules and domain invariants.
/// </summary>
public class ArchitectureTests
{
    [Fact]
    public void Create_WithValidParameters_ShouldCreateArchitecture()
    {
        // Arrange & Act
        var architecture = Architecture.Create("Test Architecture", "us-ashburn-1", "Test description");

        // Assert
        Assert.NotNull(architecture);
        Assert.NotEmpty(architecture.Id);
        Assert.Equal("Test Architecture", architecture.Name);
        Assert.Equal("us-ashburn-1", architecture.Region);
        Assert.Equal("Test description", architecture.Description);
        Assert.Equal("OCI", architecture.Provider);
        Assert.Empty(architecture.Resources);
        Assert.Empty(architecture.Connections);
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            Architecture.Create("", "us-ashburn-1"));
    }

    [Fact]
    public void Create_WithEmptyRegion_ShouldThrowArgumentException()
    {
        // Act & Assert
        Assert.Throws<ArgumentException>(() =>
            Architecture.Create("Test", ""));
    }

    [Fact]
    public void AddResource_ShouldIncreaseResourceCount()
    {
        // Arrange
        var architecture = Architecture.Create("Test", "us-ashburn-1");
        var resource = new OciResource
        {
            Type = "VCN",
            Name = "my-vcn"
        };

        // Act
        architecture.AddResource(resource);

        // Assert
        Assert.Single(architecture.Resources);
        Assert.Equal("my-vcn", architecture.Resources[0].Name);
    }

    [Fact]
    public void RemoveResource_ShouldRemoveResourceAndDanglingConnections()
    {
        // Arrange
        var architecture = Architecture.Create("Test", "us-ashburn-1");
        var vcn = new OciResource { Type = "VCN", Name = "vcn" };
        var subnet = new OciResource { Type = "Subnet", Name = "subnet" };
        architecture.AddResource(vcn);
        architecture.AddResource(subnet);

        var connection = new ResourceConnection
        {
            SourceResourceId = vcn.Id,
            TargetResourceId = subnet.Id
        };
        architecture.AddConnection(connection);

        // Act
        architecture.RemoveResource(vcn.Id);

        // Assert
        Assert.Single(architecture.Resources);
        Assert.Empty(architecture.Connections); // Connection was removed too
    }

    [Fact]
    public void UpdateName_ShouldChangeName()
    {
        // Arrange
        var architecture = Architecture.Create("Original", "us-ashburn-1");

        // Act
        architecture.UpdateName("Updated Name");

        // Assert
        Assert.Equal("Updated Name", architecture.Name);
    }

    [Fact]
    public void Create_ShouldSetMetadataTimestamps()
    {
        // Arrange
        var before = DateTime.UtcNow;

        // Act
        var architecture = Architecture.Create("Test", "us-ashburn-1");

        // Assert
        Assert.True(architecture.Metadata.CreatedAt >= before);
        Assert.True(architecture.Metadata.UpdatedAt >= before);
    }
}
