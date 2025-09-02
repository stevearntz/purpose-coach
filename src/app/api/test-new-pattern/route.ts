/**
 * TEST ROUTE - New API Pattern
 * This is for local testing only - DO NOT DEPLOY
 */

import { z } from 'zod'
import { createApiHandlers, ApiContext } from '@/lib/api/handler'
import { successResponse, SuccessResponses } from '@/lib/api/responses'
import { validateBody, validateQuery } from '@/lib/api/validation'
import { CommonErrors } from '@/lib/api/errors'

// Test schemas
const TestCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(0).max(150),
  email: z.string().email('Invalid email format'),
  tags: z.array(z.string()).optional()
})

const TestQuerySchema = z.object({
  filter: z.enum(['all', 'active', 'inactive']).optional(),
  limit: z.coerce.number().min(1).max(100).optional()
})

// GET handler - test query validation
async function handleGet({ userId, request }: ApiContext) {
  const query = validateQuery(request, TestQuerySchema)
  
  // Simulate some data
  const testData = {
    userId,
    filter: query.filter || 'all',
    limit: query.limit || 10,
    items: [
      { id: 1, name: 'Test Item 1', status: 'active' },
      { id: 2, name: 'Test Item 2', status: 'inactive' }
    ]
  }
  
  return successResponse(testData, 'Test data retrieved successfully')
}

// POST handler - test body validation
async function handlePost({ userId, request }: ApiContext) {
  const data = await validateBody(request, TestCreateSchema)
  
  // Simulate creating a resource
  const created = {
    id: Math.random().toString(36).substring(7),
    ...data,
    createdBy: userId,
    createdAt: new Date().toISOString()
  }
  
  return SuccessResponses.created(created, 'Test item created successfully')
}

// DELETE handler - test error handling
async function handleDelete({ userId, request }: ApiContext) {
  const url = new URL(request.url)
  const id = url.searchParams.get('id')
  
  if (!id) {
    throw CommonErrors.validationFailed({ id: 'ID parameter is required' })
  }
  
  // Simulate not found error
  if (id === 'notfound') {
    throw CommonErrors.notFound('Test item')
  }
  
  // Simulate forbidden error
  if (id === 'forbidden') {
    throw CommonErrors.forbidden()
  }
  
  return SuccessResponses.deleted(`Test item ${id} deleted successfully`)
}

// Export handlers with authentication
export const { GET, POST, DELETE } = createApiHandlers({
  GET: handleGet,
  POST: handlePost,
  DELETE: handleDelete
})

// Also export a non-authenticated version for testing
export const OPTIONS = createApiHandlers(
  { 
    OPTIONS: async () => successResponse({ 
      message: 'This endpoint works without authentication',
      endpoints: {
        'GET /api/test-new-pattern': 'Get test data (requires auth)',
        'POST /api/test-new-pattern': 'Create test item (requires auth)',
        'DELETE /api/test-new-pattern?id=xxx': 'Delete test item (requires auth)',
        'OPTIONS /api/test-new-pattern': 'This help message (no auth)'
      }
    })
  },
  { requireAuth: false }
).OPTIONS