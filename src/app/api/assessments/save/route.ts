/**
 * Assessment Save API - Migrated to New Standardized Pattern
 * 
 * This replaces route.ts with proper validation, error handling, and response format
 * Following the new API utilities pattern from /lib/api/
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { createApiHandlers, ApiContext } from '@/lib/api/handler'
import { SuccessResponses } from '@/lib/api/responses'
import { CommonErrors, ApiError } from '@/lib/api/errors'
import { ErrorCodes } from '@/lib/api/types'
import { nanoid } from 'nanoid'

// Simple validation function to avoid import issues
async function validateBody<T extends z.ZodType>(
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

// Validation schema for saving assessment results
const SaveAssessmentSchema = z.object({
  inviteCode: z.string().optional(),
  invitationId: z.string().optional(),
  toolId: z.string().min(1, 'Tool ID is required'),
  toolName: z.string().min(1, 'Tool name is required'),
  responses: z.any(), // Raw responses from the assessment
  scores: z.any().optional(),
  summary: z.string().optional(),
  insights: z.any().optional(),
  recommendations: z.any().optional(),
  userProfile: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.string().optional(),
    challenges: z.array(z.string()).optional(),
    company: z.string().optional(),
  }).optional(),
}).refine(data => data.inviteCode || data.invitationId, {
  message: 'Either inviteCode or invitationId must be provided'
})

async function handleSaveAssessment({ request }: ApiContext) {
  // Note: This endpoint doesn't require authentication by design
  // It's used by anonymous users completing assessments
  
  const data = await validateBody(request, SaveAssessmentSchema)
  
  // Find the invitation
  let invitation
  if (data.inviteCode) {
    invitation = await prisma.invitation.findFirst({
      where: { inviteCode: data.inviteCode }
    })
  } else if (data.invitationId) {
    invitation = await prisma.invitation.findUnique({
      where: { id: data.invitationId }
    })
  }
  
  if (!invitation) {
    throw CommonErrors.notFound('Invitation')
  }
  
  // Check if already completed
  const existingResult = await prisma.assessmentResult.findFirst({
    where: {
      invitationId: invitation.id,
      toolId: data.toolId
    }
  })
  
  if (existingResult) {
    throw new ApiError(
      ErrorCodes.ALREADY_EXISTS,
      'Assessment already completed for this invitation',
      409
    )
  }
  
  // Generate a unique share ID
  const shareId = nanoid(10)
  
  // Extract team sharing info if present
  const url = request.url
  const teamLinkOwner = new URL(url).searchParams.get('owner') || null
  
  // Create the assessment result
  const assessmentResult = await prisma.assessmentResult.create({
    data: {
      invitationId: invitation.id,
      toolId: data.toolId,
      toolName: data.toolName,
      responses: data.responses || {},
      scores: data.scores || {},
      summary: data.summary || '',
      insights: data.insights || {},
      recommendations: data.recommendations || {},
      userProfile: data.userProfile || {},
      shareId,
      teamLinkOwner,
      userEmail: data.userProfile?.email || invitation.email,
      userName: data.userProfile?.name || null,
      company: data.userProfile?.company || null,
    }
  })
  
  // Update invitation status to COMPLETED
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { 
      status: 'COMPLETED',
      completedAt: new Date()
    }
  })
  
  // Note: User profile updates would happen separately if needed
  // The invitation model doesn't have clerkUserId in this schema
  
  return SuccessResponses.created(
    {
      assessmentResult: {
        id: assessmentResult.id,
        shareId: assessmentResult.shareId,
        completedAt: assessmentResult.completedAt,
      },
      invitation: {
        id: invitation.id,
        email: invitation.email,
        status: 'COMPLETED'
      }
    },
    'Assessment saved successfully'
  )
}

// Export without authentication requirement
// This endpoint is designed to be used by anonymous users
export const { POST } = createApiHandlers(
  {
    POST: handleSaveAssessment
  },
  { requireAuth: false }
)