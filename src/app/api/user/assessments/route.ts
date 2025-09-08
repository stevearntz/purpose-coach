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
    // Get user's email from their profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: { email: true }
    })

    if (!userProfile?.email) {
      return successResponse({ assessments: [] })
    }

    // Find all invitations for this email that have assessment results
    const invitations = await prisma.invitation.findMany({
      where: {
        email: userProfile.email,
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

    return successResponse({ assessments })
  } catch (error) {
    console.error('[Assessments API] Error fetching assessments:', error)
    throw CommonErrors.internalError('Failed to fetch assessments')
  }
}

export const { GET } = createApiHandlers({
  GET: handleGetAssessments
})