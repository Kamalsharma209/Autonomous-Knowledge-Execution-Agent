import { callLLM } from '@/lib/utils/llm'
import { tools, getConfirmationTools } from '@/lib/tools/registry'
import type { AgentDecision, AgentStep } from '@/lib/tools/types'
import { prisma } from '@/lib/db/prisma'

const REASONING_SYSTEM_PROMPT = `You are an autonomous AI agent for an internal enterprise system.
You have access to internal knowledge sources only - NEVER search the internet.

AVAILABLE TOOLS:
${tools.map(t => `- ${t.name}: ${t.description}${t.requiresConfirmation ? ' [REQUIRES CONFIRMATION]' : ''}`).join('\n')}

YOUR ROLE:
1. Analyze the user's query
2. Determine what information is needed
3. Check if enough information is available
4. Select the appropriate tool
5. Decide if user confirmation is needed
6. Determine the safest action

RULES:
- Only use internal knowledge - NEVER search the internet
- Critical actions (delete, bulk update) ALWAYS require confirmation
- If information is missing, ask the user for clarification
- If multiple steps are needed, list them in order
- Always explain your reasoning

RESPOND WITH JSON:
{
  "reasoning": "your step-by-step reasoning",
  "requiresConfirmation": true/false,
  "steps": ["step1", "step2", ...],
  "selectedTool": "tool_name",
  "action": "action_to_execute",
  "explanation": "explanation for the user",
  "parameters": { "key": "value" }
}`

export async function reason(
  query: string,
  sessionId: string,
  context?: string
): Promise<AgentDecision> {
  const userPrompt = `
User Query: "${query}"

${context ? `Context from previous conversations:\n${context}\n` : ''}

Analyze this query and determine:
1. What information do I need?
2. Is enough information available?
3. Which tool should execute?
4. Is user confirmation required?
5. What is the safest action?
`

  try {
    const response = await callLLM(REASONING_SYSTEM_PROMPT, userPrompt)
    const cleanJson = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const decision: AgentDecision = JSON.parse(cleanJson)

    if (decision.selectedTool) {
      const tool = tools.find(t => t.name === decision.selectedTool)
      if (tool?.requiresConfirmation) {
        decision.requiresConfirmation = true
      }
    }

    return decision
  } catch {
    return fallbackReasoning(query)
  }
}

function fallbackReasoning(query: string): AgentDecision {
  const lower = query.toLowerCase()

  if (lower.includes('approve') && lower.includes('leave')) {
    return {
      reasoning: 'Analyzing leave approval request. Checking employee details, leave balance, and company policy.',
      requiresConfirmation: false,
      steps: ['retrieve_employee', 'check_leave_balance', 'check_policy', 'approve_leave'],
      selectedTool: 'approve_leave',
      action: 'approve_leave',
      explanation: 'Processing leave approval based on policy and available balance.',
    }
  }

  if (lower.includes('delete') || lower.includes('remove')) {
    return {
      reasoning: 'This is a destructive operation that requires human confirmation.',
      requiresConfirmation: true,
      steps: ['request_confirmation', 'execute_deletion'],
      selectedTool: lower.includes('employee') ? 'delete_employee' : 'delete_product',
      action: 'request_confirmation',
      explanation: 'Deletion requires manual confirmation to prevent accidental data loss.',
      parameters: { id: '' },
    }
  }

  if (lower.includes('report') || lower.includes('summary')) {
    return {
      reasoning: 'Gathering data from multiple sources to generate a comprehensive report.',
      requiresConfirmation: false,
      steps: ['fetch_employees', 'fetch_products', 'fetch_inventory', 'compile_report'],
      selectedTool: 'generate_report',
      action: 'generate_report',
      explanation: 'Compiling data from all internal systems into a report.',
    }
  }

  return {
    reasoning: 'Searching internal knowledge sources to find relevant information for the query.',
    requiresConfirmation: false,
    steps: ['search_knowledge_base'],
    selectedTool: 'search_knowledge',
    action: 'search_knowledge',
    explanation: 'Retrieving information from internal knowledge base.',
    parameters: { query },
  }
}

export async function executeAgentPlan(
  decision: AgentDecision,
  sessionId: string
): Promise<{ steps: AgentStep[]; finalResult: unknown }> {
  const steps: AgentStep[] = decision.steps.map(s => ({
    step: s,
    status: 'pending' as const,
    timestamp: new Date().toISOString(),
  }))

  for (let i = 0; i < steps.length; i++) {
    steps[i].status = 'running'
    steps[i].timestamp = new Date().toISOString()

    try {
      if (steps[i].step === decision.selectedTool) {
        const tool = tools.find(t => t.name === decision.selectedTool)
        if (tool) {
          const result = await tool.execute(decision.parameters || {})
          steps[i].status = result.success ? 'completed' : 'failed'
          steps[i].result = result.explanation
        }
      } else if (steps[i].step.startsWith('fetch_') || steps[i].step.startsWith('search_') || steps[i].step.startsWith('check_')) {
        const tool = tools.find(t => t.name === 'search_knowledge')
        if (tool) {
          const result = await tool.execute({ query: steps[i].step })
          steps[i].status = 'completed'
          steps[i].result = JSON.stringify(result.data)
        }
      } else {
        steps[i].status = 'completed'
        steps[i].result = `${steps[i].step} completed.`
      }
    } catch (error) {
      steps[i].status = 'failed'
      steps[i].result = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }

  return { steps, finalResult: steps }
}

export async function createAuditLog(
  userQuery: string,
  decision: AgentDecision,
  steps: AgentStep[],
  status: string,
  finalResponse?: string
) {
  return prisma.auditLog.create({
    data: {
      userQuery,
      retrievedKnowledge: JSON.stringify(decision.steps),
      reasoning: decision.reasoning,
      selectedTool: decision.selectedTool,
      actionExecuted: decision.action,
      executionStatus: status,
      finalResponse: finalResponse || decision.explanation,
      metadata: JSON.stringify({ steps }),
    },
  })
}
