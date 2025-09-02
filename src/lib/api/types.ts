/**
 * Standardized API Types
 * These types ensure consistent API responses across all endpoints
 */

// Standard success response
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

// Standard error response
export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    statusCode: number
  }
}

// Union type for all API responses
export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse

// Common error codes
export const ErrorCodes = {
  // Authentication & Authorization
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]