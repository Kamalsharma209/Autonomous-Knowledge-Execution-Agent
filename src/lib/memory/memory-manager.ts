import { prisma } from '@/lib/db/prisma'

export class MemoryManager {
  async remember(sessionId: string, key: string, value: string, type = 'preference') {
    const existing = await prisma.memory.findFirst({
      where: { sessionId, key },
    })

    if (existing) {
      return prisma.memory.update({
        where: { id: existing.id },
        data: { value, type },
      })
    }

    return prisma.memory.create({
      data: { sessionId, key, value, type },
    })
  }

  async recall(sessionId: string, key: string): Promise<string | null> {
    const mem = await prisma.memory.findFirst({
      where: { sessionId, key },
    })
    return mem?.value || null
  }

  async recallAll(sessionId: string) {
    return prisma.memory.findMany({
      where: { sessionId },
      orderBy: { updatedAt: 'desc' },
    })
  }

  async getContext(sessionId: string): Promise<string> {
    const memories = await this.recallAll(sessionId)
    if (memories.length === 0) return ''

    return memories
      .map(m => `[${m.type}] ${m.key}: ${m.value}`)
      .join('\n')
  }

  async saveConversation(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: Record<string, unknown>
  ) {
    return prisma.conversation.create({
      data: {
        sessionId,
        role,
        content,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
  }

  async getConversationHistory(sessionId: string, limit = 20) {
    return prisma.conversation.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
  }
}

export const memoryManager = new MemoryManager()
