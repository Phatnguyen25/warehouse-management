'use client'
import { useState, useEffect } from 'react'

interface InventoryItem {
    id: string
    quantity: number
    product: { name: string; sku: string; minStock: number; unit: string }
    warehouse: { name: string }
    location?: { code: string } | null
}

export default function InventoryPage() {
    const [inventory, setInventory] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [txType, setTxType] = useState<'import' | 'export'>('import')
    const [form, setForm] = useState({ productId: '', warehouseId: '', quantity: 0, note: '' })

    useEffect(() => {
        fetchInventory()
    }, [])

    async function fetchInventory() {
        try {
            const res = await fetch('/api/inventory')
            const data = await res.json()
            setInventory(data)
        } catch {
            // Demo data
            setInventory([
                { id: '1', quantity: 42, product: { name: 'Laptop Dell XPS 15', sku: 'SP001', minStock: 5, unit: 'cái' }, warehouse: { name: 'Kho Hà Nội' }, location: { code: 'A-01-03' } },
                { id: '2', quantity: 8, product: { name: 'Màn hình Samsung 27"', sku: 'SP002', minStock: 10, unit: 'cái' }, warehouse: { name: 'Kho HCM' }, location: { code: 'B-02-01' } },
                { id: '3', quantity: 3, product: { name: 'Bàn phím cơ Keychron', sku: 'SP003', minStock: 15, unit: 'cái' }, warehouse: { name: 'Kho Hà Nội' }, location: null },
                { id: '4', quantity: 56, product: { name: 'Chuột Logitech MX Master', sku: 'SP004', minStock: 20, unit: 'cái' }, warehouse: { name: 'Kho Đà Nẵng' }, location: { code: 'C-03-05' } },
                { id: '5', quantity: 0, product: { name: 'Tai nghe Sony WH-1000XM5', sku: 'SP005', minStock: 8, unit: 'cái' }, warehouse: { name: 'Kho HCM' }, location: null },
            ])
        } finally {
            setLoading(false)
        }
    }

    const filtered = inventory.filter(i =>
        i.product.name.toLowerCase().includes(search.toLowerCase()) ||
        i.product.sku.toLowerCase().includes(search.toLowerCase())
    )

    const getStockStatus = (qty: number, min: number) => {
        if (qty === 0) return { label: 'Hết hàng', badge: 'badge-danger' }
        if (qty <= min) return { label: 'Sắp hết', badge: 'badge-warning' }
        return { label: 'Đủ hàng', badge: 'badge-success' }
    }

    return (
        <div>
            {/* Header */}
            <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Quản lý <span className="gradient-text">Tồn kho</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {inventory.length} dòng sản phẩm • {inventory.filter(i => i.quantity <= i.product.minStock).length} sắp hết hàng
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn-secondary" onClick={() => { setTxType('export'); setShowModal(true) }}>
                        ↑ Xuất kho
                    </button>
                    <button className="btn-primary" onClick={() => { setTxType('import'); setShowModal(true) }}>
                        ↓ Nhập kho
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                {[
                    { label: 'Tổng dòng SP', value: inventory.length, icon: '📦', color: '#4f8ef7' },
                    { label: 'Sắp hết hàng', value: inventory.filter(i => i.quantity > 0 && i.quantity <= i.product.minStock).length, icon: '⚠️', color: '#f59e0b' },
                    { label: 'Hết hàng', value: inventory.filter(i => i.quantity === 0).length, icon: '🚨', color: '#ef4444' },
                ].map((s, i) => (
                    <div key={s.label} className={`stat-card animate-fade-up-delay-${i + 1}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.375rem' }}>{s.label.toUpperCase()}</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                            </div>
                            <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter + table */}
            <div className="glass-card animate-fade-up" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <input className="input-field" style={{ maxWidth: 320 }} placeholder="🔍  Tìm sản phẩm..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div className="glass-card animate-fade-up" style={{ padding: '1.25rem', overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>SKU</th><th>Sản phẩm</th><th>Kho</th><th>Vị trí</th>
                            <th>Tồn kho</th><th>Tối thiểu</th><th>Đơn vị</th><th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(item => {
                            const status = getStockStatus(item.quantity, item.product.minStock)
                            return (
                                <tr key={item.id}>
                                    <td><code style={{ background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{item.product.sku}</code></td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.product.name}</td>
                                    <td>{item.warehouse.name}</td>
                                    <td>{item.location?.code || <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                                    <td>
                                        <span style={{ fontSize: '1rem', fontWeight: 700, color: item.quantity === 0 ? 'var(--accent-danger)' : item.quantity <= item.product.minStock ? 'var(--accent-warning)' : 'var(--accent-success)' }}>
                                            {item.quantity.toLocaleString()}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-muted)' }}>{item.product.minStock}</td>
                                    <td>{item.product.unit}</td>
                                    <td><span className={`badge ${status.badge}`}>{status.label}</span></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Import/Export Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: 440, padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontWeight: 700 }}>{txType === 'import' ? '↓ Nhập kho' : '↑ Xuất kho'}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {[
                                { label: 'Sản phẩm', key: 'productId', type: 'text', placeholder: 'Nhập tên hoặc SKU...' },
                                { label: 'Kho', key: 'warehouseId', type: 'text', placeholder: 'Tên kho...' },
                                { label: 'Số lượng', key: 'quantity', type: 'number', placeholder: '0' },
                                { label: 'Ghi chú', key: 'note', type: 'text', placeholder: 'Ghi chú...' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>{f.label}</label>
                                    <input className="input-field" type={f.type} placeholder={f.placeholder}
                                        value={(form as any)[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))} />
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button
                                className="btn-primary"
                                style={{ background: txType === 'export' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : undefined }}
                                onClick={() => { alert('Tính năng hoạt động khi kết nối PostgreSQL!'); setShowModal(false) }}
                            >
                                {txType === 'import' ? 'Xác nhận nhập kho' : 'Xác nhận xuất kho'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
