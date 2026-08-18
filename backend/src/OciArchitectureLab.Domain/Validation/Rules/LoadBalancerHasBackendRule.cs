using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Domain.Validation.Rules;

public class LoadBalancerHasBackendRule : IArchitectureRule
{
    public string RuleId => "NET-001";

    public IEnumerable<ValidationMessage> Evaluate(Architecture architecture)
    {
        var loadBalancers = architecture.Resources.Where(r => r.Type == "LoadBalancer");

        foreach (var lb in loadBalancers)
        {
            var hasOutgoingConnections = architecture.Connections.Any(c => c.SourceResourceId == lb.Id);
            
            if (!hasOutgoingConnections)
            {
                yield return new ValidationMessage(
                    RuleId,
                    $"Load Balancer '{lb.Name}' has no backend connections. It will not route traffic anywhere.",
                    ValidationSeverity.Warning,
                    [lb.Id]
                );
            }
        }
    }
}
