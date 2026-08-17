# ─── Build stage ──────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files first (for layer caching)
COPY OciArchitectureLab.slnx ./
COPY src/OciArchitectureLab.Domain/OciArchitectureLab.Domain.csproj src/OciArchitectureLab.Domain/
COPY src/OciArchitectureLab.Application/OciArchitectureLab.Application.csproj src/OciArchitectureLab.Application/
COPY src/OciArchitectureLab.Infrastructure/OciArchitectureLab.Infrastructure.csproj src/OciArchitectureLab.Infrastructure/
COPY src/OciArchitectureLab.Api/OciArchitectureLab.Api.csproj src/OciArchitectureLab.Api/
COPY tests/OciArchitectureLab.Unit.Tests/OciArchitectureLab.Unit.Tests.csproj tests/OciArchitectureLab.Unit.Tests/
COPY tests/OciArchitectureLab.Integration.Tests/OciArchitectureLab.Integration.Tests.csproj tests/OciArchitectureLab.Integration.Tests/

RUN dotnet restore OciArchitectureLab.slnx

# Copy source and build
COPY . .
RUN dotnet publish src/OciArchitectureLab.Api/OciArchitectureLab.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ─── Runtime stage ────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 appuser

COPY --from=build /app/publish .
RUN chown -R appuser:appgroup /app

USER appuser

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health/live || exit 1

ENTRYPOINT ["dotnet", "OciArchitectureLab.Api.dll"]
