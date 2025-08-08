'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Users, BarChart3, Clock, ArrowRight, Plus,
  CheckCircle, AlertCircle, TrendingUp, Filter, Search,
  ChevronDown, RefreshCw, ExternalLink, Copy
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface Campaign {
  id: string
  name: string
  toolName: string
  toolPath: string
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived'
  createdAt: string
  startDate: string
  deadline: string
  uniqueCode: string
  uniqueLink: string
  participants: Array<{
    status: 'invited' | 'started' | 'completed' | 'expired'
  }>
  metrics: {
    totalInvited: number
    totalStarted: number
    totalCompleted: number
    completionRate: number
    averageScore?: number
  }
}

export default function CampaignsTab() {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'completion' | 'name'>('date')

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      const companyId = localStorage.getItem('campfire_user_company') || 'default'
      const response = await fetch(`/api/campaigns?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        
        // Add simulated campaigns for demo
        const simulatedCampaigns: Campaign[] = [
          {
            id: 'camp1',
            name: 'Q1 2024 Trust Audit - Engineering',
            toolName: 'Trust Audit',
            toolPath: '/trust-audit',
            status: 'active',
            createdAt: '2024-01-01T10:00:00',
            startDate: '2024-01-01T10:00:00',
            deadline: '2024-01-15T23:59:59',
            uniqueCode: 'TRUST001',
            uniqueLink: 'https://tools.getcampfire.com/campaign/TRUST001',
            participants: [
              { status: 'completed' }, { status: 'completed' }, { status: 'completed' },
              { status: 'completed' }, { status: 'completed' }, { status: 'completed' },
              { status: 'started' }, { status: 'started' },
              { status: 'invited' }, { status: 'invited' }
            ],
            metrics: {
              totalInvited: 10,
              totalStarted: 2,
              totalCompleted: 6,
              completionRate: 60,
              averageScore: 78
            }
          },
          {
            id: 'camp2',
            name: 'Q1 2024 Burnout Assessment - All Teams',
            toolName: 'Burnout Assessment',
            toolPath: '/burnout-assessment',
            status: 'active',
            createdAt: '2024-01-05T10:00:00',
            startDate: '2024-01-05T10:00:00',
            deadline: '2024-01-20T23:59:59',
            uniqueCode: 'BURN001',
            uniqueLink: 'https://tools.getcampfire.com/campaign/BURN001',
            participants: Array(25).fill(null).map((_, i) => ({
              status: i < 15 ? 'completed' : i < 20 ? 'started' : 'invited' as any
            })),
            metrics: {
              totalInvited: 25,
              totalStarted: 5,
              totalCompleted: 15,
              completionRate: 60,
              averageScore: 72
            }
          },
          {
            id: 'camp3',
            name: 'Team Charter Workshop - Product Team',
            toolName: 'Team Charter',
            toolPath: '/team-charter',
            status: 'completed',
            createdAt: '2023-12-01T10:00:00',
            startDate: '2023-12-01T10:00:00',
            deadline: '2023-12-15T23:59:59',
            uniqueCode: 'TEAM001',
            uniqueLink: 'https://tools.getcampfire.com/campaign/TEAM001',
            participants: Array(8).fill(null).map(() => ({ status: 'completed' as any })),
            metrics: {
              totalInvited: 8,
              totalStarted: 0,
              totalCompleted: 8,
              completionRate: 100,
              averageScore: 85
            }
          },
          {
            id: 'camp4',
            name: 'Change Readiness - Q4 Reorg',
            toolName: 'Change Readiness Assessment',
            toolPath: '/change-readiness-assessment',
            status: 'active',
            createdAt: '2024-01-08T10:00:00',
            startDate: '2024-01-08T10:00:00',
            deadline: '2024-01-22T23:59:59',
            uniqueCode: 'CHANGE001',
            uniqueLink: 'https://tools.getcampfire.com/campaign/CHANGE001',
            participants: Array(50).fill(null).map((_, i) => ({
              status: i < 10 ? 'completed' : i < 15 ? 'started' : 'invited' as any
            })),
            metrics: {
              totalInvited: 50,
              totalStarted: 5,
              totalCompleted: 10,
              completionRate: 20,
              averageScore: 68
            }
          },
          {
            id: 'camp5',
            name: 'HR Partnership Assessment - Managers',
            toolName: 'HR Partnership Assessment',
            toolPath: '/hr-partnership',
            status: 'draft',
            createdAt: '2024-01-09T10:00:00',
            startDate: '2024-01-15T10:00:00',
            deadline: '2024-01-30T23:59:59',
            uniqueCode: 'HR001',
            uniqueLink: 'https://tools.getcampfire.com/campaign/HR001',
            participants: [],
            metrics: {
              totalInvited: 0,
              totalStarted: 0,
              totalCompleted: 0,
              completionRate: 0
            }
          }
        ]
        
        setCampaigns([...simulatedCampaigns, ...(data.campaigns || [])])
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
      showError('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      showSuccess('Campaign link copied!')
    } catch (error) {
      showError('Failed to copy link')
    }
  }

  // Filter and sort campaigns
  let filteredCampaigns = [...campaigns]
  
  if (filterStatus !== 'all') {
    filteredCampaigns = filteredCampaigns.filter(c => c.status === filterStatus)
  }
  
  if (searchQuery) {
    filteredCampaigns = filteredCampaigns.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.toolName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  // Sort campaigns
  filteredCampaigns.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'completion':
        return b.metrics.completionRate - a.metrics.completionRate
      case 'date':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'draft': return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'archived': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getDaysRemaining = (deadline: string) => {
    const now = new Date()
    const end = new Date(deadline)
    const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  return (
    <div>
      {/* Header with Actions */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Assessment Campaigns</h2>
            <p className="text-white/70">
              Manage and track your assessment campaigns across teams
            </p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard?tab=tools')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {/* Filters and Search */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
          >
            <option value="date">Most Recent</option>
            <option value="completion">Completion Rate</option>
            <option value="name">Name</option>
          </select>

          <button
            onClick={loadCampaigns}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Campaigns Grid */}
      {loading ? (
        <div className="text-center py-12 text-white/60">
          Loading campaigns...
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <BarChart3 className="w-12 h-12 text-white/40 mx-auto mb-3" />
          <p className="text-white/60">No campaigns found</p>
          <button
            onClick={() => router.push('/dashboard?tab=tools')}
            className="mt-4 text-purple-400 hover:text-purple-300"
          >
            Create your first campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredCampaigns.map((campaign) => {
            const daysRemaining = getDaysRemaining(campaign.deadline)
            const isExpired = campaign.status === 'active' && daysRemaining < 0
            
            return (
              <div
                key={campaign.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200"
              >
                <div className="p-6">
                  {/* Campaign Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {campaign.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-white/60">
                        <span>{campaign.toolName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(campaign.startDate).toLocaleDateString()}
                        </span>
                        {campaign.status === 'active' && (
                          <>
                            <span>•</span>
                            <span className={isExpired ? 'text-red-400' : daysRemaining <= 3 ? 'text-yellow-400' : 'text-white/60'}>
                              {isExpired ? 'Expired' : `${daysRemaining} days left`}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-white/60">Completion</span>
                      <span className="text-sm font-medium text-white">
                        {campaign.metrics.completionRate}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${campaign.metrics.completionRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {campaign.metrics.totalInvited}
                      </div>
                      <div className="text-xs text-white/60">Invited</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {campaign.metrics.totalCompleted}
                      </div>
                      <div className="text-xs text-white/60">Completed</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {campaign.metrics.averageScore ? `${campaign.metrics.averageScore}%` : 'N/A'}
                      </div>
                      <div className="text-xs text-white/60">Avg Score</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      View Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => copyLink(campaign.uniqueLink)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                      title="Copy campaign link"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <a
                      href={campaign.uniqueLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                      title="Open campaign"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Summary Stats */}
      {!loading && campaigns.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-white">
                {campaigns.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-white/60">Active Campaigns</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {campaigns.reduce((sum, c) => sum + c.metrics.totalInvited, 0)}
              </div>
              <div className="text-sm text-white/60">Total Participants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {campaigns.reduce((sum, c) => sum + c.metrics.totalCompleted, 0)}
              </div>
              <div className="text-sm text-white/60">Assessments Completed</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {campaigns.length > 0 
                  ? Math.round(campaigns.reduce((sum, c) => sum + c.metrics.completionRate, 0) / campaigns.length)
                  : 0}%
              </div>
              <div className="text-sm text-white/60">Avg Completion Rate</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}