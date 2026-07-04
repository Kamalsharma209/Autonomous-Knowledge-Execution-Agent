import { NextRequest, NextResponse } from 'next/server'
import { uploadKnowledgeDocument } from '@/lib/knowledge/knowledge-service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string
    const category = formData.get('category') as string

    if (!file && !title) {
      return NextResponse.json(
        { error: 'Either file or title with content is required' },
        { status: 400 }
      )
    }

    if (file) {
      const text = await file.text()
      const fileName = file.name
      let records: { title: string; content: string; source: string; category?: string }[]

      if (fileName.endsWith('.json')) {
        const jsonData = JSON.parse(text)
        records = Array.isArray(jsonData) ? jsonData : [{
          title: jsonData.title || fileName,
          content: jsonData.content || JSON.stringify(jsonData),
          source: 'upload',
          category,
        }]
      } else {
        records = [{
          title: title || fileName,
          content: text,
          source: 'upload',
          category,
        }]
      }

      const docs = []
      for (const record of records) {
        const doc = await uploadKnowledgeDocument(
          record.title,
          record.content,
          record.source,
          record.category
        )
        docs.push(doc)
      }

      return NextResponse.json({ documents: docs, count: docs.length })
    }

    const content = formData.get('content') as string
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const doc = await uploadKnowledgeDocument(
      title || 'Untitled Document',
      content,
      'manual',
      category
    )

    return NextResponse.json({ document: doc })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const { getAllKnowledgeDocuments } = await import('@/lib/knowledge/knowledge-service')
  const docs = await getAllKnowledgeDocuments()
  return NextResponse.json({ documents: docs })
}
