'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
    { href: '/', icon: '▦', label: 'Dashboard' },
    { href: '/products', icon: '📦', label: 'Sản phẩm' },
    { href: '/inventory', icon: '🏭', label: 'Tồn kho' },
    { href: '/suppliers', icon: '🤝', label: 'Nhà cung cấp' },
    { href: '/orders', icon: '📋', label: 'Đơn đặt hàng' },
    { href: '/ai-assistant', icon: '🤖', label: 'AI Assistant' },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Logo */}
            <div style={{
                padding: '1.5rem 1rem 1rem',
                borderBottom: '1px solid var(--border)',
                marginBottom: '0.5rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <div style={{
                        width: 36, height: 36,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.125rem',
                    }}>📦</div>
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                            WareHouse
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                            MANAGEMENT
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav */}
            <nav style={{ flex: 1, padding: '0.5rem 0' }}>
                <div style={{ padding: '0.5rem 1rem 0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600 }}>
                    MENU
                </div>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`sidebar-item ${pathname === item.href ? 'active' : ''}`}
                    >
                        <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}

                <div style={{ padding: '1rem 1rem 0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', fontWeight: 600, marginTop: '0.5rem' }}>
                    HỆ THỐNG
                </div>
                <Link href="/settings" className={`sidebar-item ${pathname === '/settings' ? 'active' : ''}`}>
                    <span style={{ fontSize: '1rem', width: 20, textAlign: 'center' }}>⚙️</span>
                    Cài đặt
                </Link>
            </nav>

            {/* Footer */}
            <div style={{
                padding: '1rem',
                borderTop: '1px solid var(--border)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)', animation: 'pulse-glow 2s infinite' }}></div>
                    <span>Graphiti AI Online</span>
                </div>
                <div>Gemini 1.5 Flash • Neo4j AuraDB</div>
            </div>
        </aside>
    )
}
