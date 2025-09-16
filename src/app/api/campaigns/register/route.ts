import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, orgId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { campaignCode, email, firstName, lastName } = body
    
    if (!campaignCode) {
      return NextResponse.json(
        { error: 'Campaign code is required' },
        { status: 400 }
      )
    }
    
    // Find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { campaignCode },
      include: { company: true }
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Invalid campaign code' },
        { status: 404 }
      )
    }
    
    // Check if campaign is active
    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      )
    }
    
    // Check if user already has a profile
    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    })
    
    if (userProfile) {
      // Update existing profile to be a team member
      userProfile = await prisma.userProfile.update({
        where: { clerkUserId: userId },
        data: {
          userType: 'TEAM_MEMBER',
          invitedVia: campaignCode,
          companyId: campaign.companyId,
          firstName: firstName || userProfile.firstName,
          lastName: lastName || userProfile.lastName
        }
      })
    } else {
      // Create new profile as team member
      userProfile = await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          email: email || '',
          firstName: firstName || '',
          lastName: lastName || '',
          userType: 'TEAM_MEMBER',
          invitedVia: campaignCode,
          invitedBy: campaign.createdBy || undefined,
          companyId: campaign.companyId,
          onboardingComplete: false
        }
      })
    }
    
    // Add user email to campaign participants if not already there
    const userEmail = userProfile.email
    if (userEmail && !campaign.participants.includes(userEmail)) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: {
          participants: {
            push: userEmail
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      userProfile,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        toolPath: campaign.toolPath,
        toolName: campaign.toolName,
        company: {
          name: campaign.company.name
        }
      }
    })
    
  } catch (error) {
    console.error('Error registering for campaign:', error)
    return NextResponse.json(
      { error: 'Failed to register for campaign' },
      { status: 500 }
    )
  }
}

// GET endpoint to validate campaign code
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignCode = searchParams.get('code')
    
    if (!campaignCode) {
      return NextResponse.json(
        { error: 'Campaign code is required' },
        { status: 400 }
      )
    }
    
    // Find the campaign
    const campaign = await prisma.campaign.findUnique({
      where: { campaignCode },
      include: { company: true }
    })
    
    if (!campaign) {
      return NextResponse.json(
        { valid: false, error: 'Invalid campaign code' },
        { status: 404 }
      )
    }
    
    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { valid: false, error: 'Campaign is not active' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      valid: true,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        toolPath: campaign.toolPath,
        toolName: campaign.toolName,
        company: {
          name: campaign.company.name
        }
      }
    })
    
  } catch (error) {
    console.error('Error validating campaign:', error)
    return NextResponse.json(
      { valid: false, error: 'Failed to validate campaign' },
      { status: 500 }
    )
  }
}