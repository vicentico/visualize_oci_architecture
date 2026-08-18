using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Domain.Validation.Rules;

public class DatabaseIsPrivateRule : IArchitectureRule
{
    public string RuleId => "SEC-001";

    public IEnumerable<ValidationMessage> Evaluate(Architecture architecture)
    {
        var dbNodes = architecture.Resources.Where(r => r.Type == "Database");

        foreach (var db in dbNodes)
        {
            // Check if DB is explicitly marked as public (isPrivate = false)
            if (db.Properties.TryGetValue("isPrivate", out var isPrivateObj) && 
                isPrivateObj is bool isPrivate && !isPrivate)
            {
                yield return new ValidationMessage(
                    RuleId,
                    $"Database '{db.Name}' is exposed. Databases should always be private in OCI.",
                    ValidationSeverity.Error,
                    [db.Id]
                );
            }
            
            // Check if DB is directly connected from Internet
            var internetNodes = architecture.Resources.Where(r => r.Type == "Internet").Select(r => r.Id).ToList();
            var isConnectedFromInternet = architecture.Connections
                .Any(c => c.TargetResourceId == db.Id && internetNodes.Contains(c.SourceResourceId));

            if (isConnectedFromInternet)
            {
                yield return new ValidationMessage(
                    RuleId,
                    $"Database '{db.Name}' is directly connected to the Internet. Use a Load Balancer or API Gateway.",
                    ValidationSeverity.Error,
                    [db.Id]
                );
            }
        }
    }
}
