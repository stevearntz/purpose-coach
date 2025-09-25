import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    const now = new Date()
    const userEmail = email.toLowerCase()
    
    // Find all campaigns where this user is a participant
    const campaigns = await prisma.campaign.findMany({
      where: {
        participants: {
          has: userEmail
        },
        status: 'ACTIVE',
        OR: [
          // Campaign has no start date or has started
          { startDate: null },
          { startDate: { lte: now } }
        ],
        AND: [
          // Campaign has no end date or hasn't ended
          {
            OR: [
              { endDate: null },
              { endDate: { gte: now } }
            ]
          }
        ]
      },
      include: {
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get completed campaign IDs for this user
    const completedCampaignIds = new Set<string>()
    
    // Check invitations that are completed for this user
    const completedInvitations = await prisma.invitation.findMany({
      where: {
        email: userEmail,
        status: 'COMPLETED',
        campaignId: { not: null }
      },
      select: {
        campaignId: true
      }
    })
    
    // Add completed campaign IDs
    for (const invitation of completedInvitations) {
      if (invitation.campaignId) {
        completedCampaignIds.add(invitation.campaignId)
      }
    }
    
    // Transform campaigns for the dashboard
    // Filter out only campaigns that haven't been completed yet
    const transformedCampaigns = campaigns
      .filter(campaign => {
        // Only show campaigns that haven't been completed
        return !completedCampaignIds.has(campaign.id)
      })
      .map(campaign => {
        // For campaign-based assessments, we don't track individual invitations
        // Each campaign is independent
        // Use better description for Needs Assessment
        let description = campaign.description;
        if (!description || description.includes('assessment campaign')) {
          if (campaign.toolName?.includes('Needs Assessment')) {
            description = 'Share your needs so that we can provide you with growth and support you on your leadership journey';
          } else {
            description = 'Complete this assessment to help us understand your needs';
          }
        }
        
        return {
          id: campaign.id,
          name: campaign.name,
          description: description,
          toolId: campaign.toolId || '',
          toolName: campaign.toolName || 'Assessment',
          toolPath: campaign.toolPath || '',
          campaignCode: campaign.campaignCode || '',
          inviteCode: '', // Campaign-based assessments don't need individual invite codes
          status: 'PENDING', // If it's in the list, it's pending
          completedAt: null,
          startDate: campaign.startDate,
          endDate: campaign.endDate,
          createdAt: campaign.createdAt
        }
      })

    return NextResponse.json({ 
      campaigns: transformedCampaigns,
      count: transformedCampaigns.length 
    })
  } catch (error) {
    console.error('Error fetching assigned campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assigned campaigns' },
      { status: 500 }
    )
  }
}