import { prisma } from '@/lib/db/prisma'
import type { Tool, ToolResult } from './types'

export const addProductTool: Tool = {
  name: 'add_product',
  description: 'Add a new product',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const product = await prisma.product.create({
        data: {
          productId: params.productId as string,
          name: params.name as string,
          category: params.category as string,
          price: params.price as number,
          cost: params.cost as number,
          description: params.description as string,
        },
      })
      return {
        success: true,
        data: product,
        explanation: `Product ${product.name} (${product.productId}) added successfully.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to add product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Product creation failed due to a database error.',
      }
    }
  },
}

export const updateProductTool: Tool = {
  name: 'update_product',
  description: 'Update an existing product',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const { id, ...data } = params
      const product = await prisma.product.update({
        where: { id: id as string },
        data: data as Record<string, unknown>,
      })
      return {
        success: true,
        data: product,
        explanation: `Product ${product.name} updated successfully.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to update product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Product update failed. The product ID may not exist.',
      }
    }
  },
}

export const deleteProductTool: Tool = {
  name: 'delete_product',
  description: 'Delete a product (requires confirmation)',
  requiresConfirmation: true,
  async execute(params): Promise<ToolResult> {
    try {
      const product = await prisma.product.findUnique({
        where: { id: params.id as string },
      })
      if (!product) {
        return {
          success: false,
          error: 'Product not found',
          explanation: 'Cannot delete: No product found with the given ID.',
        }
      }
      await prisma.product.delete({ where: { id: params.id as string } })
      return {
        success: true,
        data: product,
        explanation: `Product ${product.name} (${product.productId}) has been permanently deleted.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Product deletion failed due to a database error.',
      }
    }
  },
}

export const getProductsTool: Tool = {
  name: 'get_products',
  description: 'Retrieve product records',
  requiresConfirmation: false,
  async execute(params): Promise<ToolResult> {
    try {
      const products = await prisma.product.findMany({
        where: params.search
          ? {
              OR: [
                { name: { contains: params.search as string } },
                { productId: { contains: params.search as string } },
                { category: { contains: params.search as string } },
              ],
            }
          : undefined,
        take: (params.limit as number) || 50,
      })
      return {
        success: true,
        data: products,
        explanation: `Found ${products.length} product(s) matching the criteria.`,
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to retrieve products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        explanation: 'Product retrieval failed due to a database error.',
      }
    }
  },
}

export const productTools = [
  addProductTool,
  updateProductTool,
  deleteProductTool,
  getProductsTool,
]
