import { prisma } from '@/lib/db/prisma'
import { simpleEmbed, cosineSimilarity, chunkText } from '@/lib/utils/embeddings'
import type { Tool, ToolResult } from './types'

export const searchKnowledgeTool: Tool = {
  name: 'search_knowledge',
  description: 'Search internal knowledge base, policies, and FAQs',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const query = (params.query as string) || ''
      const category = params.category as string

      const whereClause: Record<string, unknown> = {}
      if (category) whereClause.category = category

      const docs = await prisma.knowledgeDocument.findMany({ where: whereClause })
      const policies = await prisma.policy.findMany()
      const faqs = await prisma.fAQ.findMany()

      let results: { content: string; source: string; score: number }[] = []

      const queryVec = simpleEmbed(query)

      for (const doc of docs) {
        const chunks = chunkText(doc.content)
        for (const chunk of chunks) {
          const chunkVec = simpleEmbed(chunk)
          const score = cosineSimilarity(queryVec, chunkVec)
          results.push({ content: chunk, source: `Document: ${doc.title}`, score })
        }
      }

      for (const policy of policies) {
        const chunks = chunkText(policy.content)
        for (const chunk of chunks) {
          const chunkVec = simpleEmbed(chunk)
          const score = cosineSimilarity(queryVec, chunkVec)
          results.push({ content: chunk, source: `Policy: ${policy.title}`, score })
        }
      }

      for (const faq of faqs) {
        const text = `Q: ${faq.question}\nA: ${faq.answer}`
        const chunkVec = simpleEmbed(text)
        const score = cosineSimilarity(queryVec, chunkVec)
        results.push({ content: text, source: `FAQ: ${faq.category || 'General'}`, score })
      }

      results.sort((a, b) => b.score - a.score)
      results = results
        .filter((r, i, arr) => arr.findIndex(x => x.content === r.content) === i)
        .slice(0, 5)

      return {
        success: true,
        data: results,
        explanation: `Searched internal knowledge base with "${query}". Found ${results.length} relevant result(s).`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Search failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Knowledge search failed due to a system error.',
      }
    }
  },
}

export const getAuditLogsTool: Tool = {
  name: 'view_audit_logs',
  description: 'Retrieve audit log entries',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const logs = await prisma.auditLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: (params.limit as number) || 50,
      })
      return {
        success: true,
        data: logs,
        explanation: `Retrieved ${logs.length} audit log entr${logs.length === 1 ? 'y' : 'ies'}.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Audit log retrieval failed due to a database error.',
      }
    }
  },
}

export const generateReportTool: Tool = {
  name: 'generate_report',
  description: 'Generate a report from internal data',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const employees = await prisma.employee.findMany()
      const products = await prisma.product.findMany()
      const inventory = await prisma.inventory.findMany({ include: { product: true } })
      const leaveRequests = await prisma.leaveRequest.findMany({
        include: { employee: true },
      })

      const totalEmployees = employees.length
      const avgSalary = employees.reduce((s, e) => s + e.salary, 0) / totalEmployees
      const totalProducts = products.length
      const totalInventoryValue = inventory.reduce(
        (s, i) => s + i.quantity * i.product.price,
        0
      )
      const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING').length
      const lowStockItems = inventory.filter(i => i.quantity <= i.minStock)

      const report = {
        summary: {
          totalEmployees,
          avgSalary: Math.round(avgSalary),
          totalProducts,
          totalInventoryValue: Math.round(totalInventoryValue),
          pendingLeaves,
          lowStockCount: lowStockItems.length,
        },
        departmentBreakdown: employees.reduce(
          (acc, emp) => {
            acc[emp.department] = (acc[emp.department] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        ),
        lowStockItems: lowStockItems.map(i => ({
          product: i.product.name,
          quantity: i.quantity,
          minStock: i.minStock,
          location: i.location,
        })),
        generatedAt: new Date().toISOString(),
      }

      return {
        success: true,
        data: report,
        explanation: `Report generated successfully. Company has ${totalEmployees} employees, ${totalProducts} products, inventory worth ₹${Math.round(totalInventoryValue).toLocaleString()}.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Report generation failed due to a database error.',
      }
    }
  },
}

export const knowledgeTools = [
  searchKnowledgeTool,
  getAuditLogsTool,
  generateReportTool,
]
