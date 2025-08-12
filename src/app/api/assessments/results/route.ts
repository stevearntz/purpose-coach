import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const invitationId = searchParams.get('invitationId')
    const email = searchParams.get('email')
    const companyId = searchParams.get('companyId')
    const toolId = searchParams.get('toolId')
    
    // Build the where clause
    const where: any = {}
    
    if (invitationId) {
      where.invitationId = invitationId
    }
    
    if (email) {
      where.invitation = {
        email: email
      }
    }
    
    if (companyId) {
      where.invitation = {
        companyId: companyId
      }
    }
    
    if (toolId) {
      where.toolId = toolId
    }
    
    // Fetch assessment results with invitation details
    const results = await prisma.assessmentResult.findMany({
      where,
      include: {
        invitation: {
          select: {
            id: true,
            email: true,
            name: true,
            status: true,
            company: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })
    
    // Transform the results for the frontend
    const transformedResults = results.map(result => ({
      id: result.id,
      invitationId: result.invitationId,
      toolId: result.toolId,
      toolName: result.toolName,
      completedAt: result.completedAt,
      shareId: result.shareId,
      
      // User info from invitation
      user: {
        email: result.invitation.email,
        name: result.invitation.name || (result.userProfile as any)?.name || 'Unknown',
        company: result.invitation.company.name,
      },
      
      // Assessment data
      responses: result.responses,
      scores: result.scores,
      summary: result.summary,
      insights: result.insights,
      recommendations: result.recommendations,
      userProfile: result.userProfile,
      
      // PDF info
      pdfUrl: result.pdfUrl,
      pdfGeneratedAt: result.pdfGeneratedAt,
    }))
    
    return NextResponse.json({
      success: true,
      results: transformedResults,
      count: transformedResults.length
    })
    
  } catch (error) {
    console.error('[assessment-results] Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment results' },
      { status: 500 }
    )
  }
}

// GET single assessment result by share ID
export async function POST(request: NextRequest) {
  try {
    const { shareId } = await request.json()
    
    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      )
    }
    
    const result = await prisma.assessmentResult.findUnique({
      where: { shareId },
      include: {
        invitation: {
          select: {
            email: true,
            name: true,
            company: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    })
    
    if (!result) {
      return NextResponse.json(
        { error: 'Assessment result not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      result: {
        id: result.id,
        toolId: result.toolId,
        toolName: result.toolName,
        completedAt: result.completedAt,
        
        user: {
          email: result.invitation.email,
          name: result.invitation.name || (result.userProfile as any)?.name || 'Unknown',
          company: result.invitation.company.name,
        },
        
        responses: result.responses,
        scores: result.scores,
        summary: result.summary,
        insights: result.insights,
        recommendations: result.recommendations,
        userProfile: result.userProfile,
      }
    })
    
  } catch (error) {
    console.error('[assessment-result-by-share] Error fetching result:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessment result' },
      { status: 500 }
    )
  }
}