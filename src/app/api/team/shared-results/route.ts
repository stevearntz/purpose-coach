import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('[shared-results] Starting request')
    const { userId } = await auth()
    console.log('[shared-results] User ID:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: { email: true, clerkUserId: true }
    })
    
    if (!userProfile) {
      return NextResponse.json({ results: [], campaigns: [] })
    }

    // For MANAGER role: Fetch only TEAM_SHARE campaigns created by THIS specific manager
    // HR_CAMPAIGN types are handled in the admin dashboard
    const campaigns = await prisma.campaign.findMany({
      where: {
        createdBy: userId,  // Only show campaigns created by the current user
        campaignType: 'TEAM_SHARE'  // Only show team shares, not HR campaigns
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // For each campaign, get the response count from invitations
    const campaignsWithCounts = await Promise.all(campaigns.map(async (campaign) => {
      // Get the actual responses (don't rely on invitation status)
      const responses = campaign.campaignCode ? await prisma.assessmentResult.findMany({
        where: {
          invitation: {
            inviteCode: campaign.campaignCode
          }
        },
        select: {
          id: true,
          userName: true,
          userEmail: true,
          completedAt: true
        },
        orderBy: {
          completedAt: 'desc'
        }
      }) : []
      
      // Count actual responses, not invitation status
      const responseCount = responses.length

      return {
        id: campaign.id,
        name: campaign.name,
        toolName: campaign.toolName,
        toolPath: campaign.toolPath,
        campaignCode: campaign.campaignCode,
        campaignLink: campaign.campaignLink,
        createdAt: campaign.createdAt.toISOString(),
        responseCount,
        responses: responses.map(r => ({
          id: r.id,
          userName: r.userName,
          userEmail: r.userEmail,
          completedAt: r.completedAt.toISOString()
        }))
      }
    }))

    // Fetch individual assessment results shared by this manager
    // These are assessments where this manager is the teamLinkOwner
    // (Different from campaign-based assessments which use inviteCode)
    const teamResults = await prisma.assessmentResult.findMany({
      where: {
        teamLinkOwner: userId // Only show results where this user shared the link
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    const formattedResults = teamResults.map(result => {
      const profile = result.userProfile as any || {}
      return {
        id: result.id,
        toolId: result.toolId,
        toolName: result.toolName,
        completedAt: result.completedAt.toISOString(),
        shareId: result.shareId,
        user: {
          email: result.userEmail || profile.email || 'unknown@example.com',
          name: result.userName || profile.name || 'Unknown',
          company: result.company || profile.company || ''
        },
        responses: result.responses || {},
        scores: result.scores || {},
        summary: result.summary || {},
        insights: result.insights || {},
        recommendations: result.recommendations || {},
        userProfile: result.userProfile || {},
        pdfUrl: result.pdfUrl
      }
    })

    return NextResponse.json({ 
      results: formattedResults,
      campaigns: campaignsWithCounts 
    })
  } catch (error) {
    console.error('[shared-results] Error details:', error)
    console.error('[shared-results] Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}