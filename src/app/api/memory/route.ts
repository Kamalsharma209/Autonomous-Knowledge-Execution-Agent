import { NextRequest, NextResponse } from 'next/server'
import { memoryManager } from '@/lib/memory/memory-manager'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const type = searchParams.get('type')

    if (sessionId) {
      if (type === 'conversations') {
        const conversations = await memoryManager.getConversationHistory(sessionId)
        return NextResponse.json({ conversations })
      }
      const memories = await memoryManager.recallAll(sessionId)
      return NextResponse.json({ memories })
    }

    const limit = parseInt(searchParams.get('limit') || '50')
    const allMemories = await prisma.memory.findMany({
      orderBy: { updatedAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ memories: allMemories })
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
    const { sessionId, key, value, type } = body

    if (!sessionId || !key || !value) {
      return NextResponse.json(
        { error: 'sessionId, key, and value are required' },
        { status: 400 }
      )
    }

    const memory = await memoryManager.remember(sessionId, key, value, type)
    return NextResponse.json({ memory })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
