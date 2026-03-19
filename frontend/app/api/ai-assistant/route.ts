import { NextRequest, NextResponse } from 'next/server'
import { searchMemory, queryGraph, buildMemoryContent } from '@/lib/graphiti'

export async function POST(req: NextRequest) {
    try {
        const { query } = await req.json()

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        // Search Graphiti memory for relevant facts
        const [memoryResults, graphResults] = await Promise.allSettled([
            searchMemory({ query, limit: 8 }),
            queryGraph({ query, limit: 5 }),
        ])

        const facts = memoryResults.status === 'fulfilled' ? memoryResults.value : []
        const graph = graphResults.status === 'fulfilled' ? graphResults.value : null

        // Build context from Graphiti results
        let context = ''
        if (facts.length > 0) {
            context = facts
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map(f => `- ${f.fact}`)
                .join('\n')
        }

        // Compose answer from facts
        let answer = ''
        if (facts.length === 0) {
            answer = `Tôi chưa có thông tin về "${query}" trong bộ nhớ kho hàng. Hãy thực hiện một số giao dịch nhập/xuất kho để tôi có thể học và ghi nhớ các hoạt động!`
        } else {
            answer = `Dựa trên lịch sử kho hàng:\n\n${context}\n\n_Kết quả từ ${facts.length} bản ghi trong Graphiti Knowledge Graph._`
        }

        const sources = facts.slice(0, 3).map((_, i) => `Bản ghi #${i + 1}`)

        return NextResponse.json({ answer, sources, count: facts.length })
    } catch (error) {
        console.error('AI Assistant error:', error)
        return NextResponse.json(
            { error: 'Internal server error', answer: 'Đã xảy ra lỗi khi truy vấn Graphiti AI.' },
            { status: 500 }
        )
    }
}
