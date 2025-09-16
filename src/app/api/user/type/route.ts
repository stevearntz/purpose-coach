import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { userId, orgRole } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // First, check if user has a profile with userType
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: {
        userType: true,
        companyId: true
      }
    })
    
    if (userProfile?.userType) {
      return NextResponse.json({
        userType: userProfile.userType,
        hasProfile: true
      })
    }
    
    // If no profile or no userType, determine based on Clerk org role
    // org:admin in Clerk maps to ADMIN
    // Everything else defaults to MANAGER for now
    let userType = 'MANAGER'
    
    if (orgRole === 'org:admin') {
      userType = 'ADMIN'
    }
    
    // If they have a profile but no userType, update it
    if (userProfile && !userProfile.userType) {
      await prisma.userProfile.update({
        where: { clerkUserId: userId },
        data: { userType: userType as any }
      })
    }
    
    return NextResponse.json({
      userType,
      hasProfile: !!userProfile
    })
    
  } catch (error) {
    console.error('Error getting user type:', error)
    return NextResponse.json(
      { error: 'Failed to get user type' },
      { status: 500 }
    )
  }
}