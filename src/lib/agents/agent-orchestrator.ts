import { reason, executeAgentPlan, createAuditLog } from './reasoning-engine'
import { memoryManager } from '@/lib/memory/memory-manager'
import type { AgentStep, AgentDecision } from '@/lib/tools/types'

export interface AgentResponse {
  query: string
  reasoning: string
  explanation: string
  requiresConfirmation: boolean
  confirmed?: boolean
  selectedTool: string
  steps: AgentStep[]
  finalResult?: unknown
  auditLogId?: string
  error?: string
}

export async function processQuery(
  query: string,
  sessionId: string,
  confirmedAction?: { tool: string; params: Record<string, unknown> }
): Promise<AgentResponse> {
  try {
    await memoryManager.saveConversation(sessionId, 'user', query)

    const context = await memoryManager.getContext(sessionId)

    let decision: AgentDecision

    if (confirmedAction) {
      const tool = (await import('@/lib/tools/registry')).getTool(confirmedAction.tool)
      if (!tool) {
        return {
          query,
          reasoning: '',
          explanation: `Tool "${confirmedAction.tool}" not found.`,
          requiresConfirmation: false,
          selectedTool: confirmedAction.tool,
          steps: [{
            step: 'execute',
            status: 'failed',
            result: 'Tool not found',
            timestamp: new Date().toISOString(),
          }],
        }
      }

      decision = {
        reasoning: 'Executing confirmed action.',
        requiresConfirmation: false,
        steps: ['execute'],
        selectedTool: confirmedAction.tool,
        action: confirmedAction.tool,
        explanation: `Executing pre-confirmed ${confirmedAction.tool}.`,
        parameters: confirmedAction.params,
      }
    } else {
      decision = await reason(query, sessionId, context)
    }

    if (decision.requiresConfirmation && !confirmedAction) {
      await memoryManager.saveConversation(sessionId, 'assistant', JSON.stringify({
        type: 'confirmation_required',
        tool: decision.selectedTool,
        explanation: decision.explanation,
        parameters: decision.parameters,
      }))

      return {
        query,
        reasoning: decision.reasoning,
        explanation: decision.explanation,
        requiresConfirmation: true,
        confirmed: false,
        selectedTool: decision.selectedTool,
        steps: decision.steps.map(s => ({
          step: s,
          status: 'pending',
          timestamp: new Date().toISOString(),
        })),
      }
    }

    const { steps, finalResult } = await executeAgentPlan(decision, sessionId)
    const allCompleted = steps.every(s => s.status === 'completed')
    const status = allCompleted ? 'completed' : 'partial'

    const finalResponse = allCompleted
      ? decision.explanation
      : `Some steps had issues. ${decision.explanation}`

    const auditLog = await createAuditLog(query, decision, steps, status, finalResponse)

    await memoryManager.saveConversation(sessionId, 'assistant', finalResponse, {
      status,
      auditLogId: auditLog.id,
      tool: decision.selectedTool,
    })

    if (decision.selectedTool && steps.some(s => s.step === decision.selectedTool && s.status === 'completed')) {
      await memoryManager.remember(sessionId, `last_${decision.selectedTool}`, finalResponse, 'action')
    }

    return {
      query,
      reasoning: decision.reasoning,
      explanation: finalResponse,
      requiresConfirmation: false,
      confirmed: true,
      selectedTool: decision.selectedTool,
      steps,
      finalResult,
      auditLogId: auditLog.id,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'

    await memoryManager.saveConversation(sessionId, 'system', `Error: ${errorMsg}`)

    return {
      query,
      reasoning: '',
      explanation: `An error occurred while processing your request: ${errorMsg}`,
      requiresConfirmation: false,
      selectedTool: '',
      steps: [{
        step: 'error',
        status: 'failed',
        result: errorMsg,
        timestamp: new Date().toISOString(),
      }],
      error: errorMsg,
    }
  }
}
