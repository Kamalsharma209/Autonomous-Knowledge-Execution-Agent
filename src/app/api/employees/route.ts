import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')

    const employees = await prisma.employee.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { employeeId: { contains: search } },
              { department: { contains: search } },
            ],
          }
        : undefined,
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ employees })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employee = await prisma.employee.create({ data: body })
    return NextResponse.json({ employee }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
