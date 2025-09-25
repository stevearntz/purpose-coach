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

    // Get all completed assessments for this user
    // We need to check which campaign codes they've already completed
    const completedAssessments = await prisma.assessmentResult.findMany({
      where: {
        userEmail: userEmail
      },
      select: {
        id: true,
        completedAt: true,
        invitation: {
          select: {
            inviteCode: true
          }
        }
      }
    })
    
    // Extract campaign codes from completed assessments
    // The inviteCode often contains or matches the campaign code
    const completedCampaignCodes = new Set<string>()
    
    // Also check invitations directly to see which campaigns have been marked as completed
    const completedInvitations = await prisma.invitation.findMany({
      where: {
        email: userEmail,
        status: 'COMPLETED'
      },
      select: {
        inviteCode: true
      }
    })
    
    // Add completed invitation codes that match campaign codes
    for (const invitation of completedInvitations) {
      // Check if this invite code matches any campaign code
      const matchingCampaign = campaigns.find(c => 
        c.campaignCode && invitation.inviteCode.includes(c.campaignCode)
      )
      if (matchingCampaign?.campaignCode) {
        completedCampaignCodes.add(matchingCampaign.campaignCode)
      }
    }
    
    // Transform campaigns for the dashboard
    // Filter out only campaigns that haven't been completed yet
    const transformedCampaigns = campaigns
      .filter(campaign => {
        // Only show campaigns that haven't been completed
        // Each campaign with a unique campaign code should be treated independently
        return !completedCampaignCodes.has(campaign.campaignCode || '')
      })
      .map(campaign => {
        // For campaign-based assessments, we don't track individual invitations
        // Each campaign is independent
        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description || 'Complete this assessment to help us understand your needs',
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