'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Users, Calendar, Clock, Target, BarChart3, 
  Send, Download, RefreshCw, Settings, ChevronRight,
  CheckCircle, AlertCircle, XCircle, Mail, ExternalLink,
  TrendingUp, Copy, Share2
} from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import { useToast } from '@/hooks/useToast'
import { ToastProvider } from '@/hooks/useToast'

interface CampaignData {
  id: string
  name: string
  toolName: string
  toolPath: string
  status: string
  createdAt: string
  startDate: string
  deadline: string
  uniqueLink: string
  uniqueCode: string
  description?: string
  participants: Array<{
    userId: string
    email: string
    name: string
    status: 'invited' | 'started' | 'completed' | 'expired'
    invitedAt: string
    startedAt?: string
    completedAt?: string
    remindersSent: number
  }>
  metrics: {
    totalInvited: number
    totalStarted: number
    totalCompleted: number
    completionRate: number
    averageScore?: number
  }
  settings: {
    sendReminders: boolean
    anonymousResults: boolean
    reminderFrequency: string
  }
}

function CampaignDashboardContent({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [campaign, setCampaign] = useState<CampaignData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'participants' | 'results'>('overview')
  const [sendingReminders, setSendingReminders] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    loadCampaign()
  }, [params.id])

  const loadCampaign = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/campaigns?id=${params.id}`)
      if (!response.ok) {
        throw new Error('Campaign not found')
      }
      const data = await response.json()
      setCampaign(data)
    } catch (error) {
      console.error('Failed to load campaign:', error)
      showError('Failed to load campaign')
      router.push('/dashboard?tab=tools')
    } finally {
      setLoading(false)
    }
  }

  const copyInviteLink = async () => {
    if (!campaign) return
    
    try {
      await navigator.clipboard.writeText(campaign.uniqueLink)
      setCopiedLink(true)
      showSuccess('Campaign link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 3000)
    } catch (error) {
      showError('Failed to copy link')
    }
  }

  const sendReminders = async () => {
    setSendingReminders(true)
    try {
      // In production, this would send actual reminder emails
      await new Promise(resolve => setTimeout(resolve, 2000))
      showSuccess('Reminders sent to all pending participants')
    } catch (error) {
      showError('Failed to send reminders')
    } finally {
      setSendingReminders(false)
    }
  }

  const exportResults = () => {
    // In production, this would generate and download a CSV
    showSuccess('Results exported successfully')
  }

  if (loading) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading campaign...</div>
      </ViewportContainer>
    )
  }

  if (!campaign) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Campaign not found</div>
      </ViewportContainer>
    )
  }

  // Calculate time remaining
  const now = new Date()
  const deadline = new Date(campaign.deadline)
  const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const isExpired = daysRemaining < 0

  // Get participant stats
  const notStarted = campaign.participants.filter(p => p.status === 'invited').length
  const inProgress = campaign.participants.filter(p => p.status === 'started').length
  const completed = campaign.participants.filter(p => p.status === 'completed').length

  return (
    <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-4 py-6 border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push('/dashboard?tab=tools')}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={copyInviteLink}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center gap-2"
                >
                  {copiedLink ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </button>
                
                <button
                  onClick={sendReminders}
                  disabled={sendingReminders || completed === campaign.participants.length}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Mail className="w-4 h-4" />
                  {sendingReminders ? 'Sending...' : 'Send Reminders'}
                </button>
                
                <button
                  onClick={exportResults}
                  disabled={completed === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  Export Results
                </button>
              </div>
            </div>

            {/* Campaign Header */}
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">{campaign.name}</h1>
                  <div className="flex items-center gap-4 text-white/70">
                    <span className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {campaign.toolName}
                    </span>
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.deadline).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {campaign.participants.length} participants
                    </span>
                  </div>
                  {campaign.description && (
                    <p className="mt-3 text-white/80">{campaign.description}</p>
                  )}
                </div>
                
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isExpired 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : daysRemaining <= 3
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                    : 'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {isExpired 
                    ? 'Expired'
                    : daysRemaining === 0 
                    ? 'Due Today'
                    : `${daysRemaining} days remaining`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8 max-w-7xl mx-auto">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Not Started</span>
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-white">{notStarted}</div>
              <div className="text-xs text-white/50 mt-1">
                {((notStarted / campaign.participants.length) * 100).toFixed(0)}% of total
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">In Progress</span>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white">{inProgress}</div>
              <div className="text-xs text-white/50 mt-1">
                {((inProgress / campaign.participants.length) * 100).toFixed(0)}% of total
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Completed</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white">{completed}</div>
              <div className="text-xs text-white/50 mt-1">
                {campaign.metrics.completionRate.toFixed(0)}% completion rate
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Avg Score</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white">
                {campaign.metrics.averageScore ? `${campaign.metrics.averageScore}%` : 'N/A'}
              </div>
              <div className="text-xs text-white/50 mt-1">
                {completed > 0 ? 'Based on completions' : 'No data yet'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-white">Overall Progress</h3>
              <span className="text-white/60 text-sm">
                {completed} of {campaign.participants.length} completed
              </span>
            </div>
            <div className="h-4 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full flex">
                <div 
                  className="bg-green-500 transition-all duration-500"
                  style={{ width: `${(completed / campaign.participants.length) * 100}%` }}
                />
                <div 
                  className="bg-blue-500 transition-all duration-500"
                  style={{ width: `${(inProgress / campaign.participants.length) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-6 mt-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span className="text-white/60">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-white/60">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white/20 rounded-full" />
                <span className="text-white/60">Not Started</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
            <div className="border-b border-white/10">
              <nav className="flex">
                <button
                  onClick={() => setSelectedTab('overview')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                    selectedTab === 'overview' 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Overview
                  {selectedTab === 'overview' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab('participants')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                    selectedTab === 'participants' 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Participants ({campaign.participants.length})
                  {selectedTab === 'participants' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedTab('results')}
                  className={`px-6 py-4 text-sm font-medium transition-colors relative ${
                    selectedTab === 'results' 
                      ? 'text-white' 
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  Results ({completed})
                  {selectedTab === 'results' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                  )}
                </button>
              </nav>
            </div>

            <div className="p-6">
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  {/* Campaign Link */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Campaign Link</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={campaign.uniqueLink}
                        readOnly
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
                      />
                      <button
                        onClick={copyInviteLink}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href={campaign.uniqueLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-sm text-white/60 mt-2">
                      Share this link with participants to access the assessment
                    </p>
                  </div>

                  {/* Settings */}
                  <div>
                    <h3 className="text-lg font-medium text-white mb-3">Campaign Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        {campaign.settings.sendReminders ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-white/80">
                          {campaign.settings.sendReminders 
                            ? `Automatic reminders (${campaign.settings.reminderFrequency})`
                            : 'No automatic reminders'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {campaign.settings.anonymousResults ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-white/80">
                          {campaign.settings.anonymousResults 
                            ? 'Anonymous results (aggregate only)'
                            : 'Individual results visible'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'participants' && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-white/60 text-sm border-b border-white/10">
                        <th className="pb-3 pr-4">Name</th>
                        <th className="pb-3 pr-4">Email</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Started</th>
                        <th className="pb-3 pr-4">Completed</th>
                        <th className="pb-3">Reminders</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaign.participants.map((participant) => (
                        <tr key={participant.userId} className="border-b border-white/5">
                          <td className="py-4 pr-4">
                            <span className="text-white font-medium">{participant.name}</span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className="text-white/60 text-sm">{participant.email}</span>
                          </td>
                          <td className="py-4 pr-4">
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              participant.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400'
                                : participant.status === 'started'
                                ? 'bg-blue-500/20 text-blue-400'
                                : participant.status === 'expired'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {participant.status}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-white/60 text-sm">
                            {participant.startedAt 
                              ? new Date(participant.startedAt).toLocaleDateString()
                              : '-'
                            }
                          </td>
                          <td className="py-4 pr-4 text-white/60 text-sm">
                            {participant.completedAt 
                              ? new Date(participant.completedAt).toLocaleDateString()
                              : '-'
                            }
                          </td>
                          <td className="py-4 text-white/60 text-sm">
                            {participant.remindersSent} sent
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedTab === 'results' && (
                <div>
                  {completed === 0 ? (
                    <div className="text-center py-12 text-white/60">
                      <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No results yet. Participants need to complete the assessment first.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-white/60">
                        Results will be displayed here as participants complete the assessment.
                        {campaign.settings.anonymousResults && (
                          <span className="block mt-2 text-yellow-400">
                            Note: Individual results are anonymous. Only aggregate data is shown.
                          </span>
                        )}
                      </p>
                      {/* Results would be displayed here */}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </ViewportContainer>
  )
}

export default function CampaignDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  return (
    <ToastProvider>
      <CampaignDashboardContent params={resolvedParams} />
    </ToastProvider>
  )
}