'use client'
import { useState } from 'react'

export default function TopBar() {
    const [search, setSearch] = useState('')

    return (
        <header style={{
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            padding: '0.875rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
        }}>
            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 360, flex: 1 }}>
                <span style={{
                    position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    fontSize: '0.875rem', color: 'var(--text-muted)',
                }}>🔍</span>
                <input
                    className="input-field"
                    style={{ paddingLeft: '2.25rem' }}
                    placeholder="Tìm kiếm sản phẩm, đơn hàng..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {/* Notification bell */}
                <button style={{
                    background: 'transparent', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.625rem',
                    cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1rem',
                    position: 'relative',
                    transition: 'all 0.2s',
                }}>
                    🔔
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 16, height: 16, borderRadius: '50%',
                        background: 'var(--accent-danger)',
                        fontSize: '0.6rem', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700,
                    }}>3</span>
                </button>

                {/* Divider */}
                <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

                {/* User avatar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.875rem', fontWeight: 700, color: 'white',
                    }}>A</div>
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Admin</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Quản trị viên</div>
                    </div>
                </div>
            </div>
        </header>
    )
}
