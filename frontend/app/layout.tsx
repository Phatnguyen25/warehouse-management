import type { Metadata } from 'next'
import './globals.css'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'

export const metadata: Metadata = {
  title: 'Warehouse Manager — DevSecOps + Graphiti AI',
  description: 'Modern warehouse management system with AI-powered memory and knowledge graph',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <TopBar />
            <main style={{
              flex: 1,
              padding: '1.5rem',
              overflowY: 'auto',
              background: 'var(--bg-primary)',
            }}>
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
