import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma-with-retry'

// GET /api/team/invitations - Get invitations for a team member or manager
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const role = url.searchParams.get('role') // 'manager' or 'member'

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    let invitations

    if (role === 'manager') {
      // Get all invitations sent by this manager
      const teamMembers = await prisma.teamMember.findMany({
        where: { managerId: userProfile.id },
        include: {
          teamInvitations: {
            include: {
              campaign: true
            }
          }
        }
      })

      invitations = teamMembers.flatMap(member => 
        member.teamInvitations.map(inv => ({
          ...inv,
          teamMemberName: member.name,
          teamMemberEmail: member.email
        }))
      )
    } else {
      // Get invitations for this team member
      const teamMember = await prisma.teamMember.findFirst({
        where: { clerkUserId: userId }
      })

      if (!teamMember) {
        return NextResponse.json({ invitations: [] })
      }

      invitations = await prisma.teamInvitation.findMany({
        where: { teamMemberId: teamMember.id },
        include: {
          campaign: true,
          teamMember: true
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error fetching invitations:', error)
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 })
  }
}

// POST /api/team/invitations - Create invitations for team members
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { campaignId, teamMemberIds } = await request.json()

    if (!campaignId || !teamMemberIds || !Array.isArray(teamMemberIds)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify the campaign exists and belongs to the user's company
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        companyId: userProfile.companyId!
      }
    })

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })
    }

    // Verify all team members belong to this manager
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        id: { in: teamMemberIds },
        managerId: userProfile.id
      }
    })

    if (teamMembers.length !== teamMemberIds.length) {
      return NextResponse.json({ error: 'Invalid team members' }, { status: 400 })
    }

    // Create invitations
    const invitations = await Promise.all(
      teamMembers.map(async (member) => {
        const inviteCode = generateInviteCode()
        const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/team/assessment/${inviteCode}`

        return await prisma.teamInvitation.create({
          data: {
            teamMemberId: member.id,
            campaignId,
            inviteCode,
            inviteUrl,
            status: 'PENDING'
          }
        })
      })
    )

    return NextResponse.json({ invitations })
  } catch (error) {
    console.error('Error creating invitations:', error)
    return NextResponse.json({ error: 'Failed to create invitations' }, { status: 500 })
  }
}

// PUT /api/team/invitations/:id - Update invitation status
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const invitationId = url.searchParams.get('id')
    const { status } = await request.json()

    if (!invitationId || !status) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    // Update the invitation
    const invitation = await prisma.teamInvitation.update({
      where: { id: invitationId },
      data: {
        status,
        sentAt: status === 'SENT' ? new Date() : undefined,
        completedAt: status === 'COMPLETED' ? new Date() : undefined
      }
    })

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('Error updating invitation:', error)
    return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 })
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}