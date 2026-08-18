namespace OciArchitectureLab.Domain.Validation;

public enum ValidationSeverity
{
    Warning,
    Error
}

public record ValidationMessage(
    string RuleId,
    string Message,
    ValidationSeverity Severity,
    IReadOnlyList<string> AffectedResourceIds
);

public record ValidationResult(
    bool IsValid,
    IReadOnlyList<ValidationMessage> Messages
);
