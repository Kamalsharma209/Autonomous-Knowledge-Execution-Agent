import { prisma } from '@/lib/db/prisma'
import type { Tool, ToolResult } from './types'

export const createEmployeeTool: Tool = {
  name: 'create_employee',
  description: 'Create a new employee record',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const employee = await prisma.employee.create({
        data: {
          employeeId: params.employeeId as string,
          name: params.name as string,
          email: params.email as string,
          department: params.department as string,
          designation: params.designation as string,
          salary: params.salary as number,
          leaveBalance: (params.leaveBalance as number) || 0,
          phone: params.phone as string,
          address: params.address as string,
        },
      })
      return {
        success: true,
        data: employee,
        explanation: `Employee ${employee.name} (${employee.employeeId}) created successfully in ${employee.department} department.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to create employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Employee creation failed due to a database error.',
      }
    }
  },
}

export const updateEmployeeTool: Tool = {
  name: 'update_employee',
  description: 'Update an existing employee record',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const { id, ...data } = params
      const employee = await prisma.employee.update({
        where: { id: id as string },
        data: data as Record<string, unknown>,
      })
      return {
        success: true,
        data: employee,
        explanation: `Employee ${employee.name} updated successfully.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Employee update failed. The employee ID may not exist.',
      }
    }
  },
}

export const deleteEmployeeTool: Tool = {
  name: 'delete_employee',
  description: 'Delete an employee record (requires confirmation)',
  requiresConfirmation: true,
  async execute(params): Promise<ToolResult> {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: params.id as string },
      })
      if (!employee) {
        return {
          success: false,
          error: 'Employee not found',
          explanation: 'Cannot delete: No employee found with the given ID.',
        }
      }
      await prisma.employee.delete({ where: { id: params.id as string } })
      return {
        success: true,
        data: employee,
        explanation: `Employee ${employee.name} (${employee.employeeId}) has been permanently deleted from the system.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Employee deletion failed due to a database error.',
      }
    }
  },
}

export const getEmployeesTool: Tool = {
  name: 'get_employees',
  description: 'Retrieve employee records',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const employees = await prisma.employee.findMany({
        where: params.search
          ? {
              OR: [
                { name: { contains: params.search as string } },
                { employeeId: { contains: params.search as string } },
                { department: { contains: params.search as string } },
              ],
            }
          : undefined,
        take: (params.limit as number) || 50,
      })
      return {
        success: true,
        data: employees,
        explanation: `Found ${employees.length} employee(s) matching the criteria.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve employees: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Employee retrieval failed due to a database error.',
      }
    }
  },
}

export const employeeTools = [
  createEmployeeTool,
  updateEmployeeTool,
  deleteEmployeeTool,
  getEmployeesTool,
]
