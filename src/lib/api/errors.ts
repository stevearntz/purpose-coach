/**
 * Standardized API Error Handling
 * Provides consistent error responses and logging
 */

import { NextResponse } from 'next/server'
import { ApiErrorResponse, ErrorCode, ErrorCodes } from './types'
import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Create a standardized error response
 */
export function errorResponse(
  error: ApiError | Error | ZodError | unknown
): NextResponse<ApiErrorResponse> {
  // Handle ApiError (our custom errors)
  if (error instanceof ApiError) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          statusCode: error.statusCode
        }
      },
      { status: error.statusCode }
    )
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json<ApiErrorResponse>(
      {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.errors,
          statusCode: 400
        }
      },
      { status: 400 }
    )
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    // Handle common Prisma errors
    if (prismaError.code === 'P2002') {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: {
            code: ErrorCodes.ALREADY_EXISTS,
            message: 'Resource already exists',
            details: prismaError.meta,
            statusCode: 409
          }
        },
        { status: 409 }
      )
    }
    
    if (prismaError.code === 'P2025') {
      return NextResponse.json<ApiErrorResponse>(
        {
          success: false,
          error: {
            code: ErrorCodes.NOT_FOUND,
            message: 'Resource not found',
            details: prismaError.meta,
            statusCode: 404
          }
        },
        { status: 404 }
      )
    }
  }

  // Log unexpected errors (but don't expose details to client)
  console.error('Unexpected error in API route:', error)

  // Default error response
  return NextResponse.json<ApiErrorResponse>(
    {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        statusCode: 500
      }
    },
    { status: 500 }
  )
}

/**
 * Common pre-built errors
 */
export const CommonErrors = {
  unauthorized: () => 
    new ApiError(ErrorCodes.UNAUTHORIZED, 'Authentication required', 401),
  
  forbidden: () => 
    new ApiError(ErrorCodes.FORBIDDEN, 'Insufficient permissions', 403),
  
  notFound: (resource: string) => 
    new ApiError(ErrorCodes.NOT_FOUND, `${resource} not found`, 404),
  
  validationFailed: (details?: any) => 
    new ApiError(ErrorCodes.VALIDATION_ERROR, 'Validation failed', 400, details),
  
  alreadyExists: (resource: string) => 
    new ApiError(ErrorCodes.ALREADY_EXISTS, `${resource} already exists`, 409),
  
  internalError: (message = 'An unexpected error occurred') => 
    new ApiError(ErrorCodes.INTERNAL_ERROR, message, 500),
  
  databaseError: (message = 'Database operation failed') => 
    new ApiError(ErrorCodes.DATABASE_ERROR, message, 500),
}