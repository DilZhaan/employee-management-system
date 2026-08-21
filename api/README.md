# Enterprise Employee Management System API

Backend API for employee, department, attendance, leave, and authentication workflows.

## Requirements

- .NET 8 SDK
- Docker Desktop or a local PostgreSQL server
- EF Core CLI tool: `dotnet tool install --global dotnet-ef --version 8.0.11`

## Setup

From the repository root:

```bash
cp .env.example .env
```

Edit `.env` and set a local PostgreSQL password.

```bash
docker compose up -d
```

Configure local ASP.NET secrets from the `api` folder:

```bash
dotnet user-secrets init --project src/EMS.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=ems;Username=ems;Password=<your-db-password>" --project src/EMS.Api
dotnet user-secrets set "Jwt:Secret" "<long-local-jwt-secret-at-least-32-bytes>" --project src/EMS.Api
dotnet user-secrets set "SeedData:Password" "<demo-account-password>" --project src/EMS.Api
```

## Make Commands

The repository root includes a `Makefile` that loads `.env` automatically when it exists.

Create local configuration:

```bash
make env-example
```

Start PostgreSQL:

```bash
make docker-up
```

Configure user secrets:

```bash
make secrets-init
make secrets-set
```

Build and test:

```bash
make build
make test
make verify
```

Run the API:

```bash
make run
```

Check live endpoints:

```bash
make health
make swagger
make login-admin
make login-manager
make login-employee
```

You can override any `.env` value inline:

```bash
make run POSTGRES_PASSWORD=local-password JWT_SECRET=your-long-32-byte-minimum-secret SEED_PASSWORD=demo-password
```

## Database

In Development, the API applies migrations and seeds demo data on startup when `Database:ApplyMigrationsOnStartup` and `Database:SeedOnStartup` are enabled.

Manual migration command:

```bash
dotnet ef database update --project src/EMS.Infrastructure --startup-project src/EMS.Api
```

Seeded demo accounts:

- `admin@ems.local`
- `manager@ems.local`
- `employee@ems.local`

All use the local demo password configured in `SeedData:Password`. These are development/demo accounts only.

## Running

From the `api` folder:

```bash
dotnet run --project src/EMS.Api
```

Launch settings expose:

- HTTP: `http://localhost:5186`
- HTTPS: `https://localhost:7181`
- Swagger: `/swagger`

## Configuration

- `appsettings.json` contains non-secret defaults only.
- `appsettings.Development.json` contains local development settings only.
- `.env` is for Docker Compose and is ignored by Git.
- `.env.example` contains placeholders only.
- Local secrets should use .NET User Secrets.
- Production can use standard ASP.NET Core environment variables such as `Jwt__Secret` and `ConnectionStrings__DefaultConnection`.

Allowed frontend origins are configured under `Cors:AllowedOrigins`.

## Tests

From the `api` folder:

```bash
dotnet test EMS.sln
```

## Architecture

- `EMS.Domain`: entities, enums, and domain invariants.
- `EMS.Application`: DTOs, validators, service workflows, and abstractions.
- `EMS.Infrastructure`: EF Core, PostgreSQL repositories, BCrypt, JWT generation, migrations, and seeding.
- `EMS.Api`: controllers, JWT validation, current-user resolution, authorization, ProblemDetails, Swagger, CORS, and health checks.

HTTP controllers call application services. They do not query EF Core, hash passwords, or create tokens directly.

## Security

- Passwords are hashed with BCrypt.
- JWTs are signed and validated for issuer, audience, lifetime, and signing key.
- Identity comes from validated JWT claims.
- Role-based policies protect Admin and Manager operations.
- API responses never expose `PasswordHash`.
- Secrets are not stored in committed configuration files.
