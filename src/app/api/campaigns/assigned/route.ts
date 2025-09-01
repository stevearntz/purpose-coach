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
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get invite codes for this user
    const invitations = await prisma.invitation.findMany({
      where: {
        email: userEmail,
        companyId: { in: campaigns.map(c => c.companyId) }
      },
      select: {
        inviteCode: true,
        companyId: true
      }
    })
    
    // Create a map of companyId to inviteCode
    const inviteMap = new Map(invitations.map(inv => [inv.companyId, inv.inviteCode]))
    
    // Transform campaigns for the dashboard
    const transformedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      description: campaign.description || 'Complete this assessment to help us understand your needs',
      toolId: campaign.toolId || '',
      toolName: campaign.toolName || 'Assessment',
      toolPath: campaign.toolPath || '',
      campaignCode: campaign.campaignCode || '',
      inviteCode: inviteMap.get(campaign.companyId) || '',
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      createdAt: campaign.createdAt
    }))

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