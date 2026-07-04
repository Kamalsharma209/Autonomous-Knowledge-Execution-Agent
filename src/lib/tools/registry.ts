import type { Tool } from './types'
import { employeeTools } from './employee-tools'
import { productTools } from './product-tools'
import { approveLeaveTool, rejectLeaveTool } from './leave-tools'
import { inventoryTools } from './inventory-tools'
import { knowledgeTools } from './knowledge-tools'

export const tools: Tool[] = [
  ...employeeTools,
  ...productTools,
  approveLeaveTool,
  rejectLeaveTool,
  ...inventoryTools,
  ...knowledgeTools,
]

export function getTool(name: string): Tool | undefined {
  return tools.find(t => t.name === name)
}

export function getConfirmationTools(): string[] {
  return tools.filter(t => t.requiresConfirmation).map(t => t.name)
}

export const criticalActions = [
  'delete_employee',
  'delete_product',
  'bulk_update',
  'delete_order',
]
