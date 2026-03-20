import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const products = await prisma.product.findMany({
            where: { isActive: true },
            include: {
                category: { select: { name: true } },
                supplier: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(products)
    } catch (error) {
        console.error('Products API error:', error)
        // Return demo data if DB not connected
        return NextResponse.json([])
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const product = await prisma.product.create({
            data: {
                sku: body.sku,
                name: body.name,
                description: body.description,
                unit: body.unit || 'piece',
                price: body.price || 0,
                cost: body.cost || 0,
                minStock: body.minStock || 0,
                categoryId: body.categoryId,
                supplierId: body.supplierId,
            },
        })
        return NextResponse.json(product, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
    }
}
