import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

// Generate a unique campaign code
function generateCampaignCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth()
    
    console.log('[Campaign Create] Auth:', { userId, orgId })
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - must be logged in' },
        { status: 401 }
      )
    }
    
    // If no orgId, try to get company from user profile
    let companyId: string | null = null
    
    if (!orgId) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { clerkUserId: userId }
      })
      
      if (userProfile?.companyId) {
        companyId = userProfile.companyId
      } else {
        return NextResponse.json(
          { error: 'No organization found. Please join or create an organization.' },
          { status: 400 }
        )
      }
    }
    
    const body = await request.json()
    const { toolId, toolTitle, toolPath } = body
    
    if (!toolId || !toolTitle || !toolPath) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get the company - either from Clerk org ID or from companyId we found earlier
    let company
    
    if (orgId) {
      company = await prisma.company.findUnique({
        where: { clerkOrgId: orgId }
      })
      
      if (!company) {
        console.error(`Company not found for Clerk org ID: ${orgId}`)
        return NextResponse.json(
          { error: `Company not found for organization ${orgId}` },
          { status: 404 }
        )
      }
    } else if (companyId) {
      company = await prisma.company.findUnique({
        where: { id: companyId }
      })
      
      if (!company) {
        console.error(`Company not found for ID: ${companyId}`)
        return NextResponse.json(
          { error: `Company not found` },
          { status: 404 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'No company association found' },
        { status: 400 }
      )
    }
    
    // Generate a unique campaign code
    let campaignCode = generateCampaignCode()
    let attempts = 0
    
    // Make sure the code is unique
    while (attempts < 10) {
      const existing = await prisma.campaign.findUnique({
        where: { campaignCode }
      })
      
      if (!existing) break
      
      campaignCode = generateCampaignCode()
      attempts++
    }
    
    if (attempts >= 10) {
      return NextResponse.json(
        { error: 'Failed to generate unique campaign code' },
        { status: 500 }
      )
    }
    
    // Get user's role to determine campaign type
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: { userType: true }
    })
    
    // Create the campaign with appropriate type
    const campaign = await prisma.campaign.create({
      data: {
        name: `${toolTitle} - ${new Date().toLocaleDateString()}`,
        description: `Share link for ${toolTitle}`,
        companyId: company.id,
        status: 'ACTIVE',
        campaignType: userProfile?.userType === 'ADMIN' ? 'HR_CAMPAIGN' : 'TEAM_SHARE',
        toolId,
        toolName: toolTitle,
        toolPath,
        campaignCode,
        campaignLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}${toolPath}?campaign=${campaignCode}`,
        createdBy: userId,
        startDate: new Date()
      }
    })
    
    // Create a generic invitation with the campaign code as the invite code
    // This allows assessments to be linked to the campaign
    await prisma.invitation.create({
      data: {
        email: `campaign-${campaignCode}@team.local`, // Placeholder email for campaign
        name: `Campaign: ${toolTitle}`,
        inviteCode: campaignCode, // Use campaign code as invite code
        inviteUrl: campaign.campaignLink || '', // Provide empty string if null
        status: 'SENT',
        companyId: company.id,
        metadata: {
          create: {
            isGenericLink: true,
            role: 'Team Member'
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      campaignCode: campaign.campaignCode,
      shareLink: campaign.campaignLink
    })
    
  } catch (error) {
    console.error('Error creating campaign:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}