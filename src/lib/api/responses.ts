/**
 * Standardized API Response Helpers
 * Ensures consistent success responses
 */

import { NextResponse } from 'next/server'
import { ApiSuccessResponse } from './types'

/**
 * Create a standardized success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json<ApiSuccessResponse<T>>(
    {
      success: true,
      data,
      ...(message && { message })
    },
    { status }
  )
}

/**
 * Common success responses
 */
export const SuccessResponses = {
  created: <T>(data: T, message = 'Resource created successfully') =>
    successResponse(data, message, 201),
  
  updated: <T>(data: T, message = 'Resource updated successfully') =>
    successResponse(data, message, 200),
  
  deleted: (message = 'Resource deleted successfully') =>
    successResponse(null, message, 200),
  
  list: <T>(data: T[], message?: string) =>
    successResponse({ items: data, count: data.length }, message, 200),
}