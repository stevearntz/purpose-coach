import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId, orgId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the current user's profile to check permissions
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: { userType: true, companyId: true }
    })
    
    // Only ADMIN users can access this endpoint
    if (userProfile?.userType !== 'ADMIN') {
      return NextResponse.json({ 
        error: 'Forbidden - Admin access required' 
      }, { status: 403 })
    }

    // Get company based on org or user's company
    let companyId = userProfile.companyId
    if (orgId) {
      const company = await prisma.company.findUnique({
        where: { clerkOrgId: orgId },
        select: { id: true }
      })
      if (company) {
        companyId = company.id
      }
    }

    if (!companyId) {
      return NextResponse.json({ 
        error: 'No company found' 
      }, { status: 404 })
    }

    // Fetch only HR_CAMPAIGN types for the company (not TEAM_SHARE)
    // This is for HR/Admin to see official HR campaigns only
    const campaigns = await prisma.campaign.findMany({
      where: {
        companyId: companyId,
        campaignType: 'HR_CAMPAIGN'  // Only show HR campaigns, not manager team shares
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        company: true
      }
    })

    // Get response counts and details for each campaign
    const campaignsWithDetails = await Promise.all(campaigns.map(async (campaign) => {
      // Count completed invitations
      const responseCount = campaign.campaignCode ? await prisma.invitation.count({
        where: {
          inviteCode: campaign.campaignCode,
          status: 'COMPLETED'
        }
      }) : 0

      // Get the actual responses
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
          completedAt: true,
          scores: true,
          summary: true,
          company: true
        },
        orderBy: {
          completedAt: 'desc'
        }
      }) : []

      // Get creator info
      const creator = await prisma.userProfile.findUnique({
        where: { clerkUserId: campaign.createdBy || '' },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          userType: true
        }
      })

      return {
        id: campaign.id,
        name: campaign.name,
        toolName: campaign.toolName,
        toolPath: campaign.toolPath,
        campaignCode: campaign.campaignCode,
        campaignLink: campaign.campaignLink,
        status: campaign.status,
        createdAt: campaign.createdAt.toISOString(),
        createdBy: {
          id: campaign.createdBy,
          name: creator ? `${creator.firstName} ${creator.lastName}`.trim() : 'Unknown',
          email: creator?.email,
          role: creator?.userType
        },
        company: campaign.company.name,
        responseCount,
        responses: responses.map(r => ({
          id: r.id,
          userName: r.userName,
          userEmail: r.userEmail,
          company: r.company,
          completedAt: r.completedAt.toISOString(),
          scores: r.scores,
          summary: r.summary
        }))
      }
    }))

    return NextResponse.json({ 
      campaigns: campaignsWithDetails,
      total: campaignsWithDetails.length
    })
  } catch (error) {
    console.error('Error in admin campaigns API:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}