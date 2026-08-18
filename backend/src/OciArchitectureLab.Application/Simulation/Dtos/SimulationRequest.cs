using OciArchitectureLab.Application.Architectures.Dtos;

namespace OciArchitectureLab.Application.Simulation.Dtos;

public class SimulationRequest
{
    public required string SourceNodeId { get; set; }
    public required string TargetNodeId { get; set; }
    public required SaveArchitectureStateRequest ArchitectureState { get; set; }
}
