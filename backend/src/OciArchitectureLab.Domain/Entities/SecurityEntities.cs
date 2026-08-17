namespace OciArchitectureLab.Domain.Entities;

/// <summary>
/// Security rule defining allowed or denied traffic patterns.
/// Maps to OCI Network Security Group rules and Security List entries.
/// </summary>
public class SecurityRule
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string Name { get; init; }
    public required SecurityRuleDirection Direction { get; init; }
    public required string Protocol { get; init; }
    public string Source { get; init; } = "0.0.0.0/0";
    public string Destination { get; init; } = "0.0.0.0/0";
    public int? PortMin { get; init; }
    public int? PortMax { get; init; }
    public SecurityRuleAction Action { get; init; } = SecurityRuleAction.Allow;
}

/// <summary>
/// Represents a conceptual traffic flow for educational simulation.
/// Not real network packets — used by the Traffic Simulator engine.
/// </summary>
public class TrafficFlow
{
    public string Id { get; init; } = Guid.NewGuid().ToString();
    public required string SourceResourceId { get; init; }
    public required string TargetResourceId { get; init; }
    public string Protocol { get; init; } = "HTTPS";
    public int Port { get; init; } = 443;
}

public enum SecurityRuleDirection { Ingress, Egress }
public enum SecurityRuleAction { Allow, Deny }
