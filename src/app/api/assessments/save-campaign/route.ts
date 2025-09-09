import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

// Validation schema for campaign-based assessment saving
const SaveCampaignAssessmentSchema = z.object({
  campaignCode: z.string().min(1, 'Campaign code is required'),
  email: z.string().email('Valid email is required'),
  name: z.string().optional(),
  toolId: z.string().min(1, 'Tool ID is required'),
  toolName: z.string().min(1, 'Tool name is required'),
  responses: z.any(),
  scores: z.any().optional(),
  summary: z.string().optional(),
  insights: z.any().optional(),
  recommendations: z.any().optional(),
  userProfile: z.any().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validationResult = SaveCampaignAssessmentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }
    
    const data = validationResult.data
    
    // Find the campaign by code
    const campaign = await prisma.campaign.findUnique({
      where: { campaignCode: data.campaignCode }
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    // Find or create invitation for this email and campaign
    let invitation = await prisma.invitation.findFirst({
      where: {
        email: data.email,
        companyId: campaign.companyId,
        inviteUrl: {
          contains: data.campaignCode
        }
      }
    })
    
    if (!invitation) {
      // Create new invitation for this participant
      const inviteCode = nanoid(10)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const individualLink = `${baseUrl}/assessment/${data.campaignCode}?invite=${inviteCode}`
      
      invitation = await prisma.invitation.create({
        data: {
          email: data.email,
          name: data.name || data.email.split('@')[0],
          inviteCode,
          inviteUrl: individualLink,
          companyId: campaign.companyId,
          status: 'STARTED', // They're already taking the assessment
        }
      })
      
      // Created new invitation
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
    
    // Update invitation status to completed
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        // Update name if provided
        name: data.responses?.name || data.userProfile?.name || invitation.name
      }
    })
    
    // Update metadata with tool access and profile data
    await prisma.invitationMetadata.upsert({
      where: { invitationId: invitation.id },
      create: {
        invitationId: invitation.id,
        toolsAccessed: [data.toolId],
        department: (data.responses as any)?.department || (data.userProfile as any)?.department || null,
        // Note: teamSize is not in InvitationMetadata schema, would need to be added
      },
      update: {
        toolsAccessed: {
          push: data.toolId
        },
        department: (data.responses as any)?.department || (data.userProfile as any)?.department || null,
      }
    })
    
    // Assessment saved for campaign
    
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
    console.error('[save-campaign] Error saving assessment:', error)
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