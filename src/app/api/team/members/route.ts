import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma-with-retry'

// GET /api/team/members - Get all team members for a manager
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      include: { company: true }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Get all team members managed by this user
    const teamMembers = await prisma.teamMember.findMany({
      where: { managerId: userProfile.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ teamMembers })
  } catch (error) {
    console.error('Error fetching team members:', error)
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 })
  }
}

// POST /api/team/members - Create new team members
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { members } = await request.json()

    if (!members || !Array.isArray(members)) {
      return NextResponse.json({ error: 'Invalid members data' }, { status: 400 })
    }

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      include: { company: true }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // If no companyId, try to get it from the user's organization or create a default
    let companyId = userProfile.companyId
    
    if (!companyId) {
      // Try to find or create a company based on the user's email domain
      const email = userProfile.email
      const domain = email.split('@')[1]
      
      // Look for existing company with this domain
      let company = await prisma.company.findFirst({
        where: { 
          domains: {
            has: domain
          }
        }
      })
      
      if (!company) {
        // Create a new company for this user
        company = await prisma.company.create({
          data: {
            name: domain,
            domains: [domain]
          }
        })
      }
      
      // Update user profile with the company ID
      await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: { companyId: company.id }
      })
      
      companyId = company.id
    }

    // Create team members
    const createdMembers = await Promise.all(
      members.map(async (member) => {
        const teamMember = await prisma.teamMember.create({
          data: {
            managerId: userProfile.id,
            companyId: companyId,
            name: member.name,
            email: member.email || null,
            role: member.role || null,
            status: 'PENDING',
            inviteCode: member.email ? generateInviteCode() : null
          }
        })

        // Create team membership linking this member to the manager's team
        await prisma.teamMembership.create({
          data: {
            teamMemberId: teamMember.id,
            teamOwnerId: userProfile.id
          }
        })

        return teamMember
      })
    )

    return NextResponse.json({ teamMembers: createdMembers })
  } catch (error) {
    console.error('Error creating team members:', error)
    return NextResponse.json({ error: 'Failed to create team members' }, { status: 500 })
  }
}

// PUT /api/team/members - Update team members
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { members } = await request.json()

    if (!members || !Array.isArray(members)) {
      return NextResponse.json({ error: 'Invalid members data' }, { status: 400 })
    }

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Update existing members and create new ones
    const updatedMembers = await Promise.all(
      members.map(async (member) => {
        if (member.id && member.id.startsWith('existing-')) {
          // Update existing member
          const id = member.id.replace('existing-', '')
          return await prisma.teamMember.update({
            where: { id },
            data: {
              name: member.name,
              email: member.email || null,
              role: member.role || null
            }
          })
        } else {
          // Create new member
          // Ensure we have a companyId
          let companyId = userProfile.companyId
          if (!companyId) {
            const email = userProfile.email
            const domain = email.split('@')[1]
            let company = await prisma.company.findFirst({
              where: { 
                domains: {
                  has: domain
                }
              }
            })
            if (!company) {
              company = await prisma.company.create({
                data: {
                  name: domain,
                  domains: [domain]
                }
              })
            }
            await prisma.userProfile.update({
              where: { id: userProfile.id },
              data: { companyId: company.id }
            })
            companyId = company.id
          }
          
          const teamMember = await prisma.teamMember.create({
            data: {
              managerId: userProfile.id,
              companyId: companyId,
              name: member.name,
              email: member.email || null,
              role: member.role || null,
              status: 'PENDING',
              inviteCode: member.email ? generateInviteCode() : null
            }
          })

          // Create team membership
          await prisma.teamMembership.create({
            data: {
              teamMemberId: teamMember.id,
              teamOwnerId: userProfile.id
            }
          })

          return teamMember
        }
      })
    )

    return NextResponse.json({ teamMembers: updatedMembers })
  } catch (error) {
    console.error('Error updating team members:', error)
    return NextResponse.json({ error: 'Failed to update team members' }, { status: 500 })
  }
}

// DELETE /api/team/members/:id - Delete a team member
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(request.url)
    const memberId = url.searchParams.get('id')

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID required' }, { status: 400 })
    }

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Verify the member belongs to this manager
    const member = await prisma.teamMember.findFirst({
      where: {
        id: memberId,
        managerId: userProfile.id
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Team member not found' }, { status: 404 })
    }

    // Delete the team member (cascades to memberships and invitations)
    await prisma.teamMember.delete({
      where: { id: memberId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting team member:', error)
    return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 })
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}