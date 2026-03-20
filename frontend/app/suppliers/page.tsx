'use client'
import { useState, useEffect } from 'react'

interface Supplier {
    id: string
    name: string
    email?: string | null
    phone?: string | null
    contactName?: string | null
    address?: string | null
    isActive: boolean
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({ name: '', email: '', phone: '', contactName: '', address: '' })

    useEffect(() => {
        fetch('/api/suppliers')
            .then(r => r.json())
            .then(setSuppliers)
            .catch(() => setSuppliers([
                { id: '1', name: 'Dell Vietnam', email: 'sales@dell.com.vn', phone: '028-3123-4567', contactName: 'Nguyễn Minh', address: 'Hà Nội', isActive: true },
                { id: '2', name: 'Samsung Vietnam', email: 'b2b@samsung.com.vn', phone: '024-3456-7890', contactName: 'Trần Thị Lan', address: 'HCM', isActive: true },
                { id: '3', name: 'Logitech Việt Nam', email: 'vn@logitech.com', phone: '028-9876-5432', contactName: 'Lê Văn Hùng', address: 'Đà Nẵng', isActive: true },
                { id: '4', name: 'Sony Vietnam', email: 'info@sony.com.vn', phone: '024-1234-5678', contactName: 'Phạm Thị Mai', address: 'Hà Nội', isActive: false },
            ]))
            .finally(() => setLoading(false))
    }, [])

    const filtered = suppliers.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.contactName || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div>
            <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Quản lý <span className="gradient-text">Nhà cung cấp</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {suppliers.filter(s => s.isActive).length} đang hợp tác • {suppliers.filter(s => !s.isActive).length} ngừng hợp tác
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Thêm NCC</button>
            </div>

            <div className="glass-card animate-fade-up" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <input className="input-field" style={{ maxWidth: 320 }} placeholder="🔍  Tìm nhà cung cấp..."
                    value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
                {loading ? <div style={{ color: 'var(--text-muted)', padding: '2rem' }}>Đang tải...</div> :
                    filtered.map((s, i) => (
                        <div key={s.id} className={`glass-card animate-fade-up-delay-${Math.min(i + 1, 4)}`} style={{ padding: '1.25rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.125rem', fontWeight: 700, color: 'white' }}>
                                        {s.name[0]}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{s.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.contactName || '—'}</div>
                                    </div>
                                </div>
                                <span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>
                                    {s.isActive ? 'Hoạt động' : 'Dừng'}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                                {s.email && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}><span>✉️</span>{s.email}</div>}
                                {s.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}><span>📞</span>{s.phone}</div>}
                                {s.address && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}><span>📍</span>{s.address}</div>}
                            </div>

                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                <button className="btn-secondary" style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem' }}>Sửa</button>
                                <button className="btn-primary" style={{ flex: 1, fontSize: '0.75rem', padding: '0.4rem' }}>Đặt hàng</button>
                            </div>
                        </div>
                    ))
                }
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: 480, padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontWeight: 700 }}>Thêm nhà cung cấp</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {[
                                { label: 'Tên công ty *', key: 'name', placeholder: 'Dell Vietnam...' },
                                { label: 'Email', key: 'email', placeholder: 'contact@company.com' },
                                { label: 'Điện thoại', key: 'phone', placeholder: '028-xxxx-xxxx' },
                                { label: 'Người liên hệ', key: 'contactName', placeholder: 'Nguyễn Văn A' },
                                { label: 'Địa chỉ', key: 'address', placeholder: 'Địa chỉ...' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>{f.label}</label>
                                    <input className="input-field" placeholder={f.placeholder}
                                        value={(form as any)[f.key]}
                                        onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={() => { alert('Tính năng hoạt động khi kết nối PostgreSQL!'); setShowModal(false) }}>Lưu</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
