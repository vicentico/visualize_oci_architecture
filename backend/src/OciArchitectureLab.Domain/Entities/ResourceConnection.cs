namespace OciArchitectureLab.Domain.Entities;

/// <summary>
/// Represents a directional connection between two OCI resources.
/// Captures protocol, port and direction for traffic simulation.
/// </summary>
public class ResourceConnection
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string SourceResourceId { get; init; }
    public required string TargetResourceId { get; init; }
    public string Protocol { get; init; } = "TCP";
    public int? Port { get; init; }
    public ConnectionDirection Direction { get; init; } = ConnectionDirection.Unidirectional;
    public Dictionary<string, object> Metadata { get; init; } = [];
}

public enum ConnectionDirection
{
    Unidirectional,
    Bidirectional
}
