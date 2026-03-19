"""
Graphiti client initialization
Connects to Neo4j AuraDB using Gemini 1.5 Flash as LLM
"""

import logging
from graphiti_core import Graphiti
from graphiti_core.llm_client.gemini_client import GeminiClient, LLMConfig
from graphiti_core.embedder.gemini import GeminiEmbedder, EmbedderConfig

from config import settings

logger = logging.getLogger(__name__)


async def get_graphiti_client() -> Graphiti:
    """
    Initialize Graphiti with:
    - LLM: Google Gemini 1.5 Flash
    - Graph DB: Neo4j AuraDB (neo4j+s://...)
    - Embedder: Google text-embedding-004
    """
    llm_client = GeminiClient(
        config=LLMConfig(
            api_key=settings.GOOGLE_API_KEY,
            model=settings.GEMINI_MODEL,
        )
    )

    embedder = GeminiEmbedder(
        config=EmbedderConfig(
            api_key=settings.GOOGLE_API_KEY,
            model="models/text-embedding-004",
        )
    )

    graphiti = Graphiti(
        uri=settings.NEO4J_URI,           # neo4j+s://xxxx.databases.neo4j.io
        user=settings.NEO4J_USERNAME,
        password=settings.NEO4J_PASSWORD,
        llm_client=llm_client,
        embedder=embedder,
    )

    # Build indexes on startup (idempotent)
    await graphiti.build_indices_and_constraints()
    logger.info("Graphiti connected to Neo4j AuraDB and indexes built")

    return graphiti
