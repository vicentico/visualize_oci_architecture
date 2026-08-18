using OciArchitectureLab.Application.Architectures.Dtos;
using OciArchitectureLab.Domain.Entities;
using OciArchitectureLab.Domain.Validation;

namespace OciArchitectureLab.Application.Validation.Services;

public class ValidationService
{
    private readonly ArchitectureValidator _validator;

    public ValidationService(IEnumerable<IArchitectureRule> rules)
    {
        _validator = new ArchitectureValidator(rules);
    }

    public ValidationResult ValidateArchitecture(SaveArchitectureStateRequest request)
    {
        // Construct a temporary Domain Architecture to run rules against
        var tempArch = Architecture.Create(request.Name, request.Region, request.Description);
        
        var resources = request.Resources.Select(MapToDomainResource).ToList();
        var connections = request.Connections.Select(MapToDomainConnection).ToList();
        
        tempArch.SetState(resources, connections);
        
        return _validator.Validate(tempArch);
    }

    private static OciResource MapToDomainResource(OciResourceDto dto) => new OciResource
    {
        Id = dto.Id,
        Type = dto.Type,
        Name = dto.Name,
        Position = new CanvasPosition(dto.Position.X, dto.Position.Y, dto.Position.Width, dto.Position.Height),
        Properties = dto.Properties
    };

    private static ResourceConnection MapToDomainConnection(ResourceConnectionDto dto) => new ResourceConnection
    {
        Id = dto.Id,
        SourceResourceId = dto.SourceResourceId,
        TargetResourceId = dto.TargetResourceId,
        Protocol = dto.Protocol,
        Port = dto.Port,
        Direction = Enum.TryParse<ConnectionDirection>(dto.Direction, out var dir) ? dir : ConnectionDirection.Unidirectional
    };
}
