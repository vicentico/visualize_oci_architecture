using Microsoft.Extensions.Options;
using MongoDB.Driver;
using OciArchitectureLab.Domain.Entities;
using OciArchitectureLab.Domain.Repositories;

namespace OciArchitectureLab.Infrastructure.Persistence.Repositories;

/// <summary>
/// MongoDB implementation of IArchitectureRepository.
/// Defined in Infrastructure — implements the Domain contract.
/// The Domain knows nothing about MongoDB; this layer adapts it.
/// </summary>
public class MongoArchitectureRepository : IArchitectureRepository
{
    private readonly IMongoCollection<Architecture> _collection;

    public MongoArchitectureRepository(IMongoClient mongoClient, IOptions<MongoDbSettings> settings)
    {
        var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
        _collection = database.GetCollection<Architecture>(settings.Value.ArchitecturesCollection);

        // Ensure index on Id for fast lookups
        var indexKeys = Builders<Architecture>.IndexKeys.Ascending(a => a.Id);
        _collection.Indexes.CreateOneAsync(new CreateIndexModel<Architecture>(indexKeys));
    }

    public async Task<IReadOnlyList<Architecture>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var result = await _collection
            .Find(Builders<Architecture>.Filter.Empty)
            .SortByDescending(a => a.Metadata.UpdatedAt)
            .ToListAsync(cancellationToken);

        return result.AsReadOnly();
    }

    public async Task<Architecture?> GetByIdAsync(string id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Architecture>.Filter.Eq(a => a.Id, id);
        return await _collection.Find(filter).FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<Architecture> CreateAsync(Architecture architecture, CancellationToken cancellationToken = default)
    {
        await _collection.InsertOneAsync(architecture, cancellationToken: cancellationToken);
        return architecture;
    }

    public async Task<Architecture> UpdateAsync(Architecture architecture, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Architecture>.Filter.Eq(a => a.Id, architecture.Id);
        await _collection.ReplaceOneAsync(filter, architecture, cancellationToken: cancellationToken);
        return architecture;
    }

    public async Task<bool> DeleteAsync(string id, CancellationToken cancellationToken = default)
    {
        var filter = Builders<Architecture>.Filter.Eq(a => a.Id, id);
        var result = await _collection.DeleteOneAsync(filter, cancellationToken);
        return result.DeletedCount > 0;
    }
}
