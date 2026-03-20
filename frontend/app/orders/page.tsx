'use client'
import { useState } from 'react'

const DEMO_ORDERS = [
    { id: 'PO-001', orderNo: 'PO-2026-001', status: 'received', supplier: 'Dell Vietnam', warehouse: 'Kho Hà Nội', totalAmount: 105000000, orderDate: '2026-03-15', expectedAt: '2026-03-18', items: 3 },
    { id: 'PO-002', orderNo: 'PO-2026-002', status: 'ordered', supplier: 'Samsung Vietnam', warehouse: 'Kho HCM', totalAmount: 68500000, orderDate: '2026-03-17', expectedAt: '2026-03-22', items: 2 },
    { id: 'PO-003', orderNo: 'PO-2026-003', status: 'pending', supplier: 'Logitech Việt Nam', warehouse: 'Kho Đà Nẵng', totalAmount: 24200000, orderDate: '2026-03-19', expectedAt: '2026-03-25', items: 4 },
    { id: 'PO-004', orderNo: 'PO-2026-004', status: 'draft', supplier: 'Sony Vietnam', warehouse: 'Kho HCM', totalAmount: 47400000, orderDate: '2026-03-20', expectedAt: '2026-03-28', items: 1 },
    { id: 'PO-005', orderNo: 'PO-2026-005', status: 'cancelled', supplier: 'Dell Vietnam', warehouse: 'Kho Hà Nội', totalAmount: 35000000, orderDate: '2026-03-10', expectedAt: '2026-03-14', items: 1 },
]

const STATUS = {
    draft: { label: 'Nháp', badge: 'badge-info' },
    pending: { label: 'Chờ duyệt', badge: 'badge-warning' },
    ordered: { label: 'Đã đặt', badge: 'badge-purple' },
    partial: { label: 'Nhập 1 phần', badge: 'badge-warning' },
    received: { label: 'Đã nhận', badge: 'badge-success' },
    cancelled: { label: 'Hủy', badge: 'badge-danger' },
}

export default function OrdersPage() {
    const [orders] = useState(DEMO_ORDERS)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showModal, setShowModal] = useState(false)

    const filtered = orders.filter(o => {
        const matchSearch = o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
            o.supplier.toLowerCase().includes(search.toLowerCase())
        const matchStatus = !statusFilter || o.status === statusFilter
        return matchSearch && matchStatus
    })

    const formatVND = (n: number) =>
        new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)

    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

    return (
        <div>
            <div className="animate-fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        Đơn <span className="gradient-text">Đặt hàng</span>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        {orders.length} đơn hàng • Tổng giá trị: {formatVND(totalValue)}
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setShowModal(true)}>+ Tạo đơn hàng</button>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
                {[
                    { label: 'Chờ duyệt', count: orders.filter(o => o.status === 'pending').length, color: '#f59e0b', icon: '⏳' },
                    { label: 'Đã đặt', count: orders.filter(o => o.status === 'ordered').length, color: '#7c3aed', icon: '📬' },
                    { label: 'Đã nhận', count: orders.filter(o => o.status === 'received').length, color: '#10b981', icon: '✅' },
                    { label: 'Đã hủy', count: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444', icon: '❌' },
                ].map((s, i) => (
                    <div key={s.label} className={`stat-card animate-fade-up-delay-${i + 1}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.375rem' }}>{s.label.toUpperCase()}</p>
                                <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.count}</p>
                            </div>
                            <span style={{ fontSize: '1.75rem' }}>{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card animate-fade-up" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem' }}>
                <input className="input-field" style={{ maxWidth: 280 }} placeholder="🔍  Tìm đơn hàng, nhà cung cấp..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <select className="input-field" style={{ maxWidth: 160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">Tất cả trạng thái</option>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <div style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: '0.8rem', alignSelf: 'center' }}>{filtered.length} kết quả</div>
            </div>

            {/* Table */}
            <div className="glass-card animate-fade-up" style={{ padding: '1.25rem', overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th><th>Nhà cung cấp</th><th>Kho nhận</th>
                            <th>SL mặt hàng</th><th>Giá trị</th><th>Ngày đặt</th><th>Dự kiến nhận</th><th>Trạng thái</th><th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(o => {
                            const st = STATUS[o.status as keyof typeof STATUS]
                            return (
                                <tr key={o.id}>
                                    <td>
                                        <code style={{ background: 'var(--bg-primary)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
                                            {o.orderNo}
                                        </code>
                                    </td>
                                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{o.supplier}</td>
                                    <td>{o.warehouse}</td>
                                    <td style={{ textAlign: 'center' }}>{o.items} SP</td>
                                    <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>{formatVND(o.totalAmount)}</td>
                                    <td>{new Date(o.orderDate).toLocaleDateString('vi-VN')}</td>
                                    <td>{new Date(o.expectedAt).toLocaleDateString('vi-VN')}</td>
                                    <td><span className={`badge ${st.badge}`}>{st.label}</span></td>
                                    <td>
                                        <button className="btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>Xem</button>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Order modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="glass-card" style={{ width: 480, padding: '1.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h2 style={{ fontWeight: 700 }}>Tạo đơn đặt hàng mới</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            {[
                                { label: 'Nhà cung cấp *', placeholder: 'Chọn nhà cung cấp...' },
                                { label: 'Kho nhận *', placeholder: 'Chọn kho...' },
                                { label: 'Ngày dự kiến nhận', placeholder: 'DD/MM/YYYY', type: 'date' },
                                { label: 'Ghi chú', placeholder: 'Ghi chú cho đơn hàng...' },
                            ].map(f => (
                                <div key={f.label}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.375rem' }}>{f.label}</label>
                                    <input className="input-field" type={f.type} placeholder={f.placeholder} />
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                            <button className="btn-primary" onClick={() => { alert('Tính năng hoạt động khi kết nối PostgreSQL!'); setShowModal(false) }}>Tạo đơn</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
