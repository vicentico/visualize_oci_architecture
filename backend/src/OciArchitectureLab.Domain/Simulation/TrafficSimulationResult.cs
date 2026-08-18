namespace OciArchitectureLab.Domain.Simulation;

public record TrafficHop(
    string ConnectionId,
    string SourceResourceId,
    string TargetResourceId,
    int SequenceOrder
);

public record TrafficSimulationResult(
    bool IsPathFound,
    string? ErrorMessage,
    IReadOnlyList<TrafficHop> Path
);
