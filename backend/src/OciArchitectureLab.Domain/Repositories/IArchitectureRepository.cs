using OciArchitectureLab.Domain.Entities;

namespace OciArchitectureLab.Domain.Repositories;

/// <summary>
/// Repository contract for Architecture persistence.
/// Defined in Domain — implemented in Infrastructure.
/// This ensures Dependency Inversion: Domain does not depend on Infrastructure.
/// </summary>
public interface IArchitectureRepository
{
    Task<IReadOnlyList<Architecture>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Architecture?> GetByIdAsync(string id, CancellationToken cancellationToken = default);
    Task<Architecture> CreateAsync(Architecture architecture, CancellationToken cancellationToken = default);
    Task<Architecture> UpdateAsync(Architecture architecture, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default);
}
