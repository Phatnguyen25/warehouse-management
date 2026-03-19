# Warehouse Management System — DevSecOps

A modern warehouse management web application built with:
- **Next.js 14** (App Router) — Frontend & API
- **PostgreSQL** — Primary database (Docker)
- **Neo4j AuraDB** — Knowledge graph (Cloud)
- **Graphiti** — Long-term memory & entity relations (FastAPI)
- **Google Gemini 1.5 Flash** — AI/LLM
- **Docker Compose** — Container orchestration
- **GitHub Actions** — CI/CD with DevSecOps pipeline
- **Prometheus + Grafana** — Monitoring & alerting

## Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- [Neo4j AuraDB Free](https://neo4j.com/cloud/aura/) account
- [Google AI Studio](https://aistudio.google.com/apikey) API key

## Quick Start

```bash
# 1. Clone repo & setup env
git clone <your-repo>
cd bigLearn
cp .env.example .env
# Edit .env with your Neo4j AuraDB URI and Google API Key

# 2. Start all services
make dev

# 3. Open
# Frontend:         http://localhost:3000
# FastAPI docs:     http://localhost:8000/docs
# Grafana:          http://localhost:3001
```

## Development Commands

```bash
make dev        # Start dev environment
make down       # Stop all services
make logs       # View logs
make test       # Run tests
make scan       # Security scan (Trivy + Semgrep)
make db-migrate # Run Prisma migrations
make seed       # Seed database
```

## DevSecOps Pipeline

```
Push/PR --> SAST (Semgrep) --> SCA (Trivy) --> Build --> Image Scan --> Tests --> Deploy
           DAST (OWASP ZAP) runs nightly
```

## Architecture

```
bigLearn/
├── .github/workflows/     # CI/CD pipeline
├── frontend/              # Next.js 14 App Router
├── graphiti-service/      # Python FastAPI + Graphiti
├── database/              # PostgreSQL schema & migrations
└── monitoring/            # Prometheus + Grafana
```

## Environment Variables

See `.env.example` for all required variables.

## Security

- All secrets managed via `.env` (never committed)
- Pre-commit hooks for secret detection
- SAST, SCA, DAST in CI/CD pipeline
- Non-root Docker containers
- TLS via Traefik
