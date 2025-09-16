import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { mapPriorityToFullText } from '@/utils/priorityMapping'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const searchParams = request.nextUrl.searchParams
    const campaignCode = searchParams.get('campaignCode')
    
    if (!campaignCode) {
      return NextResponse.json(
        { error: 'Campaign code is required' },
        { status: 400 }
      )
    }
    
    // Get the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        campaignCode,
        createdBy: userId, // Only allow access to own campaigns
        campaignType: 'TEAM_SHARE'
      }
    })
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
    // Get all assessment results for this campaign
    const assessmentResults = await prisma.assessmentResult.findMany({
      where: {
        invitation: {
          inviteCode: campaignCode
        }
      },
      include: {
        invitation: true
      }
    })
    
    // Aggregate the data
    const aggregated: any = {
      challengeAreas: {},
      skills: {},
      supportNeeds: {},
      focusAreas: {}
    }
    
    // Process each result
    assessmentResults.forEach((result) => {
      if (result.responses && typeof result.responses === 'object') {
        const responses = result.responses as any
        
        // Aggregate challenges by category
        if (responses.categoryDetails) {
          const categoryOrder = ['performance', 'leadership', 'compliance']
          const categoryNames: Record<string, string> = {
            'performance': 'Individual Performance',
            'leadership': 'Leadership Skills',
            'compliance': 'Compliance & Risk'
          }
          
          Object.entries(responses.categoryDetails).forEach(([category, details]: [string, any]) => {
            const categoryName = categoryNames[category.toLowerCase()] || category
            
            if (!aggregated.challengeAreas[category]) {
              aggregated.challengeAreas[category] = {
                category: categoryName,
                challenges: {}
              }
            }
            
            if (details.challenges) {
              details.challenges.forEach((challenge: string) => {
                aggregated.challengeAreas[category].challenges[challenge] = 
                  (aggregated.challengeAreas[category].challenges[challenge] || 0) + 1
              })
            }
          })
        }
        
        // Aggregate skills
        if (responses.skillGaps) {
          responses.skillGaps.forEach((skill: string) => {
            aggregated.skills[skill] = (aggregated.skills[skill] || 0) + 1
          })
        }
        
        // Aggregate support needs
        if (responses.supportNeeds) {
          responses.supportNeeds.forEach((need: string) => {
            aggregated.supportNeeds[need] = (aggregated.supportNeeds[need] || 0) + 1
          })
        }
        
        // Aggregate team impact/focus areas - map to full text
        if (responses.selectedPriorities) {
          responses.selectedPriorities.forEach((priority: string) => {
            const fullPriority = mapPriorityToFullText(priority)
            aggregated.focusAreas[fullPriority] = (aggregated.focusAreas[fullPriority] || 0) + 1
          })
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      data: aggregated,
      count: assessmentResults.length
    })
    
  } catch (error) {
    console.error('[team-campaign-aggregated] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch aggregated campaign data' },
      { status: 500 }
    )
  }
}