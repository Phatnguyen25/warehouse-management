"""
Graphiti FastAPI Service
Warehouse Management System — DevSecOps
LLM: Google Gemini 1.5 Flash
Graph DB: Neo4j AuraDB (Cloud)
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import APIKeyHeader
from prometheus_fastapi_instrumentator import Instrumentator
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import settings
from graphiti_client import get_graphiti_client
from routers import memory, graph

# Logging
logging.basicConfig(
    format='{"time": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

# API Key header
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=True)


def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key != settings.GRAPHITI_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )
    return api_key


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("Starting Graphiti service...")
    # Initialize Graphiti client (connects to Neo4j AuraDB)
    app.state.graphiti = await get_graphiti_client()
    logger.info("Graphiti client initialized — connected to Neo4j AuraDB")
    yield
    logger.info("Shutting down Graphiti service...")
    await app.state.graphiti.close()


# App
app = FastAPI(
    title="Warehouse Graphiti Service",
    description="Long-term memory & knowledge graph powered by Graphiti + Gemini 1.5 Flash + Neo4j AuraDB",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Rate limit handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — only allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)

# Prometheus metrics
Instrumentator().instrument(app).expose(app, endpoint="/metrics")

# Routers
app.include_router(
    memory.router,
    prefix="/memory",
    tags=["Memory"],
    dependencies=[Depends(verify_api_key)]
)
app.include_router(
    graph.router,
    prefix="/graph",
    tags=["Knowledge Graph"],
    dependencies=[Depends(verify_api_key)]
)


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint (no auth required)"""
    return {"status": "healthy", "service": "graphiti", "llm": "gemini-1.5-flash"}


@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Warehouse Graphiti Service. See /docs for API reference."}
