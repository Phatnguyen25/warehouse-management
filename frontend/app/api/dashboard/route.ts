import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const [totalProducts, totalSuppliers, totalWarehouses] = await Promise.all([
            prisma.product.count({ where: { isActive: true } }),
            prisma.supplier.count({ where: { isActive: true } }),
            prisma.warehouse.count({ where: { isActive: true } }),
        ])

        const recentTransactions = await prisma.stockTransaction.findMany({
            take: 8,
            orderBy: { createdAt: 'desc' },
            include: { product: true, createdBy: true },
        })

        const allInventory = await prisma.inventory.findMany({
            where: { product: { isActive: true } },
            include: { product: true, warehouse: true },
            orderBy: { quantity: 'asc' },
            take: 50,
        })
        const lowStockItems = allInventory
            .filter(item => item.quantity <= item.product.minStock)
            .slice(0, 5)

        const inventoryValue = await prisma.inventory.aggregate({
            _sum: { quantity: true },
        })

        return NextResponse.json({
            totalProducts,
            totalSuppliers,
            totalWarehouses,
            totalItems: inventoryValue._sum.quantity ?? 0,
            recentTransactions: recentTransactions.map(t => ({
                id: t.id,
                type: t.transactionType as string,
                product: t.product.name,
                quantity: t.quantity,
                createdAt: t.createdAt.toISOString(),
                createdBy: t.createdBy?.name ?? 'System',
            })),
            lowStockItems: lowStockItems.map(i => ({
                id: i.id,
                product: i.product.name,
                quantity: i.quantity,
                minStock: i.product.minStock,
                warehouse: i.warehouse.name,
            })),
        })
    } catch {
        return NextResponse.json({
            totalProducts: 0, totalSuppliers: 0, totalWarehouses: 0, totalItems: 0,
            recentTransactions: [], lowStockItems: [],
        })
    }
}
