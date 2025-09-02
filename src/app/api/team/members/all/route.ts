import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// DELETE /api/team/members/all - Delete all team members for a manager
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user's profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    })

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Delete all team members for this manager
    await prisma.teamMember.deleteMany({
      where: { managerId: userProfile.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting all team members:', error)
    return NextResponse.json({ error: 'Failed to delete team members' }, { status: 500 })
  }
}