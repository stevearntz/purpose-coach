import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = SaveAssessmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
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
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }
    
    // Generate a unique share ID
    const shareId = generateShareId()
    
    // Save the assessment result
    const assessmentResult = await prisma.assessmentResult.create({
      data: {
        invitationId: invitation.id,
        toolId: data.toolId,
        toolName: data.toolName,
        responses: data.responses as any,
        scores: data.scores ? (data.scores as any) : undefined,
        summary: data.summary || null,
        insights: data.insights ? (data.insights as any) : undefined,
        recommendations: data.recommendations ? (data.recommendations as any) : undefined,
        userProfile: data.userProfile ? (data.userProfile as any) : undefined,
        shareId,
      }
    })
    
    // Update invitation status if not already completed
    if (invitation.status !== 'COMPLETED') {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        }
      })
      
      // Update metadata with tool access
      await prisma.invitationMetadata.upsert({
        where: { invitationId: invitation.id },
        create: {
          invitationId: invitation.id,
          toolsAccessed: [data.toolId],
        },
        update: {
          toolsAccessed: {
            push: data.toolId
          }
        }
      })
    }
    
    console.log('[assessment-save] Assessment result saved:', {
      id: assessmentResult.id,
      invitationId: invitation.id,
      toolId: data.toolId,
      shareId
    })
    
    return NextResponse.json({
      success: true,
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
    })
    
  } catch (error) {
    console.error('[assessment-save] Error saving assessment:', error)
    return NextResponse.json(
      { error: 'Failed to save assessment result' },
      { status: 500 }
    )
  }
}

// Helper function to generate a unique share ID
function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}