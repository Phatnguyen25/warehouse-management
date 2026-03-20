// Dashboard page - uses client-side fetching to avoid Next.js 16 RSC type conflicts
'use client'
import { useEffect, useState } from 'react'
import DashboardClient from '@/components/DashboardClient'

const EMPTY_DATA = {
  totalProducts: 0,
  totalSuppliers: 0,
  totalWarehouses: 0,
  totalItems: 0,
  recentTransactions: [] as Array<{ id: string; type: string; product: string; quantity: number; createdAt: string; createdBy: string }>,
  lowStockItems: [] as Array<{ id: string; product: string; quantity: number; minStock: number; warehouse: string }>,
}

export default function DashboardPage() {
  const [data, setData] = useState(EMPTY_DATA)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(setData)
      .catch(() => setData(EMPTY_DATA))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '3rem', animation: 'pulse-glow 1.5s infinite' }}>📦</div>
        <p style={{ color: 'var(--text-secondary)' }}>Đang tải dashboard...</p>
      </div>
    )
  }

  return <DashboardClient data={data} />
}
