import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { mapPriorityToFullText } from '@/utils/priorityMapping'

// Standardized data structure for all assessment results
interface UnifiedAssessmentResult {
  id: string
  invitationId?: string
  toolId: string
  toolName: string
  completedAt: string
  shareId?: string
  
  // User information
  user: {
    email: string
    name: string
    company?: string
    department?: string
    teamSize?: string
    role?: string
  }
  
  // Standardized response structure
  responses: {
    // Challenge Areas with consistent structure
    challenges: Array<{
      name: string
      subcategories: string[]
    }>
    
    // Skills to develop
    skillsToGrow: string[]
    
    // Support needs
    supportNeeds: string[]
    
    // Focus areas (team impact/priorities)
    teamImpact: string[]
    
    // Additional context/insights
    additionalContext?: string
  }
  
  // Scores (if available)
  scores?: {
    categoryCount?: number
    skillGapCount?: number
    challengeCount?: number
    supportNeedCount?: number
    [key: string]: any
  }
  
  // AI-generated content
  summary?: string
  insights?: any[]
  recommendations?: string[]
}

// Redis support removed - using PostgreSQL only

// Transform various data formats into unified structure
function transformToUnifiedFormat(data: any, source: 'postgres' | 'redis'): UnifiedAssessmentResult | null {
  try {
    // Handle PostgreSQL assessment results
    if (source === 'postgres' && data.toolId) {
      const result: UnifiedAssessmentResult = {
        id: data.id,
        invitationId: data.invitationId,
        toolId: data.toolId,
        toolName: data.toolName || 'People Leadership Needs Assessment',
        completedAt: data.completedAt,
        shareId: data.shareId,
        
        user: {
          email: data.invitation?.email || data.user?.email || data.responses?.email || '',
          name: data.invitation?.name || data.user?.name || data.responses?.name || data.userProfile?.name || '',
          company: data.invitation?.company?.name || data.user?.company || '',
          department: data.responses?.department || data.userProfile?.department || data.invitation?.metadata?.department || '',
          teamSize: data.responses?.teamSize || data.userProfile?.teamSize || '',
          role: data.userProfile?.role || data.responses?.role || ''
        },
        
        responses: {
          challenges: [],
          skillsToGrow: [],
          supportNeeds: [],
          teamImpact: [],
          additionalContext: ''
        },
        
        scores: data.scores || {},
        summary: data.summary || '',
        insights: data.insights || [],
        recommendations: data.recommendations || []
      }
      
      // Transform challenges based on available data
      if (data.responses?.categoryDetails) {
        // New format with categoryDetails
        const categoryOrder = ['performance', 'leadership', 'compliance']
        const categoryNames: Record<string, string> = {
          'performance': 'Individual Performance',
          'leadership': 'Leadership Skills',
          'compliance': 'Compliance & Risk'
        }
        
        result.responses.challenges = Object.entries(data.responses.categoryDetails)
          .sort(([a], [b]) => {
            const aIndex = categoryOrder.indexOf(a.toLowerCase())
            const bIndex = categoryOrder.indexOf(b.toLowerCase())
            return aIndex - bIndex
          })
          .map(([key, details]: [string, any]) => ({
            name: categoryNames[key.toLowerCase()] || key,
            subcategories: details.challenges || []
          }))
      } else if (data.responses?.selectedCategories) {
        // Old format - try to parse from selectedCategories
        result.responses.challenges = data.responses.selectedCategories.map((cat: string) => ({
          name: cat,
          subcategories: []
        }))
      } else if (data.insights?.mainChallengeAreas) {
        // Fallback to insights
        result.responses.challenges = data.insights.mainChallengeAreas.map((area: any) => ({
          name: typeof area === 'string' ? area : area.category || 'Unknown',
          subcategories: area.subcategories || []
        }))
      }
      
      // Transform skills
      result.responses.skillsToGrow = 
        data.responses?.skillGaps || 
        data.responses?.skillsToGrow || 
        data.insights?.skillGaps || 
        []
      
      // Support needs (usually consistent)
      result.responses.supportNeeds = 
        data.responses?.supportNeeds || 
        data.insights?.supportNeeds || 
        []
      
      // Team impact / Focus areas - transform to full text
      const rawPriorities = 
        data.responses?.selectedPriorities || 
        data.responses?.teamImpact || 
        data.insights?.priorities || 
        []
      
      result.responses.teamImpact = rawPriorities.map((priority: string) => 
        mapPriorityToFullText(priority)
      )
      
      // Additional context
      result.responses.additionalContext = 
        data.responses?.additionalInsights || 
        data.responses?.additionalContext || 
        ''
      
      return result
    }
    
    // Handle Redis HR assessment data
    if (source === 'redis' && data.email) {
      const result: UnifiedAssessmentResult = {
        id: data.id || `redis-${Date.now()}`,
        toolId: 'hr-partnership',
        toolName: 'People Leadership Needs Assessment',
        completedAt: data.createdAt || new Date().toISOString(),
        
        user: {
          email: data.email,
          name: data.name,
          company: data.domain || '',
          department: data.department || '',
          teamSize: data.teamSize || '',
          role: 'Manager'
        },
        
        responses: {
          challenges: [],
          skillsToGrow: data.skillGaps || [],
          supportNeeds: data.supportNeeds || [],
          teamImpact: [],
          additionalContext: data.additionalInsights || ''
        },
        
        summary: `Manager assessment completed with ${data.selectedCategories?.length || 0} challenge areas`,
        insights: [],
        recommendations: []
      }
      
      // Transform category details into challenges
      if (data.categoryDetails) {
        result.responses.challenges = Object.entries(data.categoryDetails).map(([category, details]: [string, any]) => ({
          name: category,
          subcategories: details.challenges || []
        }))
      } else if (data.selectedCategories) {
        result.responses.challenges = data.selectedCategories.map((cat: string) => ({
          name: cat,
          subcategories: []
        }))
      }
      
      // Transform priorities to full text for Redis data too
      if (data.selectedPriorities) {
        result.responses.teamImpact = data.selectedPriorities.map((priority: string) => 
          mapPriorityToFullText(priority)
        )
      }
      
      return result
    }
    
    return null
  } catch (error) {
    console.error('[unified-api] Transform error:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    const searchParams = request.nextUrl.searchParams
    
    // Query parameters
    const email = searchParams.get('email')
    const companyId = searchParams.get('companyId')
    const campaignId = searchParams.get('campaignId')
    const invitationId = searchParams.get('invitationId')
    const toolId = searchParams.get('toolId')
    const view = searchParams.get('view') || 'individual' // 'individual' | 'aggregated'
    
    const results: UnifiedAssessmentResult[] = []
    
    // Fetch from PostgreSQL
    const whereClause: any = {}
    
    if (invitationId) {
      whereClause.invitationId = invitationId
    }
    
    if (email) {
      whereClause.invitation = {
        email: email.toLowerCase()
      }
    }
    
    // If campaignId is provided, filter by campaign
    if (campaignId) {
      // Results are linked to campaigns through invitations
      whereClause.invitation = {
        ...whereClause.invitation,
        campaignId: campaignId
      }
    } else if (companyId) {
      // Only use companyId filter if campaignId is not provided
      whereClause.invitation = {
        ...whereClause.invitation,
        companyId: companyId
      }
    }
    
    if (toolId) {
      whereClause.toolId = toolId
    }
    
    // Fetch PostgreSQL results
    const pgResults = await prisma.assessmentResult.findMany({
      where: whereClause,
      include: {
        invitation: {
          include: {
            company: true,
            metadata: true
          }
        }
      },
      orderBy: {
        completedAt: 'desc'
      }
    })
    
    // Filter out TEAM_SHARE results when viewing company-wide data (admin view)
    // Only show results from HR_CAMPAIGN or no campaign
    let filteredResults = pgResults
    if (companyId && !email && !invitationId) {
      // This is likely an admin view requesting all company results
      // Filter out results from TEAM_SHARE campaigns
      const teamShareCampaigns = await prisma.campaign.findMany({
        where: {
          companyId,
          campaignType: 'TEAM_SHARE'
        },
        select: {
          campaignCode: true
        }
      })
      
      const teamShareCodes = teamShareCampaigns.map(c => c.campaignCode).filter(Boolean)
      
      // Remove results that belong to TEAM_SHARE campaigns
      filteredResults = pgResults.filter(result => {
        const inviteCode = result.invitation?.inviteCode
        return !inviteCode || !teamShareCodes.includes(inviteCode)
      })
    }
    
    // Transform PostgreSQL results
    for (const pgResult of pgResults) {
      const unified = transformToUnifiedFormat(pgResult, 'postgres')
      if (unified) {
        results.push(unified)
      }
    }
    
    // Redis support has been removed - all data is now in PostgreSQL
    
    // Handle aggregated view for campaigns
    if (view === 'aggregated' && campaignId) {
      // Aggregate results by campaign
      const aggregated = {
        campaignId,
        totalResponses: results.length,
        challenges: {} as Record<string, number>,
        skills: {} as Record<string, number>,
        supportNeeds: {} as Record<string, number>,
        focusAreas: {} as Record<string, number>,
        
        // Aggregated counts
        byCategory: {} as Record<string, { total: number, challenges: Record<string, number> }>
      }
      
      for (const result of results) {
        // Aggregate challenges
        for (const challenge of result.responses.challenges) {
          if (!aggregated.byCategory[challenge.name]) {
            aggregated.byCategory[challenge.name] = { total: 0, challenges: {} }
          }
          aggregated.byCategory[challenge.name].total++
          
          for (const sub of challenge.subcategories) {
            aggregated.byCategory[challenge.name].challenges[sub] = 
              (aggregated.byCategory[challenge.name].challenges[sub] || 0) + 1
          }
        }
        
        // Aggregate skills
        for (const skill of result.responses.skillsToGrow) {
          aggregated.skills[skill] = (aggregated.skills[skill] || 0) + 1
        }
        
        // Aggregate support needs
        for (const need of result.responses.supportNeeds) {
          aggregated.supportNeeds[need] = (aggregated.supportNeeds[need] || 0) + 1
        }
        
        // Aggregate focus areas
        for (const area of result.responses.teamImpact) {
          aggregated.focusAreas[area] = (aggregated.focusAreas[area] || 0) + 1
        }
      }
      
      return NextResponse.json({
        success: true,
        view: 'aggregated',
        data: aggregated,
        count: results.length
      })
    }
    
    // Return individual results
    return NextResponse.json({
      success: true,
      view: 'individual',
      results: results,
      count: results.length
    })
    
  } catch (error) {
    console.error('[unified-api] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch unified assessment results' },
      { status: 500 }
    )
  }
}