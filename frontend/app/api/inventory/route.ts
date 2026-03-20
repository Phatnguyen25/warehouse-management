import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const inventory = await prisma.inventory.findMany({
            include: {
                product: { select: { name: true, sku: true, minStock: true, unit: true } },
                warehouse: { select: { name: true } },
                location: { select: { code: true } },
            },
            orderBy: { quantity: 'asc' },
        })
        return NextResponse.json(inventory)
    } catch {
        return NextResponse.json([])
    }
}
