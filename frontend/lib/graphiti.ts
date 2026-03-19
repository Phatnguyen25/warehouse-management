/**
 * Graphiti Service Client
 * Connects Next.js to the Python FastAPI Graphiti service
 */

const GRAPHITI_BASE_URL = process.env.GRAPHITI_SERVICE_URL || 'http://localhost:8000'
const GRAPHITI_API_KEY = process.env.GRAPHITI_API_KEY || ''

const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': GRAPHITI_API_KEY,
}

// ---- Types ----

export interface MemoryResult {
    fact: string
    score: number
    created_at?: string
    source?: string
}

export interface GraphQueryResult {
    query: string
    results: Array<{ fact: string; score: number; created_at?: string }>
    count: number
}

// ---- Functions ----

/**
 * Add a memory episode to Graphiti
 * Call this after any significant warehouse event
 */
export async function addMemory(params: {
    content: string
    userId: string
    groupId?: string
    sourceDescription?: string
}) {
    const res = await fetch(`${GRAPHITI_BASE_URL}/memory/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            content: params.content,
            user_id: params.userId,
            group_id: params.groupId || 'warehouse',
            source_description: params.sourceDescription,
        }),
    })

    if (!res.ok) throw new Error(`Graphiti add memory failed: ${res.statusText}`)
    return res.json()
}

/**
 * Search memories — used by AI Assistant
 */
export async function searchMemory(params: {
    query: string
    groupId?: string
    limit?: number
}): Promise<MemoryResult[]> {
    const res = await fetch(`${GRAPHITI_BASE_URL}/memory/search`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            query: params.query,
            group_id: params.groupId || 'warehouse',
            limit: params.limit || 10,
        }),
    })

    if (!res.ok) throw new Error(`Graphiti search failed: ${res.statusText}`)
    return res.json()
}

/**
 * Natural language query on the knowledge graph
 */
export async function queryGraph(params: {
    query: string
    groupId?: string
    limit?: number
}): Promise<GraphQueryResult> {
    const res = await fetch(`${GRAPHITI_BASE_URL}/graph/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            query: params.query,
            group_id: params.groupId || 'warehouse',
            limit: params.limit || 10,
        }),
    })

    if (!res.ok) throw new Error(`Graphiti graph query failed: ${res.statusText}`)
    return res.json()
}

/**
 * Helper: Log warehouse activity to both DB and Graphiti
 */
export function buildMemoryContent(params: {
    action: string
    actor: string
    subject: string
    details?: string
}): string {
    const { action, actor, subject, details } = params
    const timestamp = new Date().toISOString()
    return `[${timestamp}] ${actor} ${action} ${subject}${details ? `. ${details}` : ''}.`
}
