using OciArchitectureLab.Application.Architectures.Dtos;
using OciArchitectureLab.Application.Simulation.Dtos;
using OciArchitectureLab.Domain.Entities;
using OciArchitectureLab.Domain.Simulation;

namespace OciArchitectureLab.Application.Simulation.Services;

public class SimulationService
{
    private readonly PathFinder _pathFinder;

    public SimulationService()
    {
        _pathFinder = new PathFinder();
    }

    public TrafficSimulationResult SimulateTraffic(SimulationRequest request)
    {
        var tempArch = Architecture.Create(
            request.ArchitectureState.Name, 
            request.ArchitectureState.Region, 
            request.ArchitectureState.Description);
        
        var resources = request.ArchitectureState.Resources.Select(MapToDomainResource).ToList();
        var connections = request.ArchitectureState.Connections.Select(MapToDomainConnection).ToList();
        
        tempArch.SetState(resources, connections);
        
        return _pathFinder.FindPath(tempArch, request.SourceNodeId, request.TargetNodeId);
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
