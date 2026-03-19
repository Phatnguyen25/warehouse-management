import { prisma } from '@/lib/db'
import DashboardClient from '@/components/DashboardClient'

async function getDashboardData() {
  try {
    const [
      totalProducts,
      totalSuppliers,
      totalWarehouses,
      recentTransactions,
      lowStockItems,
    ] = await Promise.all([
      prisma.product.count({ where: { isActive: true } }),
      prisma.supplier.count({ where: { isActive: true } }),
      prisma.warehouse.count({ where: { isActive: true } }),
      prisma.stockTransaction.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { product: true, createdBy: true },
      }),
      prisma.inventory.findMany({
        where: {
          product: { isActive: true },
          quantity: { lte: prisma.product.fields.minStock },
        },
        include: { product: true, warehouse: true },
        take: 5,
      }).catch(() => []),
    ])

    const inventoryValue = await prisma.inventory.aggregate({
      _sum: { quantity: true },
    })

    return {
      totalProducts,
      totalSuppliers,
      totalWarehouses,
      totalItems: inventoryValue._sum.quantity || 0,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.transactionType,
        product: t.product.name,
        quantity: t.quantity,
        createdAt: t.createdAt.toISOString(),
        createdBy: t.createdBy?.name || 'System',
      })),
      lowStockItems: lowStockItems.map(i => ({
        id: i.id,
        product: i.product.name,
        quantity: i.quantity,
        minStock: i.product.minStock,
        warehouse: i.warehouse.name,
      })),
    }
  } catch {
    return {
      totalProducts: 0,
      totalSuppliers: 0,
      totalWarehouses: 0,
      totalItems: 0,
      recentTransactions: [],
      lowStockItems: [],
    }
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  return <DashboardClient data={data} />
}
