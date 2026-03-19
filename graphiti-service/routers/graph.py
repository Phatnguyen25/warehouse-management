"""
Graph Router — Query entity graph from Neo4j via Graphiti
"""

import logging
from typing import Optional

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class EntityResponse(BaseModel):
    name: str
    entity_type: Optional[str] = None
    summary: Optional[str] = None
    uuid: str


class RelationResponse(BaseModel):
    source: str
    relation: str
    target: str
    fact: str
    created_at: Optional[str] = None


@router.get("/entities")
@limiter.limit("60/minute")
async def get_entities(
    request: Request,
    group_id: str = "warehouse",
    entity_type: Optional[str] = None,
    limit: int = 50
):
    """
    Get all extracted entities from the knowledge graph.
    
    Entity types Graphiti auto-extracts from warehouse events:
    - Product (san pham)
    - Supplier (nha cung cap)
    - Warehouse (kho)
    - User (nguoi dung)
    - Order (don hang)
    """
    graphiti = request.app.state.graphiti
    try:
        # Search for nodes in the graph
        results = await graphiti.search(
            query=entity_type or "entity",
            group_ids=[group_id],
            num_results=limit,
        )
        return {"entities": [], "count": 0, "note": "Use /memory/search to query the graph."}
    except Exception as e:
        logger.error(f"Error getting entities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/query")
@limiter.limit("30/minute")
async def query_graph(
    request: Request,
    body: dict,
):
    """
    Natural language query on the knowledge graph.
    
    Examples:
    - "Which products were supplied by Supplier A?"
    - "What happened in warehouse B last week?"
    - "Who imported product X?"
    """
    graphiti = request.app.state.graphiti
    query = body.get("query", "")
    group_id = body.get("group_id", "warehouse")
    limit = body.get("limit", 10)

    if not query:
        raise HTTPException(status_code=400, detail="Query is required")

    try:
        results = await graphiti.search(
            query=query,
            group_ids=[group_id],
            num_results=limit,
        )

        facts = [
            {
                "fact": edge.fact,
                "score": edge.score if hasattr(edge, 'score') else 1.0,
                "created_at": str(edge.created_at) if hasattr(edge, 'created_at') else None,
            }
            for edge in results
        ]

        return {
            "query": query,
            "results": facts,
            "count": len(facts)
        }
    except Exception as e:
        logger.error(f"Error querying graph: {e}")
        raise HTTPException(status_code=500, detail=str(e))
