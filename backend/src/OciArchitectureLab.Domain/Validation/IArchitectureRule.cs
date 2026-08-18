using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Domain.Validation;

public interface IArchitectureRule
{
    string RuleId { get; }
    IEnumerable<ValidationMessage> Evaluate(Architecture architecture);
}
