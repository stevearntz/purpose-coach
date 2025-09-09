import { createApiHandlers, ApiContext } from '@/lib/api/handler'
import { successResponse } from '@/lib/api/responses'
import { CommonErrors } from '@/lib/api/errors'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

async function handleGetAssessments(context: ApiContext) {
  const { userId } = await auth()
  
  if (!userId) {
    throw CommonErrors.unauthorized()
  }

  try {
    // Get user's email from their profile AND from Clerk
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: { email: true }
    })

    // Also get email from Clerk in case it's different
    const { clerkClient } = await import('@clerk/nextjs/server')
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const clerkEmail = user.emailAddresses[0]?.emailAddress

    // Create an array of emails to check (both profile and Clerk)
    const emailsToCheck = []
    if (userProfile?.email) emailsToCheck.push(userProfile.email)
    if (clerkEmail && clerkEmail !== userProfile?.email) emailsToCheck.push(clerkEmail)
    
    if (emailsToCheck.length === 0) {
      return successResponse({ assessments: [] })
    }

    console.log('[Assessments API] Checking for assessments with emails:', emailsToCheck)

    // Find all invitations for any of these emails that have assessment results
    const invitations = await prisma.invitation.findMany({
      where: {
        email: { in: emailsToCheck },
        assessmentResults: {
          some: {}
        }
      },
      include: {
        assessmentResults: {
          orderBy: {
            completedAt: 'desc'
          }
        }
      }
    })

    console.log(`[Assessments API] Found ${invitations.length} invitations with results`)

    // Transform the data for the frontend
    const assessments = invitations.flatMap(invitation => 
      invitation.assessmentResults.map(result => ({
        id: result.id,
        toolId: result.toolId,
        toolName: result.toolName,
        status: 'COMPLETED', // All results in DB are completed
        completedAt: result.completedAt,
        scores: result.scores,
        summary: result.summary,
        shareId: result.shareId,
        pdfUrl: result.pdfUrl,
        inviteCode: invitation.inviteCode,
        userEmail: result.userEmail || invitation.email
      }))
    )

    // Also check for any assessment results that might have the user's email directly
    // This handles cases where userEmail was set on AssessmentResult
    const directResults = await prisma.assessmentResult.findMany({
      where: {
        userEmail: { in: emailsToCheck }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    console.log(`[Assessments API] Found ${directResults.length} direct assessment results`)

    // Add any direct results not already included
    for (const result of directResults) {
      if (!assessments.find(a => a.id === result.id)) {
        assessments.push({
          id: result.id,
          toolId: result.toolId,
          toolName: result.toolName,
          status: 'COMPLETED',
          completedAt: result.completedAt,
          scores: result.scores,
          summary: result.summary,
          shareId: result.shareId,
          pdfUrl: result.pdfUrl,
          inviteCode: '', // No invite code for direct results
          userEmail: result.userEmail || ''
        })
      }
    }

    console.log(`[Assessments API] Returning ${assessments.length} total assessments`)

    return successResponse({ assessments })
  } catch (error) {
    console.error('[Assessments API] Error fetching assessments:', error)
    throw CommonErrors.internalError('Failed to fetch assessments')
  }
}

export const { GET } = createApiHandlers({
  GET: handleGetAssessments
})