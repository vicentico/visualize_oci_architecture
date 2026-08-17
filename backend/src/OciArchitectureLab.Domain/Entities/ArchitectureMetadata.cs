namespace OciArchitectureLab.Domain.Entities;

public record ArchitectureMetadata
{
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; init; } = DateTime.UtcNow;
    public string Version { get; init; } = "1.0";
    public string? Tags { get; init; }
}
