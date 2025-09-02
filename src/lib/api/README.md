# API Utilities Documentation

## Overview
This directory contains standardized utilities for building consistent, type-safe API routes in Next.js.

## Benefits
- ✅ **Type Safety**: Full TypeScript support with Zod validation
- ✅ **Consistent Responses**: All APIs return the same format
- ✅ **Error Handling**: Centralized error handling with proper status codes
- ✅ **Authentication**: Built-in Clerk authentication
- ✅ **Validation**: Runtime validation of request bodies and query params
- ✅ **Logging**: Structured error logging without exposing internals

## File Structure
```
/lib/api/
├── types.ts        # TypeScript interfaces for API responses
├── errors.ts       # Error handling utilities
├── responses.ts    # Success response helpers
├── validation.ts   # Request validation with Zod
├── handler.ts      # API route wrapper with auth
└── README.md       # This file
```

## Usage Example

### Before (Current Pattern)
```typescript
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { members } = await request.json() // No validation!

    // ... business logic ...

    return NextResponse.json({ teamMembers: createdMembers })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

### After (New Pattern)
```typescript
import { createApiHandlers, ApiContext } from '@/lib/api/handler'
import { validateBody } from '@/lib/api/validation'
import { SuccessResponses } from '@/lib/api/responses'
import { z } from 'zod'

// Define schema
const RequestSchema = z.object({
  members: z.array(z.object({
    name: z.string().min(1),
    email: z.string().email().optional()
  }))
})

// Handler with automatic auth & error handling
async function handlePost({ userId, request }: ApiContext) {
  const data = await validateBody(request, RequestSchema)
  
  // ... business logic ...
  
  return SuccessResponses.created({ teamMembers })
}

export const { POST } = createApiHandlers({ POST: handlePost })
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "statusCode": 400,
    "details": { ... }
  }
}
```

## Error Codes
- `UNAUTHORIZED` (401): No authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Request validation failed
- `ALREADY_EXISTS` (409): Resource already exists
- `INTERNAL_ERROR` (500): Server error
- `DATABASE_ERROR` (500): Database operation failed

## Migration Guide

### Step 1: Define Schemas
```typescript
const CreateItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional()
})
```

### Step 2: Create Handler Function
```typescript
async function handleCreateItem({ userId, request }: ApiContext) {
  const data = await validateBody(request, CreateItemSchema)
  // Business logic here
  return SuccessResponses.created(result)
}
```

### Step 3: Export with Wrapper
```typescript
export const { POST } = createApiHandlers({
  POST: handleCreateItem
})
```

## Testing
The pattern includes:
- Automatic error boundary
- Request validation
- Auth checking
- Consistent response format

## Next Steps
1. Review the example in `/api/team/members/route.example.ts`
2. Test locally with various inputs
3. If approved, gradually migrate existing routes
4. Remove console.error statements in favor of structured logging