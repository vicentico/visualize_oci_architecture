using OciArchitectureLab.Application.Architectures.Dtos;
using OciArchitectureLab.Domain.Entities;
using OciArchitectureLab.Domain.Repositories;

namespace OciArchitectureLab.Application.Architectures.Services;

/// <summary>
/// Application service orchestrating Architecture use cases.
/// Sits between the API controllers and the Domain/Infrastructure layers.
/// Contains no business rules — those belong in the Domain.
/// </summary>
public class ArchitectureService(IArchitectureRepository repository)
{
    public async Task<IReadOnlyList<ArchitectureSummaryDto>> GetAllAsync(CancellationToken ct = default)
    {
        var architectures = await repository.GetAllAsync(ct);
        return architectures.Select(MapToSummary).ToList().AsReadOnly();
    }

    public async Task<ArchitectureDetailDto?> GetByIdAsync(string id, CancellationToken ct = default)
    {
        var architecture = await repository.GetByIdAsync(id, ct);
        return architecture is null ? null : MapToDetail(architecture);
    }

    public async Task<ArchitectureDetailDto> CreateAsync(CreateArchitectureRequest request, CancellationToken ct = default)
    {
        var architecture = Architecture.Create(request.Name, request.Region, request.Description);
        var saved = await repository.CreateAsync(architecture, ct);
        return MapToDetail(saved);
    }

    public async Task<ArchitectureDetailDto?> UpdateAsync(string id, UpdateArchitectureRequest request, CancellationToken ct = default)
    {
        var existing = await repository.GetByIdAsync(id, ct);
        if (existing is null) return null;

        existing.UpdateName(request.Name);
        existing.UpdateDescription(request.Description);

        var updated = await repository.UpdateAsync(existing, ct);
        return MapToDetail(updated);
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken ct = default)
        => await repository.DeleteAsync(id, ct);

    // --- Mappers ---

    private static ArchitectureSummaryDto MapToSummary(Architecture a) => new(
        a.Id, a.Name, a.Description, a.Region,
        a.Resources.Count,
        a.Metadata.CreatedAt, a.Metadata.UpdatedAt
    );

    private static ArchitectureDetailDto MapToDetail(Architecture a) => new(
        a.Id, a.Name, a.Description, a.Provider, a.Region,
        a.Resources.Select(MapResource).ToList().AsReadOnly(),
        a.Connections.Select(MapConnection).ToList().AsReadOnly(),
        a.Metadata.CreatedAt, a.Metadata.UpdatedAt
    );

    private static OciResourceDto MapResource(OciResource r) => new(
        r.Id, r.Type, r.Name, r.Properties,
        new CanvasPositionDto(r.Position.X, r.Position.Y, r.Position.Width, r.Position.Height)
    );

    private static ResourceConnectionDto MapConnection(ResourceConnection c) => new(
        c.Id, c.SourceResourceId, c.TargetResourceId,
        c.Protocol, c.Port, c.Direction.ToString()
    );
}
