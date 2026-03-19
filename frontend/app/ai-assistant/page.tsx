'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
    role: 'user' | 'ai'
    content: string
    timestamp: Date
    sources?: string[]
}

const SUGGESTED = [
    'Sản phẩm nào đang sắp hết hàng?',
    'Lịch sử nhập kho tuần này?',
    'Nhà cung cấp nào cung ứng nhiều nhất?',
    'Tổng giá trị tồn kho hiện tại?',
]

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'ai',
            content: '👋 Xin chào! Tôi là **Warehouse AI Assistant** được cung cấp bởi **Gemini 1.5 Flash** và **Graphiti**.\n\nTôi có thể:\n- 🔍 Tìm kiếm thông tin trong lịch sử kho\n- 📊 Phân tích xu hướng nhập/xuất\n- ⚠️ Cảnh báo tồn kho sắp hết\n- 🤝 Gợi ý việc đặt hàng từ nhà cung cấp\n\nHãy hỏi tôi bất cứ điều gì về kho hàng!',
            timestamp: new Date(),
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    async function sendMessage(text?: string) {
        const query = text || input.trim()
        if (!query || loading) return

        setInput('')
        const userMsg: Message = { role: 'user', content: query, timestamp: new Date() }
        setMessages(prev => [...prev, userMsg])
        setLoading(true)

        try {
            const res = await fetch('/api/ai-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            })
            const data = await res.json()

            setMessages(prev => [...prev, {
                role: 'ai',
                content: data.answer || 'Xin lỗi, tôi không tìm thấy thông tin liên quan.',
                timestamp: new Date(),
                sources: data.sources,
            }])
        } catch {
            setMessages(prev => [...prev, {
                role: 'ai',
                content: '⚠️ **Demo mode**: Graphiti service chưa kết nối. Sau khi chạy `make dev` và điền `.env`, AI assistant sẽ hoạt động đầy đủ với dữ liệu thực từ Neo4j AuraDB.\n\n**Ví dụ câu trả lời thực:** "Trong 7 ngày qua, đã có 15 giao dịch nhập kho với tổng 450 sản phẩm từ 3 nhà cung cấp..."',
                timestamp: new Date(),
            }])
        } finally {
            setLoading(false)
        }
    }

    function formatContent(content: string) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br/>')
    }

    return (
        <div style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Header */}
            <div className="animate-fade-up" style={{ flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 44, height: 44, borderRadius: '12px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.375rem',
                    }}>🤖</div>
                    <div>
                        <h1 style={{ fontSize: '1.375rem', fontWeight: 700 }}>
                            AI <span className="gradient-text">Assistant</span>
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                            Gemini 1.5 Flash • Graphiti Memory • Neo4j AuraDB
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <span className="badge badge-success">● Graphiti Online</span>
                    </div>
                </div>
            </div>

            {/* Chat Window */}
            <div className="glass-card animate-fade-up" style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                padding: 0,
            }}>
                {/* Messages */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                }}>
                    {messages.map((msg, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            gap: '0.25rem',
                        }}>
                            {/* Avatar */}
                            {msg.role === 'ai' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.125rem' }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '8px',
                                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.75rem',
                                    }}>🤖</div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Warehouse AI</span>
                                </div>
                            )}

                            <div
                                className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}
                                dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
                            />

                            {msg.sources && msg.sources.length > 0 && (
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                    📚 Nguồn: {msg.sources.join(' • ')}
                                </div>
                            )}

                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                {msg.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="chat-bubble-ai" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                {[0, 1, 2].map(i => (
                                    <div key={i} style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: 'var(--accent-primary)',
                                        animation: `pulse-glow 1s ${i * 0.2}s infinite`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions */}
                <div style={{
                    padding: '0.75rem 1.25rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                }}>
                    {SUGGESTED.map(s => (
                        <button key={s} className="btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '0.3rem 0.75rem' }}
                            onClick={() => sendMessage(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Input */}
                <div style={{
                    padding: '0.875rem 1.25rem',
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'center',
                }}>
                    <input
                        className="input-field"
                        placeholder="Hỏi về kho hàng, lịch sử giao dịch, nhà cung cấp..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        disabled={loading}
                    />
                    <button
                        className="btn-primary"
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        style={{ flexShrink: 0, padding: '0.65rem 1.25rem' }}
                    >
                        Gửi ⟶
                    </button>
                </div>
            </div>
        </div>
    )
}
