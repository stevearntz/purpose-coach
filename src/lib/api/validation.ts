/**
 * API Request Validation Utilities
 * Uses Zod for runtime type checking
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { ApiError, ErrorCodes } from './errors'

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError(
        ErrorCodes.INVALID_INPUT,
        'Invalid JSON in request body',
        400
      )
    }
    // Let Zod errors bubble up to be handled by errorResponse
    throw error
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): z.infer<T> {
  const { searchParams } = new URL(request.url)
  const query: Record<string, string> = {}
  
  searchParams.forEach((value, key) => {
    query[key] = value
  })
  
  return schema.parse(query)
}

/**
 * Common validation schemas
 */
export const CommonSchemas = {
  // Pagination
  pagination: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
  }),
  
  // ID parameter
  idParam: z.object({
    id: z.string().min(1),
  }),
  
  // Email
  email: z.string().email(),
  
  // Common fields
  optionalString: z.string().optional(),
  requiredString: z.string().min(1),
}