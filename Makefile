SHELL := /bin/bash

ifneq (,$(wildcard .env))
include .env
export
endif

API_DIR := api
WEB_DIR := web
SOLUTION := $(API_DIR)/EMS.sln
API_PROJECT := $(API_DIR)/src/EMS.Api
INFRA_PROJECT := $(API_DIR)/src/EMS.Infrastructure

BASE_URL ?= http://localhost:5186
ASPNETCORE_URLS ?= http://localhost:5186
ASPNETCORE_ENVIRONMENT ?= Development

POSTGRES_DB ?= ems
POSTGRES_USER ?= ems
POSTGRES_PASSWORD ?=
CONNECTION_STRING ?= Host=localhost;Port=5432;Database=$(POSTGRES_DB);Username=$(POSTGRES_USER);Password=$(POSTGRES_PASSWORD)

JWT_SECRET ?=
JWT_ISSUER ?= EMS.Api
JWT_AUDIENCE ?= EMS.Clients
JWT_EXPIRATION_MINUTES ?= 60
SEED_PASSWORD ?=

.PHONY: help env-example docker-up docker-down docker-ps docker-logs restore build test verify clean format run migrate secrets-init secrets-set health swagger login-admin login-manager login-employee web-install web-dev web-lint web-test web-build web-verify

help:
	@echo "Available commands:"
	@echo "  make env-example      Create .env from .env.example if missing"
	@echo "  make docker-up        Start PostgreSQL with Docker Compose"
	@echo "  make docker-down      Stop Docker Compose services"
	@echo "  make docker-ps        Show Docker Compose service status"
	@echo "  make docker-logs      Show PostgreSQL logs"
	@echo "  make restore          Restore .NET packages"
	@echo "  make build            Build the .NET solution"
	@echo "  make test             Run all tests"
	@echo "  make verify           Build and test"
	@echo "  make clean            Clean the .NET solution"
	@echo "  make format           Run dotnet format"
	@echo "  make migrate          Apply EF Core migrations"
	@echo "  make run              Run the API"
	@echo "  make health           Check /health"
	@echo "  make swagger          Check Swagger JSON"
	@echo "  make secrets-init     Initialize user-secrets for the API"
	@echo "  make secrets-set      Set local API secrets using JWT_SECRET, SEED_PASSWORD, POSTGRES_PASSWORD"
	@echo "  make login-admin      Login with admin@ems.local using SEED_PASSWORD"
	@echo "  make login-manager    Login with manager@ems.local using SEED_PASSWORD"
	@echo "  make login-employee   Login with employee@ems.local using SEED_PASSWORD"
	@echo "  make web-install      Install web dependencies"
	@echo "  make web-dev          Start the React web app"
	@echo "  make web-lint         Lint the React web app"
	@echo "  make web-test         Test the React web app"
	@echo "  make web-build        Build the React web app"
	@echo "  make web-verify       Lint, test, and build the React web app"

env-example:
	@test -f .env || cp .env.example .env
	@echo ".env is ready. Set POSTGRES_PASSWORD before running Docker."

docker-up:
	@test -n "$(POSTGRES_PASSWORD)" || (echo "Set POSTGRES_PASSWORD, for example: make docker-up POSTGRES_PASSWORD=local-password" && exit 1)
	@POSTGRES_PASSWORD="$(POSTGRES_PASSWORD)" docker compose up -d

docker-down:
	@POSTGRES_PASSWORD="$(POSTGRES_PASSWORD)" docker compose down

docker-ps:
	@POSTGRES_PASSWORD="$(POSTGRES_PASSWORD)" docker compose ps

docker-logs:
	@POSTGRES_PASSWORD="$(POSTGRES_PASSWORD)" docker compose logs -f postgres

restore:
	cd $(API_DIR) && dotnet restore EMS.sln

build:
	cd $(API_DIR) && dotnet build EMS.sln --no-restore -v minimal -m:1 -nr:false -p:UseSharedCompilation=false

test:
	cd $(API_DIR) && dotnet test EMS.sln --no-build -v minimal

verify: build test

clean:
	cd $(API_DIR) && dotnet clean EMS.sln -v minimal

format:
	cd $(API_DIR) && dotnet format EMS.sln

migrate:
	@test -n "$(POSTGRES_PASSWORD)" || (echo "Set POSTGRES_PASSWORD" && exit 1)
	@cd $(API_DIR) && ConnectionStrings__DefaultConnection="$(CONNECTION_STRING)" dotnet ef database update --project src/EMS.Infrastructure --startup-project src/EMS.Api

run:
	@test -n "$(POSTGRES_PASSWORD)" || (echo "Set POSTGRES_PASSWORD" && exit 1)
	@test -n "$(JWT_SECRET)" || (echo "Set JWT_SECRET with at least 32 bytes" && exit 1)
	@test -n "$(SEED_PASSWORD)" || (echo "Set SEED_PASSWORD for demo account seeding" && exit 1)
	@cd $(API_DIR) && \
	ASPNETCORE_ENVIRONMENT="$(ASPNETCORE_ENVIRONMENT)" \
	ASPNETCORE_URLS="$(ASPNETCORE_URLS)" \
	Database__ApplyMigrationsOnStartup=true \
	Database__SeedOnStartup=true \
	ConnectionStrings__DefaultConnection="$(CONNECTION_STRING)" \
	Jwt__Secret="$(JWT_SECRET)" \
	Jwt__Issuer="$(JWT_ISSUER)" \
	Jwt__Audience="$(JWT_AUDIENCE)" \
	Jwt__ExpirationMinutes="$(JWT_EXPIRATION_MINUTES)" \
	SeedData__Password="$(SEED_PASSWORD)" \
	dotnet run --project src/EMS.Api

secrets-init:
	dotnet user-secrets init --project $(API_PROJECT)

secrets-set:
	@test -n "$(POSTGRES_PASSWORD)" || (echo "Set POSTGRES_PASSWORD" && exit 1)
	@test -n "$(JWT_SECRET)" || (echo "Set JWT_SECRET with at least 32 bytes" && exit 1)
	@test -n "$(SEED_PASSWORD)" || (echo "Set SEED_PASSWORD" && exit 1)
	@dotnet user-secrets set "ConnectionStrings:DefaultConnection" "$(CONNECTION_STRING)" --project $(API_PROJECT)
	@dotnet user-secrets set "Jwt:Secret" "$(JWT_SECRET)" --project $(API_PROJECT)
	@dotnet user-secrets set "Jwt:Issuer" "$(JWT_ISSUER)" --project $(API_PROJECT)
	@dotnet user-secrets set "Jwt:Audience" "$(JWT_AUDIENCE)" --project $(API_PROJECT)
	@dotnet user-secrets set "Jwt:ExpirationMinutes" "$(JWT_EXPIRATION_MINUTES)" --project $(API_PROJECT)
	@dotnet user-secrets set "SeedData:Password" "$(SEED_PASSWORD)" --project $(API_PROJECT)

health:
	curl -i "$(BASE_URL)/health"

swagger:
	curl -i "$(BASE_URL)/swagger/v1/swagger.json"

login-admin:
	@test -n "$(SEED_PASSWORD)" || (echo "Set SEED_PASSWORD" && exit 1)
	@curl -i -H "Content-Type: application/json" -d '{"email":"admin@ems.local","password":"$(SEED_PASSWORD)"}' "$(BASE_URL)/api/v1/auth/login"

login-manager:
	@test -n "$(SEED_PASSWORD)" || (echo "Set SEED_PASSWORD" && exit 1)
	@curl -i -H "Content-Type: application/json" -d '{"email":"manager@ems.local","password":"$(SEED_PASSWORD)"}' "$(BASE_URL)/api/v1/auth/login"

login-employee:
	@test -n "$(SEED_PASSWORD)" || (echo "Set SEED_PASSWORD" && exit 1)
	@curl -i -H "Content-Type: application/json" -d '{"email":"employee@ems.local","password":"$(SEED_PASSWORD)"}' "$(BASE_URL)/api/v1/auth/login"

web-install:
	cd $(WEB_DIR) && npm install

web-dev:
	cd $(WEB_DIR) && npm run dev

web-lint:
	cd $(WEB_DIR) && npm run lint

web-test:
	cd $(WEB_DIR) && npm run test

web-build:
	cd $(WEB_DIR) && npm run build

web-verify: web-lint web-test web-build
