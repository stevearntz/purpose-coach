import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    // Find all invitations for this email that have active campaigns
    const now = new Date()
    
    // First find invitations for this email
    const invitations = await prisma.invitation.findMany({
      where: {
        email: email.toLowerCase(),
        status: 'SENT' // Only show sent invitations (not completed ones)
      },
      include: {
        company: {
          include: {
            campaigns: {
              where: {
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
              }
            }
          }
        }
      }
    })

    // Extract unique campaigns from invitations
    const campaignsMap = new Map()
    
    for (const invitation of invitations) {
      if (!invitation.company) continue
      
      for (const campaign of invitation.company.campaigns) {
        // Parse campaign metadata from description if it's JSON
        let metadata: any = {}
        if (campaign.description) {
          try {
            metadata = JSON.parse(campaign.description)
          } catch {
            // If not JSON, keep description as is
            metadata = { message: campaign.description }
          }
        }
        
        // Check if this invitation is for this campaign (by matching campaign name in URL)
        const isForThisCampaign = invitation.inviteUrl?.includes(`campaign=${encodeURIComponent(campaign.name)}`)
        
        if (isForThisCampaign && !campaignsMap.has(campaign.id)) {
          campaignsMap.set(campaign.id, {
            id: campaign.id,
            name: campaign.name,
            description: metadata.message || metadata.customMessage || campaign.description || '',
            toolId: campaign.toolId || metadata.toolId || '',
            toolName: campaign.toolName || metadata.toolName || 'Assessment',
            startDate: campaign.startDate,
            endDate: campaign.endDate,
            createdAt: campaign.createdAt,
            inviteUrl: invitation.inviteUrl
          })
        }
      }
    }

    const campaigns = Array.from(campaignsMap.values())

    return NextResponse.json({ 
      campaigns,
      count: campaigns.length 
    })
  } catch (error) {
    console.error('Error fetching assigned campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assigned campaigns' },
      { status: 500 }
    )
  }
}