import { prisma } from '@/lib/db/prisma'
import type { Tool, ToolResult } from './types'

export const approveLeaveTool: Tool = {
  name: 'approve_leave',
  description: 'Approve a pending leave request',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const leaveRequest = await prisma.leaveRequest.findUnique({
        where: { id: params.leaveRequestId as string },
        include: { employee: true },
      })

      if (!leaveRequest) {
        return {
          success: false,
          error: 'Leave request not found',
          explanation: 'Cannot approve: No leave request found with the given ID.',
        }
      }

      if (leaveRequest.status !== 'PENDING') {
        return {
          success: false,
          error: `Leave request is already ${leaveRequest.status}`,
          explanation: `This leave request has already been ${leaveRequest.status.toLowerCase()}.`,
        }
      }

      const updated = await prisma.leaveRequest.update({
        where: { id: params.leaveRequestId as string },
        data: {
          status: 'APPROVED',
          reviewedBy: params.reviewedBy as string || 'Agent',
          comments: params.comments as string || 'Approved automatically by system',
        },
      })

      await prisma.employee.update({
        where: { id: leaveRequest.employeeId },
        data: { leaveBalance: { decrement: leaveRequest.days } },
      })

      return {
        success: true,
        data: updated,
        explanation: `Leave approved for ${leaveRequest.employee.name} (${leaveRequest.days} day(s) from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()}). Remaining leave balance: ${leaveRequest.employee.leaveBalance - leaveRequest.days} days.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to approve leave: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Leave approval failed due to a database error.',
      }
    }
  },
}

export const rejectLeaveTool: Tool = {
  name: 'reject_leave',
  description: 'Reject a pending leave request',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const leaveRequest = await prisma.leaveRequest.findUnique({
        where: { id: params.leaveRequestId as string },
        include: { employee: true },
      })

      if (!leaveRequest) {
        return {
          success: false,
          error: 'Leave request not found',
          explanation: 'Cannot reject: No leave request found with the given ID.',
        }
      }

      if (leaveRequest.status !== 'PENDING') {
        return {
          success: false,
          error: `Leave request is already ${leaveRequest.status}`,
          explanation: `This leave request has already been ${leaveRequest.status.toLowerCase()}.`,
        }
      }

      const updated = await prisma.leaveRequest.update({
        where: { id: params.leaveRequestId as string },
        data: {
          status: 'REJECTED',
          reviewedBy: params.reviewedBy as string || 'Agent',
          comments: params.comments as string || 'Rejected automatically by system',
        },
      })

      return {
        success: true,
        data: updated,
        explanation: `Leave rejected for ${leaveRequest.employee.name} (${leaveRequest.days} day(s) from ${leaveRequest.startDate.toLocaleDateString()} to ${leaveRequest.endDate.toLocaleDateString()}). Reason: ${params.reason || 'Insufficient leave balance or policy violation.'}`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to reject leave: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Leave rejection failed due to a database error.',
      }
    }
  },
}
