using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Domain.Validation;

public class ArchitectureValidator
{
    private readonly IEnumerable<IArchitectureRule> _rules;

    public ArchitectureValidator(IEnumerable<IArchitectureRule> rules)
    {
        _rules = rules;
    }

    public ValidationResult Validate(Architecture architecture)
    {
        var messages = new List<ValidationMessage>();

        foreach (var rule in _rules)
        {
            messages.AddRange(rule.Evaluate(architecture));
        }

        var isValid = !messages.Any(m => m.Severity == ValidationSeverity.Error);
        return new ValidationResult(isValid, messages.AsReadOnly());
    }
}
