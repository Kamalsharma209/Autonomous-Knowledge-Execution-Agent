import { NextRequest, NextResponse } from 'next/server'
import { chatService } from '@/lib/services/chat-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, confirmedAction } = body

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`

    const response = await chatService.handleMessage(message, sid, confirmedAction)

    return NextResponse.json({ ...response, sessionId: sid })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
