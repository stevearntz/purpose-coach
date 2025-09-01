import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: campaignCode } = await params
    
    // Find campaign by code
    const campaign = await prisma.campaign.findFirst({
      where: { 
        campaignCode: campaignCode 
      }
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    // Parse campaign metadata from description if it's JSON
    let metadata: any = {}
    if (campaign.description) {
      try {
        metadata = JSON.parse(campaign.description)
      } catch {
        metadata = { message: campaign.description }
      }
    }
    
    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      toolPath: campaign.toolPath || metadata.toolPath || '/people-leader-needs',
      toolId: campaign.toolId || metadata.toolId || 'people-leader-needs',
      toolName: campaign.toolName || metadata.toolName || 'People Leadership Needs Assessment',
      companyId: campaign.companyId
    })
    
  } catch (error) {
    console.error('[campaign-by-code] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}