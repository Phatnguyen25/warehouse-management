import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const suppliers = await prisma.supplier.findMany({
            orderBy: { name: 'asc' },
        })
        return NextResponse.json(suppliers)
    } catch {
        return NextResponse.json([])
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const supplier = await prisma.supplier.create({
            data: {
                name: body.name,
                email: body.email,
                phone: body.phone,
                contactName: body.contactName,
                address: body.address,
            },
        })
        return NextResponse.json(supplier, { status: 201 })
    } catch {
        return NextResponse.json({ error: 'Failed to create supplier' }, { status: 500 })
    }
}
