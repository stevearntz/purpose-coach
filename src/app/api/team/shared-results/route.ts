import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return empty results since we can't access the database
    // When the database is available, we'll fetch team results based on teamLinkOwner
    // matching the current user's email
    
    // In production, uncomment this code when database is available:
    /*
    const { prisma } = await import('@/lib/prisma')
    
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      select: { email: true }
    })
    
    if (!userProfile) {
      return NextResponse.json({ results: [] })
    }

    const teamResults = await prisma.assessmentResult.findMany({
      where: {
        // Store team link owner in userProfile JSON field
        userProfile: {
          path: ['teamLinkOwner'],
          equals: userProfile.email
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })

    const formattedResults = teamResults.map(result => {
      const profile = result.userProfile as any || {}
      return {
        id: result.id,
        toolId: result.toolId,
        toolName: result.toolName,
        completedAt: result.completedAt.toISOString(),
        shareId: result.shareId,
        user: {
          email: profile.email || 'unknown@example.com',
          name: profile.name || 'Unknown',
          company: profile.company || ''
        },
        responses: result.responses || {},
        scores: result.scores || {},
        summary: result.summary || {},
        insights: result.insights || {},
        recommendations: result.recommendations || {},
        userProfile: result.userProfile || {},
        pdfUrl: result.pdfUrl
      }
    })

    return NextResponse.json({ results: formattedResults })
    */

    // Return empty results for now (no mock data)
    return NextResponse.json({ results: [] })
  } catch (error) {
    console.error('Error in team shared results API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}