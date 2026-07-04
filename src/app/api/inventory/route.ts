import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const inventory = await prisma.inventory.findMany({
      include: { product: true },
      where: search
        ? { product: { name: { contains: search } } }
        : undefined,
    })

    return NextResponse.json({ inventory })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, quantity, location, minStock } = body
    const inventory = await prisma.inventory.update({
      where: { id },
      data: { ...(quantity !== undefined ? { quantity } : {}), ...(location ? { location } : {}), ...(minStock !== undefined ? { minStock } : {}) },
    })
    return NextResponse.json({ inventory })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
