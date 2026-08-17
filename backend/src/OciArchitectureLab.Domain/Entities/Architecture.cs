namespace OciArchitectureLab.Domain.Entities;

/// <summary>
/// Core domain entity representing an OCI Architecture design.
/// This is the source of truth for the entire system.
/// Canvas, Markdown, Simulator and Terraform are all derived artifacts.
/// </summary>
public class Architecture
{
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    public string Name { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public string Provider { get; private set; } = "OCI";
    public string Region { get; private set; } = string.Empty;
    public IReadOnlyList<OciResource> Resources => _resources.AsReadOnly();
    public IReadOnlyList<ResourceConnection> Connections => _connections.AsReadOnly();
    public IReadOnlyList<SecurityRule> SecurityRules => _securityRules.AsReadOnly();
    public IReadOnlyList<TrafficFlow> TrafficFlows => _trafficFlows.AsReadOnly();
    public ArchitectureMetadata Metadata { get; private set; } = new();

    private readonly List<OciResource> _resources = [];
    private readonly List<ResourceConnection> _connections = [];
    private readonly List<SecurityRule> _securityRules = [];
    private readonly List<TrafficFlow> _trafficFlows = [];

    // Required for MongoDB deserialization
    private Architecture() { }

    public static Architecture Create(string name, string region, string description = "")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(region);

        return new Architecture
        {
            Id = Guid.NewGuid().ToString(),
            Name = name,
            Region = region,
            Description = description,
            Metadata = new ArchitectureMetadata
            {
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };
    }

    public void UpdateName(string name)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        Name = name;
        TouchUpdatedAt();
    }

    public void UpdateDescription(string description)
    {
        Description = description;
        TouchUpdatedAt();
    }

    public void AddResource(OciResource resource)
    {
        ArgumentNullException.ThrowIfNull(resource);
        _resources.Add(resource);
        TouchUpdatedAt();
    }

    public void RemoveResource(string resourceId)
    {
        var resource = _resources.FirstOrDefault(r => r.Id == resourceId);
        if (resource is not null)
        {
            _resources.Remove(resource);
            // Remove dangling connections
            _connections.RemoveAll(c => c.SourceResourceId == resourceId || c.TargetResourceId == resourceId);
            TouchUpdatedAt();
        }
    }

    public void AddConnection(ResourceConnection connection)
    {
        ArgumentNullException.ThrowIfNull(connection);
        _connections.Add(connection);
        TouchUpdatedAt();
    }

    private void TouchUpdatedAt() => Metadata = Metadata with { UpdatedAt = DateTime.UtcNow };
}
