import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// POST /api/team/claim - Claim a team member account
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { inviteCode } = await request.json()

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 })
    }

    // Find the team member by invite code
    const teamMember = await prisma.teamMember.findUnique({
      where: { inviteCode },
      include: {
        company: true,
        manager: true
      }
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    if (teamMember.clerkUserId) {
      return NextResponse.json({ error: 'Account already claimed' }, { status: 400 })
    }

    // Get or create the user profile
    let userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    })

    if (!userProfile) {
      // Get user info from Clerk
      const { clerkClient } = await import('@clerk/nextjs/server')
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      
      // Create user profile
      userProfile = await prisma.userProfile.create({
        data: {
          clerkUserId: userId,
          email: user.emailAddresses[0]?.emailAddress || teamMember.email || '',
          firstName: user.firstName,
          lastName: user.lastName,
          role: teamMember.role,
          companyId: teamMember.companyId,
          userType: 'TEAM_MEMBER'
        }
      })
    }

    // Update the team member with the claimed account
    const updatedTeamMember = await prisma.teamMember.update({
      where: { id: teamMember.id },
      data: {
        clerkUserId: userId,
        claimedAt: new Date(),
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({ 
      success: true,
      teamMember: updatedTeamMember,
      company: teamMember.company,
      manager: {
        firstName: teamMember.manager.firstName,
        lastName: teamMember.manager.lastName
      }
    })
  } catch (error) {
    console.error('Error claiming team member account:', error)
    return NextResponse.json({ error: 'Failed to claim account' }, { status: 500 })
  }
}

// GET /api/team/claim - Verify an invite code
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const inviteCode = url.searchParams.get('code')

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 })
    }

    // Find the team member by invite code
    const teamMember = await prisma.teamMember.findUnique({
      where: { inviteCode },
      include: {
        company: true,
        manager: true
      }
    })

    if (!teamMember) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    if (teamMember.clerkUserId) {
      return NextResponse.json({ error: 'Account already claimed' }, { status: 400 })
    }

    return NextResponse.json({ 
      valid: true,
      teamMember: {
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role
      },
      company: {
        name: teamMember.company.name,
        logo: teamMember.company.logo
      },
      manager: {
        firstName: teamMember.manager.firstName,
        lastName: teamMember.manager.lastName
      }
    })
  } catch (error) {
    console.error('Error verifying invite code:', error)
    return NextResponse.json({ error: 'Failed to verify invite code' }, { status: 500 })
  }
}