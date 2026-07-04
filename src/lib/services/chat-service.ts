import { processQuery } from '@/lib/agents/agent-orchestrator'
import type { AgentResponse } from '@/lib/agents/agent-orchestrator'

export class ChatService {
  async handleMessage(
    message: string,
    sessionId: string,
    confirmedAction?: { tool: string; params: Record<string, unknown> }
  ): Promise<AgentResponse> {
    return processQuery(message, sessionId, confirmedAction)
  }
}

export const chatService = new ChatService()
