'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, Users, Calendar, TrendingUp, Download, 
  ChevronRight, ChevronDown, ChevronUp, FileText, Clock, CheckCircle, AlertCircle,
  Target, Brain, Shield, MessageSquare, Loader2
} from 'lucide-react'
import { useSession } from 'next-auth/react'
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
  const { data: session } = useSession()
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
  }, [activeSubTab, session])

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
      // Use authenticated endpoint ONLY
      const response = await fetch('/api/results/individuals', {
        credentials: 'include' // Include auth cookies
      })
      if (response.ok) {
        const data = await response.json()
        // Note: IndividualResultsViewEnhanced component handles deduplication on the client side
        // It filters to show only the most recent submission per user/campaign/assessment
        setIndividualResults(data.results || [])
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
      // IMPORTANT: The API should deduplicate results before aggregation
      // Only count the most recent submission per user for each assessment
      // This ensures users who retake assessments are counted once with their latest responses
      
      // In a real app, this would fetch from API
      // For now, create mock aggregated data
      const mockAggregated = {
        challengeAreas: {
          individual: {
            category: 'Individual Performance',
            challenges: {
              'High performer growth': 2,
              'Stretch assignments': 1
            }
          },
          leadership: {
            category: 'Leadership Skills',
            challenges: {
              'Delegation': 1,
              'Project planning': 2,
              'Leading through ambiguity': 1
            }
          },
          compliance: {
            category: 'Compliance & Risk',
            challenges: {
              'HR policies': 2,
              'Feedback and terminations': 1,
              'Regulatory compliance': 1
            }
          }
        },
        skills: {
          'Coaching': 2,
          'Communication': 1,
          'Decision making': 2
        },
        supportNeeds: {
          'Day-to-day people issues': 2,
          'Difficult terminations': 1,
          'Reorganization support': 1,
          'Mental health resources': 2
        },
        focusAreas: {
          'Revenue, sales, or growth targets': 2,
          'Team performance or growth': 1,
          'Strategy or planning': 2,
          'Risk management or compliance': 1
        }
      }
      setAggregatedData(prev => ({ ...prev, [campaignId]: mockAggregated }))
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
            <p className="text-white/60 max-w-md mx-auto">
              Complete assessment campaigns to see aggregated results and insights here
            </p>
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