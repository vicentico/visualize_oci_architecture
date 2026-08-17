# Architecture Decisions — OCI Architecture Lab

## Stack Overview

```
Frontend: Angular 18 (standalone components)
Backend:  .NET 10 — Clean Architecture
Database: MongoDB 7.0
Runtime:  Docker + Docker Compose
```

## Architectural Principles Applied

### Clean Architecture (Backend)

```
OciArchitectureLab.Api          ← Entry point, controllers, DI composition root
  ↓ depends on
OciArchitectureLab.Application  ← Use cases, DTOs, validators
  ↓ depends on
OciArchitectureLab.Domain       ← Entities, repository interfaces
  ↑ implemented by
OciArchitectureLab.Infrastructure ← MongoDB, repositories
```

**Dependency rule**: Inner layers never reference outer layers.  
**Domain** contains no framework dependencies.  
**Infrastructure** implements domain interfaces — Dependency Inversion.

### Dependency Inversion

```csharp
// Domain defines the contract
public interface IArchitectureRepository { ... }

// Infrastructure implements it
public class MongoArchitectureRepository : IArchitectureRepository { ... }

// DI wires them at composition root (Program.cs via InfrastructureServiceExtensions)
services.AddScoped<IArchitectureRepository, MongoArchitectureRepository>();
```

### Architecture Model as Source of Truth

The `Architecture` domain entity is the **single source of truth**.

Canvas positioning (presentation data) is separated from domain data.
Future derived artifacts (Terraform, Markdown) will be generated from the model, not stored independently.

### Modular Monolith

No microservices in FASE 0.  
The backend is a single deployable unit structured for future modular separation if needed.  
Feature areas are organized into Application feature folders:

```
Application/
├── Architectures/  ← CRUD use cases (FASE 0)
├── Catalog/        ← OCI component catalog (FASE 3)
├── Validation/     ← Architecture rules (FASE 5)
├── Simulation/     ← Traffic simulator (FASE 6)
└── Export/         ← Markdown + Terraform (FASE 8-9)
```

### Frontend Architecture

Angular 18 standalone components — no NgModules.  
Feature-based folder structure mirrors backend feature organization.  
Angular Signals used for reactive local state (replaces RxJS for simple cases).

## Data Model

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "provider": "OCI",
  "region": "sa-santiago-1",
  "resources": [],
  "connections": [],
  "securityRules": [],
  "trafficFlows": [],
  "metadata": {
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

## API Endpoints (FASE 0)

```
GET    /api/architectures        → List all (summary)
GET    /api/architectures/{id}   → Get by ID (detail)
POST   /api/architectures        → Create
PUT    /api/architectures/{id}   → Update
DELETE /api/architectures/{id}   → Delete

GET    /health                   → Full health check
GET    /health/ready             → Database health
GET    /health/live              → Liveness (app running)
GET    /openapi/v1.json          → OpenAPI spec
```

## Technology Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Frontend framework | Angular 18 | Mature, typed, Material ecosystem |
| Standalone components | Yes | No NgModules boilerplate |
| State management | Signals + RxJS | No over-engineering for FASE 0 |
| Backend framework | .NET 10 | Strong typing, Clean Architecture fit |
| Validation | FluentValidation | Declarative, testable |
| Logging | Serilog | Structured logging, sink ecosystem |
| OpenAPI | Native .NET 10 | No Swashbuckle needed in .NET 10+ |
| Database | MongoDB | Document model suits Architecture storage |
| Containers | Docker Compose | Simple local orchestration |
