using FluentValidation;
using OciArchitectureLab.Application.Architectures.Dtos;

namespace OciArchitectureLab.Application.Architectures.Validators;

public class CreateArchitectureRequestValidator : AbstractValidator<CreateArchitectureRequest>
{
    private static readonly string[] ValidRegions =
    [
        "sa-santiago-1", "us-ashburn-1", "us-phoenix-1",
        "eu-frankfurt-1", "ap-tokyo-1", "ap-sydney-1",
        "uk-london-1", "ca-toronto-1", "sa-saopaulo-1"
    ];

    public CreateArchitectureRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Architecture name is required.")
            .MaximumLength(100).WithMessage("Architecture name must not exceed 100 characters.");

        RuleFor(x => x.Region)
            .NotEmpty().WithMessage("OCI Region is required.")
            .Must(r => ValidRegions.Contains(r))
            .WithMessage($"Region must be one of: {string.Join(", ", ValidRegions)}");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}

public class UpdateArchitectureRequestValidator : AbstractValidator<UpdateArchitectureRequest>
{
    public UpdateArchitectureRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Architecture name is required.")
            .MaximumLength(100).WithMessage("Architecture name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");
    }
}
