/**
 * API Route Handler Wrapper
 * Provides consistent error handling and request processing
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { errorResponse, CommonErrors } from './errors'

export interface ApiContext {
  userId: string
  request: NextRequest
}

type ApiHandler = (context: ApiContext) => Promise<NextResponse>

/**
 * Wrap an API handler with authentication and error handling
 */
export function withApiHandler(
  handler: ApiHandler,
  options?: {
    requireAuth?: boolean
  }
): (request: NextRequest) => Promise<NextResponse> {
  const { requireAuth = true } = options || {}
  
  return async (request: NextRequest) => {
    try {
      // Check authentication if required
      if (requireAuth) {
        const { userId } = await auth()
        
        if (!userId) {
          throw CommonErrors.unauthorized()
        }
        
        // Call the handler with context
        return await handler({ userId, request })
      }
      
      // For non-authenticated routes, use a placeholder userId
      return await handler({ userId: 'anonymous', request })
      
    } catch (error) {
      // Centralized error handling
      return errorResponse(error)
    }
  }
}

/**
 * Create a set of RESTful handlers
 */
export function createApiHandlers(handlers: {
  GET?: ApiHandler
  POST?: ApiHandler
  PUT?: ApiHandler
  PATCH?: ApiHandler
  DELETE?: ApiHandler
}, options?: {
  requireAuth?: boolean
}) {
  const wrappedHandlers: Record<string, any> = {}
  
  for (const [method, handler] of Object.entries(handlers)) {
    if (handler) {
      wrappedHandlers[method] = withApiHandler(handler, options)
    }
  }
  
  return wrappedHandlers
}