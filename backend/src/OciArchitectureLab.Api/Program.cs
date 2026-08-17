using FluentValidation;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using OciArchitectureLab.Application.Architectures.Services;
using OciArchitectureLab.Application.Architectures.Validators;
using OciArchitectureLab.Infrastructure;
using Serilog;

// ─────────────────────────────────────────────
// Configure Serilog early (before builder)
// ─────────────────────────────────────────────
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting OCI Architecture Lab API...");

    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ──────────────────────────────
    builder.Host.UseSerilog((ctx, lc) => lc
        .ReadFrom.Configuration(ctx.Configuration)
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"));

    // ── Controllers ──────────────────────────
    builder.Services.AddControllers();

    // ── OpenAPI (native .NET 9+) ─────────────
    builder.Services.AddOpenApi();

    // ── CORS (permitir Angular dev server) ───
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAngularDev", policy =>
            policy.WithOrigins("http://localhost:4200")
                  .AllowAnyHeader()
                  .AllowAnyMethod());
    });

    // ── Infrastructure (MongoDB + Repos) ─────
    builder.Services.AddInfrastructure(builder.Configuration);

    // ── Application Services ─────────────────
    builder.Services.AddScoped<ArchitectureService>();

    // ── FluentValidation ─────────────────────
    builder.Services.AddScoped<IValidator<OciArchitectureLab.Application.Architectures.Dtos.CreateArchitectureRequest>,
        CreateArchitectureRequestValidator>();
    builder.Services.AddScoped<IValidator<OciArchitectureLab.Application.Architectures.Dtos.UpdateArchitectureRequest>,
        UpdateArchitectureRequestValidator>();

    // ── Health Checks ─────────────────────────
    var mongoConnectionString = builder.Configuration["MongoDB:ConnectionString"]
        ?? "mongodb://localhost:27017";

    builder.Services.AddHealthChecks()
        .AddMongoDb(
            sp => sp.GetRequiredService<MongoDB.Driver.IMongoClient>(),
            name: "mongodb",
            failureStatus: HealthStatus.Unhealthy,
            tags: ["db", "mongodb"]);

    // ─────────────────────────────────────────
    var app = builder.Build();
    // ─────────────────────────────────────────

    // ── Middleware pipeline ──────────────────
    if (app.Environment.IsDevelopment())
    {
        // .NET 10 native OpenAPI endpoint
        app.MapOpenApi();
    }

    app.UseSerilogRequestLogging();
    app.UseCors("AllowAngularDev");
    app.UseAuthorization();
    app.MapControllers();

    // Health check endpoints
    app.MapHealthChecks("/health", new HealthCheckOptions
    {
        ResponseWriter = async (context, report) =>
        {
            context.Response.ContentType = "application/json";
            var result = new
            {
                status = report.Status.ToString(),
                checks = report.Entries.Select(e => new
                {
                    name = e.Key,
                    status = e.Value.Status.ToString(),
                    description = e.Value.Description
                })
            };
            await context.Response.WriteAsJsonAsync(result);
        }
    });

    app.MapHealthChecks("/health/ready", new HealthCheckOptions
    {
        Predicate = check => check.Tags.Contains("db")
    });

    app.MapHealthChecks("/health/live", new HealthCheckOptions
    {
        Predicate = _ => false
    });

    Log.Information("OCI Architecture Lab API started. OpenAPI at /openapi/v1.json");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

// Needed for integration tests
public partial class Program { }
