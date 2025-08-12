'use client'

import React, { useState, useEffect } from 'react'
import { 
  BarChart3, Users, Calendar, TrendingUp, Download, 
  ChevronRight, FileText, Clock, CheckCircle, AlertCircle,
  Target, Brain, Shield, MessageSquare
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
    topChallenges: { challenge: string; count: number }[]
    topCapabilities: { capability: string; count: number }[]
    averageScores?: Record<string, number>
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
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignResult | null>(null)

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

  const exportResults = (campaign: CampaignResult) => {
    // TODO: Implement CSV export
    console.log('Exporting results for:', campaign.campaignName)
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
            {campaignResults.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all cursor-pointer"
                onClick={() => setSelectedCampaign(campaign)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
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
                        onClick={(e) => {
                          e.stopPropagation()
                          exportResults(campaign)
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Export Results"
                      >
                        <Download className="w-4 h-4 text-white/60" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-white/40" />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {campaign.completionRate}%
                      </div>
                      <div className="text-xs text-white/60">Completion Rate</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {campaign.completedCount}/{campaign.totalParticipants}
                      </div>
                      <div className="text-xs text-white/60">Completed</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/80">
                        {formatDate(campaign.startDate)}
                      </div>
                      <div className="text-xs text-white/60">Started</div>
                    </div>
                    {campaign.endDate && (
                      <div>
                        <div className="text-sm text-white/80">
                          {formatDate(campaign.endDate)}
                        </div>
                        <div className="text-xs text-white/60">Deadline</div>
                      </div>
                    )}
                  </div>

                  {/* Top Insights Preview */}
                  {campaign.aggregatedData && (
                    <div className="pt-4 border-t border-white/10">
                      <div className="text-sm text-white/60 mb-2">Top Challenges Identified:</div>
                      <div className="flex flex-wrap gap-2">
                        {campaign.aggregatedData.topChallenges.slice(0, 3).map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs"
                          >
                            {item.challenge} ({item.count})
                          </span>
                        ))}
                        {campaign.aggregatedData.topChallenges.length > 3 && (
                          <span className="px-3 py-1 bg-white/10 text-white/60 rounded-full text-xs">
                            +{campaign.aggregatedData.topChallenges.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Individual Results View - Using enhanced expandable card component with DB data */
        <IndividualResultsViewEnhanced 
          results={individualResults.map(result => ({
            ...result,
            status: result.status.toLowerCase() as 'completed' | 'started' | 'invited' | 'pending'
          }))} 
          loading={loading} 
        />
      )}

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedCampaign(null)}
          />
          
          <div className="relative bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCampaign.campaignName}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedCampaign.assessmentType} • {selectedCampaign.completedCount} responses
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                Detailed campaign analytics coming soon...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}