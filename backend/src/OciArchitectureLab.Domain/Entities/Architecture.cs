using System.Text.Json.Serialization;

namespace OciArchitectureLab.Domain.Entities;

/// <summary>
/// Core domain entity representing an OCI Architecture design.
/// This is the source of truth for the entire system.
/// Canvas, Markdown, Simulator and Terraform are all derived artifacts.
/// </summary>
public class Architecture
{
    [JsonInclude]
    public string Id { get; private set; } = Guid.NewGuid().ToString();
    
    [JsonInclude]
    public string Name { get; private set; } = string.Empty;
    
    [JsonInclude]
    public string Description { get; private set; } = string.Empty;
    
    [JsonInclude]
    public string Provider { get; private set; } = "OCI";
    
    [JsonInclude]
    public string Region { get; private set; } = string.Empty;
    
    [JsonIgnore]
    public IReadOnlyList<OciResource> Resources => _resources.AsReadOnly();
    
    [JsonIgnore]
    public IReadOnlyList<ResourceConnection> Connections => _connections.AsReadOnly();
    
    [JsonIgnore]
    public IReadOnlyList<SecurityRule> SecurityRules => _securityRules.AsReadOnly();
    
    [JsonIgnore]
    public IReadOnlyList<TrafficFlow> TrafficFlows => _trafficFlows.AsReadOnly();
    
    [JsonInclude]
    public ArchitectureMetadata Metadata { get; private set; } = new();

    [JsonInclude]
    [JsonPropertyName("resources")]
    private List<OciResource> _resources = [];
    
    [JsonInclude]
    [JsonPropertyName("connections")]
    private List<ResourceConnection> _connections = [];
    
    [JsonInclude]
    [JsonPropertyName("securityRules")]
    private List<SecurityRule> _securityRules = [];
    
    [JsonInclude]
    [JsonPropertyName("trafficFlows")]
    private List<TrafficFlow> _trafficFlows = [];

    // Required for MongoDB/JSON deserialization
    [JsonConstructor]
    public Architecture() { }

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

    public void SetState(IEnumerable<OciResource> resources, IEnumerable<ResourceConnection> connections)
    {
        _resources.Clear();
        _resources.AddRange(resources);
        
        _connections.Clear();
        _connections.AddRange(connections);
        
        TouchUpdatedAt();
    }

    private void TouchUpdatedAt() => Metadata = Metadata with { UpdatedAt = DateTime.UtcNow };
}
