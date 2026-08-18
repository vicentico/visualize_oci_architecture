using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Domain.Validation.Rules;

public class NoInternetGatewayRule : IArchitectureRule
{
    public string RuleId => "NET-002";

    public IEnumerable<ValidationMessage> Evaluate(Architecture architecture)
    {
        var hasInternet = architecture.Resources.Any(r => r.Type == "Internet");
        var hasInternetGateway = architecture.Resources.Any(r => r.Type == "InternetGateway");

        if (hasInternet && !hasInternetGateway)
        {
            var internetNodes = architecture.Resources.Where(r => r.Type == "Internet").Select(r => r.Id).ToList();

            yield return new ValidationMessage(
                RuleId,
                "Traffic from the Internet requires an Internet Gateway (IGW) to reach resources.",
                ValidationSeverity.Warning,
                internetNodes
            );
        }
    }
}
