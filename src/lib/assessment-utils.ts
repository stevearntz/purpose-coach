// Utility functions for saving and retrieving assessment data

interface SaveAssessmentParams {
  inviteCode?: string
  invitationId?: string
  toolId: string
  toolName: string
  responses: any
  scores?: any
  summary?: string
  insights?: any
  recommendations?: any
  userProfile?: {
    name?: string
    email?: string
    role?: string
    challenges?: string[]
    company?: string
  }
}

export async function saveAssessmentResult(params: SaveAssessmentParams) {
  try {
    const response = await fetch('/api/assessments/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to save assessment')
    }
    
    return data
  } catch (error) {
    console.error('Error saving assessment:', error)
    throw error
  }
}

export async function getAssessmentResults(params: {
  invitationId?: string
  email?: string
  companyId?: string
  toolId?: string
}) {
  const queryParams = new URLSearchParams()
  
  if (params.invitationId) queryParams.append('invitationId', params.invitationId)
  if (params.email) queryParams.append('email', params.email)
  if (params.companyId) queryParams.append('companyId', params.companyId)
  if (params.toolId) queryParams.append('toolId', params.toolId)
  
  try {
    const response = await fetch(`/api/assessments/results?${queryParams}`)
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch assessment results')
    }
    
    return data.results
  } catch (error) {
    console.error('Error fetching assessment results:', error)
    return []
  }
}

export async function getAssessmentByShareId(shareId: string) {
  try {
    const response = await fetch('/api/assessments/results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ shareId })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch assessment')
    }
    
    return data.result
  } catch (error) {
    console.error('Error fetching assessment by share ID:', error)
    return null
  }
}

// Helper to transform tool results into saveable format
export function prepareAssessmentData(
  toolId: string,
  toolName: string,
  rawData: any
): SaveAssessmentParams {
  const base: SaveAssessmentParams = {
    toolId,
    toolName,
    responses: rawData,
  }
  
  // Tool-specific transformations
  switch (toolId) {
    case 'purpose-coach':
      return {
        ...base,
        userProfile: {
          name: rawData.userName,
          role: rawData.userRole,
          challenges: rawData.challenges,
        },
        summary: rawData.purposeStatement,
        insights: rawData.coreValues,
        recommendations: rawData.actionItems,
      }
      
    case 'team-charter':
      return {
        ...base,
        userProfile: {
          name: rawData.teamName,
        },
        summary: `${rawData.purpose?.exists}. ${rawData.purpose?.outcome}`,
        insights: {
          values: rawData.values,
          people: rawData.people,
          impact: rawData.impact,
        },
        recommendations: rawData.nextSteps,
      }
      
    case 'burnout-assessment':
      return {
        ...base,
        scores: rawData.scores,
        summary: rawData.overallRisk,
        insights: rawData.riskFactors,
        recommendations: rawData.recommendations,
      }
      
    case 'hr-partnership':
      return {
        ...base,
        userProfile: {
          name: rawData.name,
          role: rawData.role,
          company: rawData.company,
        },
        scores: {
          partnershipScore: rawData.partnershipScore,
          maturityLevel: rawData.maturityLevel,
        },
        insights: rawData.strengths,
        recommendations: rawData.improvements,
      }
      
    case 'trust-audit':
      return {
        ...base,
        scores: rawData.trustScores,
        insights: rawData.trustGaps,
        recommendations: rawData.actionPlan,
      }
      
    default:
      return base
  }
}