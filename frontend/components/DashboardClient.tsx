'use client'

interface DashboardData {
    totalProducts: number
    totalSuppliers: number
    totalWarehouses: number
    totalItems: number
    recentTransactions: Array<{
        id: string
        type: string
        product: string
        quantity: number
        createdAt: string
        createdBy: string
    }>
    lowStockItems: Array<{
        id: string
        product: string
        quantity: number
        minStock: number
        warehouse: string
    }>
}

const typeLabel: Record<string, { label: string; badge: string }> = {
    import: { label: 'Nhập kho', badge: 'badge-success' },
    export: { label: 'Xuất kho', badge: 'badge-danger' },
    transfer: { label: 'Chuyển kho', badge: 'badge-info' },
    adjustment: { label: 'Điều chỉnh', badge: 'badge-warning' },
    return: { label: 'Trả hàng', badge: 'badge-purple' },
}

export default function DashboardClient({ data }: { data: DashboardData }) {
    const stats = [
        { label: 'Tổng sản phẩm', value: data.totalProducts, icon: '📦', color: '#4f8ef7', sub: 'sản phẩm đang hoạt động' },
        { label: 'Tồn kho', value: data.totalItems.toLocaleString(), icon: '🏭', color: '#10b981', sub: 'tổng số lượng' },
        { label: 'Nhà cung cấp', value: data.totalSuppliers, icon: '🤝', color: '#f59e0b', sub: 'đang hợp tác' },
        { label: 'Kho hàng', value: data.totalWarehouses, icon: '🏪', color: '#7c3aed', sub: 'kho đang hoạt động' },
    ]

    return (
        <div>
            {/* Header */}
            <div className="animate-fade-up" style={{ marginBottom: '1.75rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    Tổng quan <span className="gradient-text">Dashboard</span>
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>

            {/* Stat Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem',
            }}>
                {stats.map((s, i) => (
                    <div key={s.label} className={`stat-card animate-fade-up-delay-${i + 1}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                                    {s.label.toUpperCase()}
                                </p>
                                <p style={{ fontSize: '2rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                                    {s.value}
                                </p>
                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.375rem' }}>
                                    {s.sub}
                                </p>
                            </div>
                            <div style={{
                                width: 44, height: 44, borderRadius: '12px',
                                background: `${s.color}22`,
                                border: `1px solid ${s.color}33`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.375rem', flexShrink: 0,
                            }}>{s.icon}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main content row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1rem' }}>
                {/* Recent Transactions Table */}
                <div className="glass-card animate-fade-up" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Giao dịch gần đây
                        </h2>
                        <a href="/inventory" style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textDecoration: 'none' }}>
                            Xem tất cả →
                        </a>
                    </div>

                    {data.recentTransactions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📋</div>
                            <p>Chưa có giao dịch nào</p>
                            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Bắt đầu nhập kho để thấy dữ liệu</p>
                        </div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Loại</th>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Người thực hiện</th>
                                    <th>Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentTransactions.map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <span className={`badge ${typeLabel[t.type]?.badge || 'badge-info'}`}>
                                                {typeLabel[t.type]?.label || t.type}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{t.product}</td>
                                        <td style={{ fontWeight: 600 }}>{t.quantity.toLocaleString()}</td>
                                        <td>{t.createdBy}</td>
                                        <td>{new Date(t.createdAt).toLocaleDateString('vi-VN')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Right Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* AI Memory Card */}
                    <div className="glass-card animate-fade-up" style={{
                        padding: '1.25rem',
                        background: 'linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,58,237,0.08))',
                        borderColor: 'rgba(79,142,247,0.25)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>🤖</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Graphiti AI Memory</span>
                            <div style={{ marginLeft: 'auto' }}>
                                <span className="badge badge-success">Online</span>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '0.875rem' }}>
                            AI đang học và ghi nhớ mọi hoạt động trong kho. Hỏi bất cứ điều gì về lịch sử kho hàng.
                        </p>
                        <a href="/ai-assistant" className="btn-primary" style={{ display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                            Mở AI Assistant →
                        </a>
                    </div>

                    {/* Low Stock Alert */}
                    <div className="glass-card animate-fade-up" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Sắp hết hàng</span>
                        </div>

                        {data.lowStockItems.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
                                <p style={{ fontSize: '0.8rem' }}>Tồn kho ổn định</p>
                            </div>
                        ) : (
                            data.lowStockItems.map(item => (
                                <div key={item.id} style={{
                                    padding: '0.625rem 0',
                                    borderBottom: '1px solid var(--border)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.product}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-danger)' }}>{item.quantity}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{
                                            width: `${Math.min((item.quantity / Math.max(item.minStock, 1)) * 100, 100)}%`,
                                            background: item.quantity <= item.minStock / 2 ? 'var(--accent-danger)' : 'var(--accent-warning)',
                                        }} />
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                        {item.warehouse} • Tối thiểu: {item.minStock}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
