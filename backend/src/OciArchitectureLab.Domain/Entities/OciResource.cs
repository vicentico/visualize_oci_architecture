namespace OciArchitectureLab.Domain.Entities;

/// <summary>
/// Represents an OCI cloud resource on the architecture canvas.
/// Domain data only — visual positioning is stored separately in Canvas metadata.
/// </summary>
public class OciResource
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string Type { get; init; }
    public required string Name { get; set; }
    public Dictionary<string, object> Properties { get; init; } = [];
    public CanvasPosition Position { get; set; } = new();
    public ResourceMetadata Metadata { get; init; } = new();
}

/// <summary>
/// Canvas position is considered presentation data, not domain data.
/// Stored here for convenience but treated as display-only.
/// </summary>
public record CanvasPosition(double X = 0, double Y = 0, double Width = 120, double Height = 80);

public record ResourceMetadata
{
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public string? Notes { get; init; }
}
