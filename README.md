# OCI Architecture Lab

> An interactive educational tool for learning Oracle Cloud Infrastructure architecture design.

## What is this?

OCI Architecture Lab transforms how engineers learn cloud architecture:

```
Problem → Visual Design → Structured Model → Validation → Simulation → Documentation → Terraform
```

You don't just draw diagrams. You **design**, **validate**, **simulate traffic**, and **generate Terraform** — all while learning why each architectural decision matters.

## Status: FASE 0 — Foundation ✅

| Component | Status |
|-----------|--------|
| Angular 18 frontend | ✅ Running |
| .NET 10 backend API | ✅ Running |
| MongoDB persistence | ✅ Running |
| Docker Compose | ✅ Ready |
| Unit tests (13) | ✅ Passing |
| Health checks | ✅ Configured |

## Upcoming Phases

| Phase | Description |
|-------|-------------|
| FASE 1 | Canvas MVP (Drag & Drop, Nodes, Connections) |
| FASE 2 | Architecture Model (Domain model, Serialization) |
| FASE 3 | OCI Catalog (VCN, Subnets, Compute, DB, LB...) |
| FASE 4 | Backend CRUD + MongoDB persistence |
| FASE 5 | Validation Engine |
| FASE 6 | Traffic Simulator |
| FASE 7 | Learning Mode |
| FASE 8 | Markdown Generator |
| FASE 9 | Terraform Generator |
| FASE 10 | Architecture Templates |

## Project Structure

```
oci-architecture-lab/
├── frontend/                      # Angular 18 (standalone)
│   ├── src/app/
│   │   ├── core/                  # Services, models
│   │   ├── shared/                # Reusable components
│   │   └── features/              # Feature modules
│   │       ├── architecture/      # CRUD, list view
│   │       ├── canvas/            # Visual designer (FASE 1)
│   │       ├── catalog/           # OCI component palette (FASE 3)
│   │       ├── inspector/         # Properties panel (FASE 1)
│   │       ├── validation/        # Rules engine (FASE 5)
│   │       ├── simulation/        # Traffic simulator (FASE 6)
│   │       ├── learning/          # Learning mode (FASE 7)
│   │       └── export/            # Markdown/Terraform (FASE 8-9)
│   └── Dockerfile
│
├── backend/                       # .NET 10 Clean Architecture
│   ├── src/
│   │   ├── OciArchitectureLab.Api/           # Controllers, Program.cs
│   │   ├── OciArchitectureLab.Application/   # Use Cases, DTOs
│   │   ├── OciArchitectureLab.Domain/        # Entities, Interfaces
│   │   └── OciArchitectureLab.Infrastructure/# MongoDB, Repositories
│   ├── tests/
│   │   ├── OciArchitectureLab.Unit.Tests/
│   │   └── OciArchitectureLab.Integration.Tests/
│   └── Dockerfile
│
├── infrastructure/
│   └── docker-compose.yml
│
└── docs/
    └── architecture.md            # Architectural decisions
```

## Quick Start

### Option A: Docker Compose (recommended)

```bash
# From the infrastructure/ directory
docker-compose up --build
```

Services:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **OpenAPI spec**: http://localhost:5000/openapi/v1.json
- **Health check**: http://localhost:5000/health

### Option B: Local development

**Prerequisites**: Node 20+, .NET 10, MongoDB running locally

```bash
# Terminal 1: Start backend
cd backend
dotnet run --project src/OciArchitectureLab.Api

# Terminal 2: Start frontend
cd frontend
npm run start
```

### Run tests

```bash
cd backend
dotnet test
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18, Angular Material, TypeScript |
| Backend | .NET 10, ASP.NET Core, C# |
| Architecture | Clean Architecture, SOLID, DDD |
| Validation | FluentValidation |
| Logging | Serilog |
| Database | MongoDB 7 |
| Containerization | Docker, Docker Compose |
| Testing | xUnit, Angular Karma/Jasmine |

## Design Philosophy

Every component must answer:
> **What problem does it solve?**

Every connection must answer:
> **Why do these components need to communicate?**

Every rule must answer:
> **What risk does it prevent?**

The goal is not to create software — it's to create a tool that helps engineers **think like cloud architects**.
