export interface ToolResult {
  success: boolean
  data?: unknown
  error?: string
  explanation: string
}

export interface Tool {
  name: string
  description: string
  requiresConfirmation: boolean
  execute: (params: Record<string, unknown>) => Promise<ToolResult>
}

export interface AgentStep {
  step: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
  timestamp: string
}

export interface AgentDecision {
  reasoning: string
  requiresConfirmation: boolean
  steps: string[]
  selectedTool: string
  action: string
  explanation: string
  parameters?: Record<string, unknown>
}
