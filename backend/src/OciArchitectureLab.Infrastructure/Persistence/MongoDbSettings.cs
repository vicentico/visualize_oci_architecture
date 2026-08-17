namespace OciArchitectureLab.Infrastructure.Persistence;

/// <summary>
/// MongoDB configuration settings.
/// Loaded from appsettings.json under the "MongoDB" section.
/// </summary>
public class MongoDbSettings
{
    public const string SectionName = "MongoDB";

    public string ConnectionString { get; init; } = "mongodb://localhost:27017";
    public string DatabaseName { get; init; } = "oci_architecture_lab";
    public string ArchitecturesCollection { get; init; } = "architectures";
}
