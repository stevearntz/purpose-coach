import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    // Get database URL (masked for security)
    const dbUrl = process.env.DATABASE_URL || 'not set'
    const maskedUrl = dbUrl.replace(/:[^@]+@/, ':****@')
    
    // Test database connection
    const companies = await prisma.company.count()
    const users = await prisma.userProfile.count()
    
    // Get current user profile if logged in
    let userProfile = null
    if (userId) {
      userProfile = await prisma.userProfile.findUnique({
        where: { clerkUserId: userId },
        include: { company: true }
      })
    }
    
    return NextResponse.json({
      status: 'connected',
      environment: process.env.NODE_ENV,
      database: {
        url: maskedUrl,
        connected: true,
        counts: {
          companies,
          users
        }
      },
      currentUser: userId ? {
        clerkId: userId,
        profileFound: !!userProfile,
        profile: userProfile ? {
          email: userProfile.email,
          teamName: userProfile.teamName,
          company: userProfile.company?.name
        } : null
      } : 'Not logged in'
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      database: {
        url: process.env.DATABASE_URL ? 'Set but failed' : 'Not set'
      }
    }, { status: 500 })
  }
}