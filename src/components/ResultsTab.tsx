'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, Users, Calendar, TrendingUp, Download, 
  ChevronRight, ChevronDown, ChevronUp, FileText, Clock, CheckCircle, AlertCircle,
  Target, Brain, Shield, MessageSquare, Loader2, Rocket
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import IndividualResultsViewEnhanced from './IndividualResultsViewEnhanced'

interface CampaignResult {
  id: string
  campaignName: string
  assessmentType: string
  startDate: string
  endDate?: string
  totalParticipants: number
  completedCount: number
  completionRate: number
  aggregatedData?: {
    challengeAreas?: Record<string, { category: string; challenges: Record<string, number> }>
    skills?: Record<string, number>
    supportNeeds?: Record<string, number>
    focusAreas?: Record<string, number>
  }
}

interface IndividualResult {
  id: string
  participantName: string
  participantEmail: string
  assessmentType: string
  campaignName?: string
  completedAt: string
  status: string
  score?: number
}

export default function ResultsTab() {
  const router = useRouter()
  const { user } = useUser()
  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'individuals'>('campaigns')
  const [campaignResults, setCampaignResults] = useState<CampaignResult[]>([])
  const [individualResults, setIndividualResults] = useState<IndividualResult[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null)
  const [aggregatedData, setAggregatedData] = useState<Record<string, any>>({})
  const [loadingAggregatedData, setLoadingAggregatedData] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (activeSubTab === 'campaigns') {
      loadCampaignResults()
    } else {
      loadIndividualResults()
    }
  }, [activeSubTab, user])

  const loadCampaignResults = async () => {
    setLoading(true)
    try {
      // Use authenticated endpoint ONLY
      const response = await fetch('/api/results/campaigns', {
        credentials: 'include' // Include auth cookies
      })
      if (response.ok) {
        const data = await response.json()
        setCampaignResults(data.results || [])
      } else if (response.status === 401) {
        console.error('Authentication required - user must be logged in')
        setCampaignResults([])
      }
    } catch (error) {
      console.error('Failed to load campaign results:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadIndividualResults = async () => {
    setLoading(true)
    try {
      // Get company ID from organization
      const orgResponse = await fetch('/api/user/company')
      if (!orgResponse.ok) {
        console.error('[ResultsTab] Failed to fetch company info:', orgResponse.status)
        setIndividualResults([])
        setLoading(false)
        return
      }
      const orgData = await orgResponse.json()
      console.log('[ResultsTab] Company data:', orgData)
      console.log('[ResultsTab] orgData.data:', orgData.data)
      console.log('[ResultsTab] orgData.data?.company:', orgData.data?.company)
      
      // Extract company from standardized API response
      let company = null
      if (orgData.success && orgData.data) {
        // Check if data contains company directly or nested
        if (orgData.data.company) {
          company = orgData.data.company
          console.log('[ResultsTab] Found company in data.company:', company)
        } else if (orgData.data.id && orgData.data.name) {
          // data itself might be the company
          company = orgData.data
          console.log('[ResultsTab] Data is the company:', company)
        }
      } else if (orgData.company) {
        company = orgData.company
        console.log('[ResultsTab] Found company directly:', company)
      }
      
      // Check if company exists
      if (!company || !company.id) {
        console.error('[ResultsTab] No company found for user - extracted company:', company)
        console.error('[ResultsTab] Full orgData structure:', JSON.stringify(orgData, null, 2))
        setIndividualResults([])
        setLoading(false)
        return
      }
      
      console.log('[ResultsTab] Fetching assessments for company:', company.id)
      
      // Use unified API with company ID
      const response = await fetch(`/api/assessments/unified?companyId=${company.id}`, {
        credentials: 'include'
      })
      console.log('[ResultsTab] Unified API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('[ResultsTab] Unified API data:', data)
        // Transform unified results to match expected format for IndividualResultsViewEnhanced
        const transformedResults = data.results?.map((result: any) => ({
          id: result.id,
          participantName: result.user.name,
          participantEmail: result.user.email,
          assessmentType: result.toolName,
          campaignName: null, // Will be populated from campaigns
          completedAt: result.completedAt,
          status: 'COMPLETED',
          inviteCode: result.invitationId,
          department: result.user.department,
          teamSize: result.user.teamSize,
          hasResults: true,
          assessmentId: result.id,
          // Include the assessment data for the enhanced component
          assessmentData: {
            id: result.id,
            invitationId: result.invitationId,
            toolId: result.toolId,
            toolName: result.toolName,
            completedAt: result.completedAt,
            shareId: result.shareId,
            user: result.user,
            responses: result.responses,
            scores: result.scores,
            summary: result.summary,
            insights: result.insights,
            recommendations: result.recommendations,
            userProfile: result.userProfile
          }
        })) || []
        
        setIndividualResults(transformedResults)
      } else if (response.status === 401) {
        console.error('Authentication required - user must be logged in')
        setIndividualResults([])
      }
    } catch (error) {
      console.error('Failed to load individual results:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'STARTED':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'INVITED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const toggleCampaignExpand = (campaignId: string) => {
    if (expandedCampaignId === campaignId) {
      setExpandedCampaignId(null)
    } else {
      setExpandedCampaignId(campaignId)
      if (!aggregatedData[campaignId]) {
        loadAggregatedData(campaignId)
      }
    }
  }

  const loadAggregatedData = async (campaignId: string) => {
    setLoadingAggregatedData(prev => new Set(prev).add(campaignId))
    try {
      // Use the unified API with aggregated view
      const response = await fetch(`/api/assessments/unified?campaignId=${campaignId}&view=aggregated`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const aggregated: any = {
          challengeAreas: {},
          skills: {},
          supportNeeds: {},
          focusAreas: {}
        }
        
        // Process challenges by category from unified API
        if (data.data.byCategory) {
          Object.entries(data.data.byCategory).forEach(([category, categoryData]: [string, any]) => {
            aggregated.challengeAreas[category] = {
              category,
              challenges: categoryData.challenges || {}
            }
          })
        }
        
        // Process skills from unified API
        if (data.data.skills) {
          aggregated.skills = data.data.skills
        }
        
        // Process support needs from unified API
        if (data.data.supportNeeds) {
          aggregated.supportNeeds = data.data.supportNeeds
        }
        
        // Process focus areas from unified API
        if (data.data.focusAreas) {
          aggregated.focusAreas = data.data.focusAreas
        }
        
        setAggregatedData(prev => ({ ...prev, [campaignId]: aggregated }))
      }
    } catch (error) {
      console.error('Failed to load aggregated data:', error)
    } finally {
      setLoadingAggregatedData(prev => {
        const newSet = new Set(prev)
        newSet.delete(campaignId)
        return newSet
      })
    }
  }

  const exportResults = async (campaign: CampaignResult) => {
    // Load data if not already loaded
    if (!aggregatedData[campaign.id]) {
      await loadAggregatedData(campaign.id)
    }
    
    const campaignData = aggregatedData[campaign.id]
    
    // Create CSV from aggregated data
    const rows: string[][] = []
    rows.push(['Category', 'Item', 'Count'])
    
    // Add challenge areas
    if (campaignData?.challengeAreas) {
      Object.values(campaignData.challengeAreas).forEach((area: any) => {
        Object.entries(area.challenges || {}).forEach(([challenge, count]) => {
          if (Number(count) > 0) {
            rows.push([area.category, challenge, String(count)])
          }
        })
      })
    }
    
    // Add skills
    if (campaignData?.skills) {
      Object.entries(campaignData.skills).forEach(([skill, count]) => {
        if (Number(count) > 0) {
          rows.push(['Skills to Develop', skill, String(count)])
        }
      })
    }
    
    // Add support needs
    if (campaignData?.supportNeeds) {
      Object.entries(campaignData.supportNeeds).forEach(([need, count]) => {
        if (Number(count) > 0) {
          rows.push(['Support Needs', need, String(count)])
        }
      })
    }
    
    // Add focus areas
    if (campaignData?.focusAreas) {
      Object.entries(campaignData.focusAreas).forEach(([area, count]) => {
        if (Number(count) > 0) {
          rows.push(['Focus Areas', area, String(count)])
        }
      })
    }
    
    // Create CSV
    const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${campaign.campaignName.replace(/\s+/g, '_')}_aggregated_results.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-3">
          Assessment Results
        </h2>
        <p className="text-lg text-white/80">
          View and analyze assessment data from your campaigns
        </p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 p-1 rounded-lg inline-flex">
        <button
          onClick={() => setActiveSubTab('campaigns')}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            activeSubTab === 'campaigns'
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Campaigns
          </div>
        </button>
        <button
          onClick={() => setActiveSubTab('individuals')}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            activeSubTab === 'individuals'
              ? 'bg-white/20 text-white'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Individuals
          </div>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-white/60">Loading results...</div>
        </div>
      ) : activeSubTab === 'campaigns' ? (
        /* Campaign Results View */
        campaignResults.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
            <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Campaign Results Yet
            </h3>
            <p className="text-white/60 max-w-md mx-auto mb-6">
              Complete assessment campaigns to see aggregated results and insights here
            </p>
            <button
              onClick={() => router.push('/dashboard/launch')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
            >
              <Rocket className="w-5 h-5" />
              Go to Assessments
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaignResults.map((campaign) => {
              const isExpanded = expandedCampaignId === campaign.id
              const isLoadingData = loadingAggregatedData.has(campaign.id)
              const campaignData = aggregatedData[campaign.id]
              
              return (
                <div key={campaign.id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
                  {/* Card Header - Always Visible */}
                  <div 
                    className="p-6 cursor-pointer hover:bg-white/10 transition-all"
                    onClick={() => toggleCampaignExpand(campaign.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {campaign.campaignName}
                        </h3>
                        <p className="text-sm text-white/60">
                          {campaign.assessmentType}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation()
                            await exportResults(campaign)
                          }}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Export Results"
                        >
                          <Download className="w-4 h-4 text-white/60" />
                        </button>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/40" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/40" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-white/10">
                      <div className="mt-4">
                        {isLoadingData ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="animate-spin h-8 w-8 text-purple-400 mr-3" />
                            <span className="text-white/60">Loading aggregated data...</span>
                          </div>
                        ) : campaignData ? (
                          <div className="space-y-6 bg-white/5 rounded-lg p-6">
                            {/* Challenge Areas */}
                            {campaignData.challengeAreas && Object.keys(campaignData.challengeAreas).length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Challenge Areas</h3>
                                <div className="space-y-3">
                                  {Object.entries(campaignData.challengeAreas).map(([key, area]: [string, any]) => (
                                    <div key={key} className="border-l-4 border-red-400 pl-4">
                                      <h4 className="font-medium text-white/90 mb-2">{area.category}</h4>
                                      <div className="flex flex-wrap gap-2">
                                        {Object.entries(area.challenges || {}).filter(([_, count]) => Number(count) > 0).map(([challenge, count]) => (
                                          <span key={challenge} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm flex items-center gap-1">
                                            {challenge}
                                            <span className="font-semibold">({String(count)})</span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Skills to Develop */}
                            {campaignData.skills && Object.keys(campaignData.skills).length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Skills to Develop</h3>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(campaignData.skills).filter(([_, count]) => Number(count) > 0).map(([skill, count]) => (
                                    <span key={skill} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-1">
                                      {skill}
                                      <span className="font-semibold">({String(count)})</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Support Needs */}
                            {campaignData.supportNeeds && Object.keys(campaignData.supportNeeds).length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Support Needs</h3>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(campaignData.supportNeeds).filter(([_, count]) => Number(count) > 0).map(([need, count]) => (
                                    <span key={need} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm flex items-center gap-1">
                                      {need}
                                      <span className="font-semibold">({String(count)})</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Focus Areas */}
                            {campaignData.focusAreas && Object.keys(campaignData.focusAreas).length > 0 && (
                              <div>
                                <h3 className="text-lg font-semibold text-white mb-3">Focus Areas</h3>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(campaignData.focusAreas).filter(([_, count]) => Number(count) > 0).map(([area, count]) => (
                                    <span key={area} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-1">
                                      {area}
                                      <span className="font-semibold">({String(count)})</span>
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-white/40">
                            No data available
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Individual Results View - Using enhanced expandable card component with DB data */
        <IndividualResultsViewEnhanced 
          results={individualResults} 
          loading={loading} 
        />
      )}
    </div>
  )
}