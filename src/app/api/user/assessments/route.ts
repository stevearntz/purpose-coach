import { createApiHandlers } from '@/lib/api/handler'
import { successResponse } from '@/lib/api/responses'
import { CommonErrors } from '@/lib/api/errors'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'
import { ApiContext } from '@/lib/api/types'

async function handleGetAssessments(context: ApiContext) {
  const { userId } = await auth()
  
  if (!userId) {
    throw CommonErrors.UNAUTHORIZED
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
        status: result.status,
        completedAt: result.completedAt,
        score: result.score,
        resultsUrl: result.resultsUrl,
        campaignName: invitation.campaignName,
        campaignCode: invitation.campaignCode
      }))
    )

    return successResponse({ assessments })
  } catch (error) {
    console.error('[Assessments API] Error fetching assessments:', error)
    throw CommonErrors.INTERNAL_SERVER_ERROR
  }
}

export const { GET } = createApiHandlers({
  GET: handleGetAssessments
})