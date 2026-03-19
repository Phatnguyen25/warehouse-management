'use client'
import { useState, useEffect } from 'react'

interface Product {
    id: string
    sku: string
    name: string
    unit: string
    price: number
    cost: number
    minStock: number
    isActive: boolean
    category?: { name: string } | null
    supplier?: { name: string } | null
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [newProduct, setNewProduct] = useState({
        sku: '', name: '', unit: 'piece', price: 0, cost: 0, minStock: 0, description: ''
    })

    useEffect(() => {
        fetchProducts()
    }, [])

    async function fetchProducts() {
        try {
            const res = await fetch('/api/products')
            const data = await res.json()
            setProducts(data)
        } catch {
            // demo data when DB not ready
            setProducts([
                { id: '1', sku: 'SP001', name: 'Laptop Dell XPS 15', unit: 'cái', price: 35000000, cost: 28000000, minStock: 5, isActive: true, category: { name: 'Điện tử' }, supplier: { name: 'Dell Vietnam' } },
                { id: '2', sku: 'SP002', name: 'Màn hình Samsung 27"', unit: 'cái', price: 8500000, cost: 6500000, minStock: 10, isActive: true, category: { name: 'Điện tử' }, supplier: { name: 'Samsung' } },
                { id: '3', sku: 'SP003', name: 'Bàn phím cơ Keychron', unit: 'cái', price: 2200000, cost: 1600000, minStock: 15, isActive: true, category: { name: 'Phụ kiện' }, supplier: { name: 'Keychron' } },
                { id: '4', sku: 'SP004', name: 'Chuột Logitech MX Master', unit: 'cái', price: 1800000, cost: 1200000, minStock: 20, isActive: true, category: { name: 'Phụ kiện' }, supplier: { name: 'Logitech' } },
                { id: '5', sku: 'SP005', name: 'Tai nghe Sony WH-1000XM5', unit: 'cái', price: 7900000, cost: 5800000, minStock: 8, isActive: false, category: { name: 'Âm thanh' }, supplier: { name: 'Sony' } },
            ])
        } finally {
            setLoading(false)
        }
    }

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    )

    const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

    return (
        <div>
            {/* Header */}
            <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Quản lý <span className="gradient-text">Sản phẩm</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {products.length} sản phẩm trong hệ thống
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    + Thêm sản phẩm
                </button>
            </div>

            {/* Filter bar */}
            <div className="glass-card animate-fade-up" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                    className="input-field"
                    style={{ maxWidth: 280 }}
                    placeholder="🔍  Tìm theo tên, SKU..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select className="input-field" style={{ maxWidth: 160 }}>
                    <option value="">Tất cả danh mục</option>
                    <option>Điện tử</option>
                    <option>Phụ kiện</option>
                    <option>Âm thanh</option>
                </select>
                <select className="input-field" style={{ maxWidth: 140 }}>
                    <option value="">Tất cả trạng thái</option>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngừng bán</option>
                </select>
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {filtered.length} kết quả
                </div>
            </div>

            {/* Table */}
            <div className="glass-card animate-fade-up" style={{ padding: '1.25rem', overflowX: 'auto' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', animation: 'spin 1s linear infinite' }}>⟳</div>
                        Đang tải...
                    </div>
                ) : (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>SKU</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Nhà cung cấp</th>
                                <th>Giá bán</th>
                                <th>Giá vốn</th>
                                <th>Tồn tối thiểu</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <code style={{ background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                                            {p.sku}
                                        </code>
                                    </td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{p.name}</td>
                                    <td>{p.category?.name || '—'}</td>
                                    <td>{p.supplier?.name || '—'}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>{formatVND(p.price)}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{formatVND(p.cost)}</td>
                                    <td style={{ textAlign: 'center' }}>{p.minStock}</td>
                                    <td>
                                        <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {p.isActive ? '● Hoạt động' : '○ Ngừng bán'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                                            <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Sửa</button>
                                            <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--accent-danger)', borderRadius: 'var(--radius-sm)', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer' }}>Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000,
                }}>
                    <div className="glass-card" style={{ width: 520, padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontWeight: 700 }}>Thêm sản phẩm mới</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem' }}>
                            {[
                                { label: 'SKU *', key: 'sku', type: 'text', placeholder: 'SP001' },
                                { label: 'Đơn vị', key: 'unit', type: 'text', placeholder: 'cái' },
                                { label: 'Tên sản phẩm *', key: 'name', type: 'text', placeholder: 'Tên sản phẩm', span: true },
                                { label: 'Giá bán (VND)', key: 'price', type: 'number', placeholder: '0' },
                                { label: 'Giá vốn (VND)', key: 'cost', type: 'number', placeholder: '0' },
                                { label: 'Tồn kho tối thiểu', key: 'minStock', type: 'number', placeholder: '0' },
                            ].map(f => (
                                <div key={f.key} style={{ gridColumn: (f as any).span ? '1 / -1' : undefined }}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>{f.label}</label>
                                    <input
                                        className="input-field"
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        value={(newProduct as any)[f.key]}
                                        onChange={e => setNewProduct(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))}
                                    />
                                </div>
                            ))}
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>Mô tả</label>
                                <textarea
                                    className="input-field"
                                    rows={3}
                                    placeholder="Mô tả sản phẩm..."
                                    value={newProduct.description}
                                    onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))}
                                    style={{ resize: 'vertical' }}
                                />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={() => {
                                alert('Tính năng sẽ hoạt động khi kết nối PostgreSQL!')
                                setShowModal(false)
                            }}>
                                Lưu sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
