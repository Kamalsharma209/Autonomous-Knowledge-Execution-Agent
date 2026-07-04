import { NextRequest, NextResponse } from 'next/server'
import { getTool } from '@/lib/tools/registry'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { toolName, parameters } = body

    if (!toolName) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 })
    }

    const tool = getTool(toolName)

    if (!tool) {
      return NextResponse.json({ error: `Tool "${toolName}" not found` }, { status: 404 })
    }

    const result = await tool.execute(parameters || {})

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
