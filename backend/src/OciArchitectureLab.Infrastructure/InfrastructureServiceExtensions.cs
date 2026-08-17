using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Driver;
using OciArchitectureLab.Domain.Repositories;
using OciArchitectureLab.Infrastructure.Persistence;
using OciArchitectureLab.Infrastructure.Persistence.Repositories;

namespace OciArchitectureLab.Infrastructure;

/// <summary>
/// DI registration for the Infrastructure layer.
/// Called from the API project — keeps infrastructure concerns isolated.
/// </summary>
public static class InfrastructureServiceExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // MongoDB settings
        services.Configure<MongoDbSettings>(
            configuration.GetSection(MongoDbSettings.SectionName));

        // MongoDB client (singleton — thread-safe by design)
        services.AddSingleton<IMongoClient>(_ =>
        {
            var connectionString = configuration
                .GetSection(MongoDbSettings.SectionName)["ConnectionString"]
                ?? "mongodb://localhost:27017";

            return new MongoClient(connectionString);
        });

        // Repository registrations
        services.AddScoped<IArchitectureRepository, MongoArchitectureRepository>();

        return services;
    }
}
