import { prisma } from '@/lib/db/prisma'
import type { Tool, ToolResult } from './types'

export const updateInventoryTool: Tool = {
  name: 'update_inventory',
  description: 'Update inventory stock levels',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const inventory = await prisma.inventory.update({
        where: { id: params.inventoryId as string },
        data: {
          quantity: params.quantity as number,
          ...(params.location ? { location: params.location as string } : {}),
          ...(params.minStock ? { minStock: params.minStock as number } : {}),
        },
        include: { product: true },
      })
      return {
        success: true,
        data: inventory,
        explanation: `Inventory updated for ${inventory.product.name}: ${inventory.quantity} units at ${inventory.location}.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update inventory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Inventory update failed due to a database error.',
      }
    }
  },
}

export const getInventoryTool: Tool = {
  name: 'get_inventory',
  description: 'Retrieve inventory records',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const inventory = await prisma.inventory.findMany({
        include: { product: true },
        where: params.search
          ? { product: { name: { contains: params.search as string } } }
          : undefined,
        take: (params.limit as number) || 50,
      })
      return {
        success: true,
        data: inventory,
        explanation: `Found ${inventory.length} inventory item(s) matching the criteria.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve inventory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Inventory retrieval failed due to a database error.',
      }
    }
  },
}

export const inventoryTools = [updateInventoryTool, getInventoryTool]
