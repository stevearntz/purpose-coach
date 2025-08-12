'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Rocket, Calendar, Users, BarChart3, Clock, MoreVertical } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description?: string
  status: string
  startDate: string
  endDate?: string
  createdAt: string
  participantCount?: number
  completionRate?: number
}

export default function CampaignsTab() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      // Temporarily use public endpoint until auth is fixed
      const response = await fetch('/api/campaigns/public', {
        credentials: 'include' // Include auth cookies
      })
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      } else {
        console.error('Failed to load campaigns:', response.status)
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
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
      case 'ACTIVE':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'COMPLETED':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'DRAFT':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading campaigns...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-3">
          Active Campaigns
        </h2>
        <p className="text-lg text-white/80">
          Manage and monitor your assessment campaigns
        </p>
      </div>

      {campaigns.length === 0 ? (
        /* Empty State */
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
          <Rocket className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Active Campaigns
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            Launch your first assessment campaign to start gathering insights from your team
          </p>
          <button
            onClick={() => router.push('/dashboard?tab=tools')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Launch First Campaign
          </button>
        </div>
      ) : (
        /* Campaign List */
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {campaign.name}
                  </h3>
                  {campaign.description && (
                    <p className="text-sm text-white/60">
                      {campaign.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-white/60" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar className="w-4 h-4" />
                  <span>Started {formatDate(campaign.startDate)}</span>
                </div>
                
                {campaign.endDate && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span>Due {formatDate(campaign.endDate)}</span>
                  </div>
                )}
                
                {campaign.participantCount !== undefined && (
                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-4 h-4" />
                    <span>{campaign.participantCount} participants</span>
                  </div>
                )}
                
                {campaign.completionRate !== undefined && (
                  <div className="flex items-center gap-2 text-white/60">
                    <BarChart3 className="w-4 h-4" />
                    <span>{campaign.completionRate}% complete</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}