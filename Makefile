.PHONY: dev down logs test scan build prod db-migrate seed help

# Default
help:
	@echo "Warehouse Management System - DevSecOps"
	@echo ""
	@echo "Commands:"
	@echo "  make dev         Start dev environment"
	@echo "  make down        Stop all services"
	@echo "  make logs        View all logs"
	@echo "  make build       Build all Docker images"
	@echo "  make prod        Start production environment"
	@echo "  make test        Run all tests"
	@echo "  make scan        Run security scans (Trivy + Semgrep)"
	@echo "  make db-migrate  Run Prisma migrations"
	@echo "  make seed        Seed the database"
	@echo "  make clean       Remove all containers and volumes"

# ---- Development ----
dev:
	@echo "Starting dev environment..."
	docker compose up --build -d
	@echo "Frontend:     http://localhost:3000"
	@echo "FastAPI docs: http://localhost:8000/docs"
	@echo "Grafana:      http://localhost:3001"
	@echo "Neo4j is on AuraDB (cloud)"

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

# ---- Production ----
prod:
	docker compose -f docker-compose.prod.yml up --build -d

# ---- Database ----
db-migrate:
	docker compose exec frontend npx prisma migrate dev

db-generate:
	docker compose exec frontend npx prisma generate

seed:
	docker compose exec frontend npx prisma db seed

db-studio:
	docker compose exec frontend npx prisma studio

# ---- Testing ----
test:
	@echo "Running frontend tests..."
	docker compose exec frontend npm run test
	@echo "Running graphiti service tests..."
	docker compose exec graphiti-service pytest

test-e2e:
	docker compose exec frontend npm run test:e2e

# ---- Security Scanning ----
scan: scan-trivy scan-semgrep scan-secrets

scan-trivy:
	@echo "Running Trivy scan..."
	trivy fs . --severity HIGH,CRITICAL --exit-code 1 || true

scan-semgrep:
	@echo "Running Semgrep SAST..."
	semgrep scan --config=auto . || true

scan-secrets:
	@echo "Scanning for secrets..."
	detect-secrets scan . || true

scan-image:
	@echo "Scanning Docker images..."
	trivy image warehouse-frontend:latest || true
	trivy image warehouse-graphiti:latest || true

# ---- Utilities ----
clean:
	docker compose down -v --remove-orphans
	docker system prune -f

shell-frontend:
	docker compose exec frontend sh

shell-graphiti:
	docker compose exec graphiti-service bash

shell-db:
	docker compose exec db psql -U warehouse_user -d warehouse_db

# ---- Git helpers ----
git-init:
	@echo "Initializing git repo..."
	git init
	git add .
	git commit -m "feat: initial project setup with DevSecOps structure"
	@echo ""
	@echo "Next: Create a GitHub repo and run:"
	@echo "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
	@echo "  git push -u origin main"
