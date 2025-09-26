'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Link2, Users, Download, Loader2 } from 'lucide-react'

interface CampaignResultCardProps {
  campaign: {
    id: string
    name: string
    toolName: string
    toolPath: string
    campaignLink: string
    campaignCode?: string
    createdAt: string
    responseCount: number
    responses?: Array<{
      id: string
      userName?: string
      userEmail?: string
      completedAt: string
    }>
  }
}

export default function CampaignResultCard({ campaign }: CampaignResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [aggregatedData, setAggregatedData] = useState<any>(null)
  const [loadingData, setLoadingData] = useState(false)

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(campaign.campaignLink)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Load aggregated data when expanded
  useEffect(() => {
    if (isExpanded && !aggregatedData && campaign.responseCount > 0) {
      loadAggregatedData()
    }
  }, [isExpanded])

  const loadAggregatedData = async () => {
    console.log('[CampaignResultCard] Loading aggregated data for campaign:', campaign.campaignCode)
    setLoadingData(true)
    try {
      // Get aggregated data for this campaign
      const url = `/api/team/campaign-aggregated?campaignCode=${campaign.campaignCode || campaign.id}`
      console.log('[CampaignResultCard] Fetching from:', url)
      
      const response = await fetch(url, {
        credentials: 'include'  // Include auth cookies
      })
      const data = await response.json()
      
      console.log('[CampaignResultCard] API Response:', data)
      
      if (data.success) {
        console.log('[CampaignResultCard] Setting aggregated data:', data.data)
        setAggregatedData(data.data)
      } else {
        console.error('[CampaignResultCard] API Error:', data.error)
      }
    } catch (error) {
      console.error('[CampaignResultCard] Fetch error:', error)
    } finally {
      setLoadingData(false)
    }
  }

  const exportResults = async () => {
    if (!aggregatedData) {
      await loadAggregatedData()
    }
    
    // Create CSV from aggregated data
    const rows: string[][] = []
    rows.push(['Category', 'Item', 'Count'])
    
    // Add challenge areas
    if (aggregatedData?.challengeAreas) {
      Object.values(aggregatedData.challengeAreas).forEach((area: any) => {
        Object.entries(area.challenges || {}).forEach(([challenge, count]) => {
          if (Number(count) > 0) {
            rows.push([area.category, challenge, String(count)])
          }
        })
      })
    }
    
    // Add skills
    if (aggregatedData?.skills) {
      Object.entries(aggregatedData.skills).forEach(([skill, count]) => {
        if (Number(count) > 0) {
          rows.push(['Skills to Develop', skill, String(count)])
        }
      })
    }
    
    // Add support needs
    if (aggregatedData?.supportNeeds) {
      Object.entries(aggregatedData.supportNeeds).forEach(([need, count]) => {
        if (Number(count) > 0) {
          rows.push(['Support Needs', need, String(count)])
        }
      })
    }
    
    // Add focus areas
    if (aggregatedData?.focusAreas) {
      Object.entries(aggregatedData.focusAreas).forEach(([area, count]) => {
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
    a.download = `${campaign.name.replace(/\s+/g, '_')}_aggregated_results.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
      <div 
        className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              {campaign.name}
            </h3>
            <p className="text-sm text-white/60">
              {campaign.toolName || 'People Leadership Needs Assessment'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-white/80 mr-4">
              <Users className="w-5 h-5" />
              <span className="font-medium">{campaign.responseCount}</span>
              <span className="text-sm text-white/60">response{campaign.responseCount !== 1 ? 's' : ''}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleCopyLink()
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors relative group"
              title="Copy share link"
            >
              <Link2 className="w-4 h-4 text-white/60" />
              {copiedLink && (
                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  Copied!
                </span>
              )}
            </button>
            <button
              onClick={async (e) => {
                e.stopPropagation()
                await exportResults()
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Export Results"
            >
              <Download className="w-4 h-4 text-white/60" />
            </button>
            <button className="p-2">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-white/40" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/40" />
              )}
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-6 border-t border-white/10">
          <div className="mt-4">
            {loadingData ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin h-8 w-8 text-purple-400 mr-3" />
                <span className="text-white/60">Loading aggregated data...</span>
              </div>
            ) : aggregatedData ? (
              <div className="space-y-6 bg-white/5 rounded-lg p-6">
                {/* Challenge Areas */}
                {aggregatedData.challengeAreas && Object.keys(aggregatedData.challengeAreas).length > 0 && (
                  <div className="border-l-4 border-red-400 pl-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Challenge Areas</h3>
                    <div className="space-y-3">
                      {Object.entries(aggregatedData.challengeAreas).map(([key, area]: [string, any]) => (
                        <div key={key}>
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
                {aggregatedData.skills && Object.keys(aggregatedData.skills).length > 0 && (
                  <div className="border-l-4 border-blue-400 pl-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Skills to Develop</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(aggregatedData.skills).filter(([_, count]) => Number(count) > 0).map(([skill, count]) => (
                        <span key={skill} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-1">
                          {skill}
                          <span className="font-semibold">({String(count)})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Support Needs */}
                {aggregatedData.supportNeeds && Object.keys(aggregatedData.supportNeeds).length > 0 && (
                  <div className="border-l-4 border-yellow-400 pl-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Support Needs</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(aggregatedData.supportNeeds).filter(([_, count]) => Number(count) > 0).map(([need, count]) => (
                        <span key={need} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm flex items-center gap-1">
                          {need}
                          <span className="font-semibold">({String(count)})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Focus Areas */}
                {aggregatedData.focusAreas && Object.keys(aggregatedData.focusAreas).length > 0 && (
                  <div className="border-l-4 border-purple-400 pl-4">
                    <h3 className="text-lg font-semibold text-white mb-3">Focus Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(aggregatedData.focusAreas).filter(([_, count]) => Number(count) > 0).map(([area, count]) => (
                        <span key={area} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center gap-1">
                          {area}
                          <span className="font-semibold">({String(count)})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Individual Responses Section */}
                {campaign.responses && campaign.responses.length > 0 && (
                  <div className="border-t border-white/10 pt-4">
                    <h4 className="text-sm font-semibold text-white/80 mb-3">Assessment Responses</h4>
                    <div className="space-y-2">
                      {campaign.responses.map((response) => (
                        <div key={response.id} className="bg-white/10 rounded-lg p-3">
                          <p className="font-medium text-white text-sm">
                            {response.userName || response.userEmail || 'Anonymous'}
                          </p>
                          <p className="text-xs text-white/60">
                            Completed {formatDate(response.completedAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : campaign.responseCount > 0 ? (
              <div className="text-center py-8 text-white/40">
                No aggregated data available
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">No responses yet</p>
                <p className="text-sm text-white/40 mt-1">
                  Share the link to start collecting responses
                </p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}