"""Configuration using Pydantic Settings"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Neo4j AuraDB
    NEO4J_URI: str
    NEO4J_USERNAME: str
    NEO4J_PASSWORD: str
    NEO4J_DATABASE: str = "neo4j"  # AuraDB instance name

    # Google Gemini
    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-1.5-flash-latest"

    # Security
    GRAPHITI_API_KEY: str
    FRONTEND_URL: str = "http://localhost:3000"

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
