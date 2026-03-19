"""
Memory Router — Add and search long-term memory via Graphiti
"""

import logging
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from slowapi import Limiter
from slowapi.util import get_remote_address

from graphiti_core.nodes import EpisodeType

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


# ---- Schemas ----

class AddMemoryRequest(BaseModel):
    content: str                              # Human-readable event description
    user_id: str                              # Who performed the action
    group_id: Optional[str] = "warehouse"    # Group/namespace for this memory
    source_description: Optional[str] = None # Context e.g. 'inventory transaction'
    reference_time: Optional[datetime] = None

class AddMemoryResponse(BaseModel):
    episode_id: str
    message: str

class SearchMemoryRequest(BaseModel):
    query: str
    group_id: Optional[str] = "warehouse"
    user_id: Optional[str] = None
    limit: Optional[int] = 10

class MemoryResult(BaseModel):
    fact: str
    score: float
    created_at: Optional[str] = None
    source: Optional[str] = None


# ---- Endpoints ----

@router.post("/add", response_model=AddMemoryResponse)
@limiter.limit("30/minute")
async def add_memory(request: Request, body: AddMemoryRequest):
    """
    Add a new memory episode to Graphiti.
    
    Use this when:
    - A user creates/updates/deletes a product
    - Stock is imported or exported
    - A purchase order is placed or received
    - Any significant business event occurs
    
    Graphiti will automatically:
    - Extract entities (products, suppliers, users)
    - Create relationships between entities
    - Store temporal context
    """
    graphiti = request.app.state.graphiti

    try:
        episode = await graphiti.add_episode(
            name=f"{body.user_id}_{datetime.now().isoformat()}",
            episode_body=body.content,
            source=EpisodeType.text,
            source_description=body.source_description or "warehouse_event",
            group_id=body.group_id,
            reference_time=body.reference_time or datetime.now(),
        )
        logger.info(f"Memory added: {body.content[:80]}...")
        return AddMemoryResponse(
            episode_id=str(episode.uuid),
            message="Memory stored successfully"
        )
    except Exception as e:
        logger.error(f"Error adding memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/search", response_model=list[MemoryResult])
@limiter.limit("60/minute")
async def search_memory(request: Request, body: SearchMemoryRequest):
    """
    Search through stored memories using semantic + graph search.
    
    Use this for:
    - AI assistant queries ("Which products are low in stock?")
    - History tracking ("What did supplier X deliver last month?")
    - Anomaly detection
    """
    graphiti = request.app.state.graphiti

    try:
        results = await graphiti.search(
            query=body.query,
            group_ids=[body.group_id] if body.group_id else None,
            num_results=body.limit,
        )

        return [
            MemoryResult(
                fact=edge.fact,
                score=edge.score if hasattr(edge, 'score') else 1.0,
                created_at=str(edge.created_at) if hasattr(edge, 'created_at') else None,
                source=str(edge.source_node_uuid) if hasattr(edge, 'source_node_uuid') else None,
            )
            for edge in results
        ]
    except Exception as e:
        logger.error(f"Error searching memory: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/group/{group_id}")
async def clear_group_memory(request: Request, group_id: str):
    """Clear all memories for a specific group (use carefully!)"""
    graphiti = request.app.state.graphiti
    try:
        await graphiti.delete_group(group_id)
        return {"message": f"All memories for group '{group_id}' cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
