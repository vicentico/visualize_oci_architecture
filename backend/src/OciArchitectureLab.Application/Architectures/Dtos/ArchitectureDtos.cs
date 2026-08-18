namespace OciArchitectureLab.Application.Architectures.Dtos;

/// <summary>
/// Data Transfer Objects for Architecture API communication.
/// These DTOs decouple the API contract from the Domain model.
/// </summary>

public record ArchitectureSummaryDto(
    string Id,
    string Name,
    string Description,
    string Region,
    int ResourceCount,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record ArchitectureDetailDto(
    string Id,
    string Name,
    string Description,
    string Provider,
    string Region,
    IReadOnlyList<OciResourceDto> Resources,
    IReadOnlyList<ResourceConnectionDto> Connections,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record OciResourceDto(
    string Id,
    string Type,
    string Name,
    Dictionary<string, object> Properties,
    CanvasPositionDto Position
);

public record CanvasPositionDto(double X, double Y, double Width, double Height);

public record ResourceConnectionDto(
    string Id,
    string SourceResourceId,
    string TargetResourceId,
    string Protocol,
    int? Port,
    string Direction
);

public record CreateArchitectureRequest(
    string Name,
    string Region,
    string Description = ""
);

public record UpdateArchitectureRequest(
    string Name,
    string Description
);

public record SaveArchitectureStateRequest(
    string Name,
    string Description,
    string Region,
    IReadOnlyList<OciResourceDto> Resources,
    IReadOnlyList<ResourceConnectionDto> Connections
);
