'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Plus, Rocket, Calendar, Users, BarChart3, Clock, 
  Link, Download, CheckCircle, AlertCircle, X,
  Loader2, Copy, Mail, ArrowLeft, Target
} from 'lucide-react'
import CampaignCreationWizard from './CampaignCreationWizard'
import { ToastProvider } from '@/hooks/useToast'

interface Campaign {
  id: string
  name: string
  description?: string
  toolName?: string
  toolId?: string
  campaignLink?: string
  status: string
  startDate: string
  endDate?: string
  createdAt: string
  participantCount?: number
  completionRate?: number
}

interface Participant {
  id: string
  name: string
  email: string
  status: 'COMPLETED' | 'STARTED' | 'SENT' | 'PENDING'
  inviteCode?: string
  inviteLink?: string
  completedAt?: string
  startedAt?: string
}

export default function CampaignsTab() {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loadingParticipants, setLoadingParticipants] = useState(false)
  const [showParticipantsModal, setShowParticipantsModal] = useState(false)
  const [expandedCampaigns, setExpandedCampaigns] = useState<Set<string>>(new Set())
  const [campaignParticipants, setCampaignParticipants] = useState<{ [key: string]: Participant[] }>({})
  const [loadingCampaignParticipants, setLoadingCampaignParticipants] = useState<{ [key: string]: boolean }>({})
  const [copiedCampaign, setCopiedCampaign] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  const [copiedEmails, setCopiedEmails] = useState<{ [key: string]: boolean }>({})
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'email'>('list')
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [wizardInitialStep, setWizardInitialStep] = useState(1)

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    setLoading(true)
    try {
      // Use authenticated endpoint
      const response = await fetch('/api/campaigns', {
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

  const loadParticipants = async (campaign: Campaign) => {
    setLoadingParticipants(true)
    try {
      // Get participants for this campaign
      const response = await fetch(`/api/campaigns/${campaign.id}/participants`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
      }
    } catch (error) {
      console.error('Failed to load participants:', error)
      // For now, create mock data
      setParticipants([
        { 
          id: '1', 
          name: 'Steve Arntz', 
          email: 'steve@getcampfire.com', 
          status: 'COMPLETED',
          completedAt: '2025-08-12T18:11:12.780Z'
        },
        { 
          id: '2', 
          name: 'Ella Wright', 
          email: 'ella@getcampfire.com', 
          status: 'SENT',
          inviteCode: '2AvNGWOHr5'
        }
      ])
    } finally {
      setLoadingParticipants(false)
    }
  }

  const handleViewParticipants = async (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setShowParticipantsModal(true)
    await loadParticipants(campaign)
  }

  const toggleCampaignExpansion = async (campaign: Campaign, e?: React.MouseEvent) => {
    // Prevent event from bubbling if called from a specific element
    if (e) {
      e.stopPropagation()
    }
    
    const isExpanded = expandedCampaigns.has(campaign.id)
    
    if (isExpanded) {
      // Collapse
      setExpandedCampaigns(prev => {
        const next = new Set(prev)
        next.delete(campaign.id)
        return next
      })
    } else {
      // Expand and load participants if not already loaded
      setExpandedCampaigns(prev => new Set(prev).add(campaign.id))
      
      if (!campaignParticipants[campaign.id] && !loadingCampaignParticipants[campaign.id]) {
        setLoadingCampaignParticipants(prev => ({ ...prev, [campaign.id]: true }))
        
        try {
          const response = await fetch(`/api/campaigns/${campaign.id}/participants`, {
            credentials: 'include'
          })
          if (response.ok) {
            const data = await response.json()
            setCampaignParticipants(prev => ({ ...prev, [campaign.id]: data.participants || [] }))
          }
        } catch (error) {
          console.error('Failed to load participants:', error)
          setCampaignParticipants(prev => ({ ...prev, [campaign.id]: [] }))
        } finally {
          setLoadingCampaignParticipants(prev => ({ ...prev, [campaign.id]: false }))
        }
      }
    }
  }

  const handleRemindParticipant = async (participant: Participant) => {
    // TODO: Implement reminder API
    console.log('Reminding participant:', participant.email)
    // Will show inline confirmation when implemented
  }

  const handleRemindAll = async () => {
    const incompleteParticipants = participants.filter(p => p.status !== 'COMPLETED')
    // TODO: Implement bulk reminder API
    console.log('Reminding all incomplete participants:', incompleteParticipants)
    // Will show inline confirmation when implemented
  }

  const copyInviteLink = (participant: Participant) => {
    const link = participant.inviteLink || ''
    navigator.clipboard.writeText(link)
    setCopiedLink(participant.id)
    setTimeout(() => setCopiedLink(null), 2000)
  }
  
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmails(prev => ({ ...prev, [email]: true }))
    setTimeout(() => {
      setCopiedEmails(prev => ({ ...prev, [email]: false }))
    }, 2000)
  }

  const copyCampaignLink = (campaign: Campaign) => {
    // Use the actual campaign link from metadata if available
    const link = campaign.campaignLink || `${window.location.origin}/hr-partnership?campaign=${campaign.id}`
    navigator.clipboard.writeText(link)
    setCopiedCampaign(campaign.id)
    setTimeout(() => setCopiedCampaign(null), 1500)
  }

  const exportCampaignData = async (campaign: Campaign) => {
    setLoadingParticipants(true)
    try {
      const response = await fetch(`/api/campaigns/${campaign.id}/participants`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        const participantData = data.participants || []
        
        // Create CSV content
        const headers = ['Name', 'Email', 'Status', 'Date/Timestamp', 'Department', 'Team Size']
        const rows = participantData.map((p: any) => [
          p.name || '',
          p.email || '',
          p.status || '',
          p.completedAt || p.startedAt || p.sentAt || '',
          p.department || 'N/A',
          p.teamSize || 'N/A'
        ])
        
        const csvContent = [
          headers.join(','),
          ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(','))
        ].join('\n')
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${campaign.name.replace(/\s+/g, '_')}_participants.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('API not available')
      }
    } catch (error) {
      console.error('Failed to export campaign data:', error)
      // Use mock data as fallback
      const mockData = [
        ['Steve Arntz', 'steve@getcampfire.com', 'COMPLETED', '2025-08-12T18:11:12.780Z', 'Product', '1-5'],
        ['Ella Wright', 'ella@getcampfire.com', 'SENT', '2025-08-12T11:01:00.000Z', 'N/A', 'N/A']
      ]
      
      const headers = ['Name', 'Email', 'Status', 'Date/Timestamp', 'Department', 'Team Size']
      const csvContent = [
        headers.join(','),
        ...mockData.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${campaign.name.replace(/\s+/g, '_')}_participants.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } finally {
      setLoadingParticipants(false)
    }
  }

  const handleEmailCampaign = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setWizardInitialStep(4) // Jump directly to step 4 - the Send/Email Helper step
    setViewMode('email')
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

  const getParticipantStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'STARTED':
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />
    }
  }

  const getParticipantStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400'
      case 'STARTED':
        return 'text-yellow-400'
      case 'SENT':
        return 'text-blue-400'
      default:
        return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/60">Loading campaigns...</div>
      </div>
    )
  }

  // Render the creation/email wizard inline
  if (viewMode === 'create' || viewMode === 'email') {
    const isEmailMode = viewMode === 'email'
    const campaign = editingCampaign
    
    // Parse campaign metadata if in email mode
    let toolData = {
      toolId: 'people-leader-needs',
      toolTitle: 'People Leadership Needs Assessment',
      toolPath: '/people-leader-needs',
      toolGradient: 'from-purple-600 to-purple-700'
    }
    
    if (isEmailMode && campaign?.description) {
      try {
        const metadata = JSON.parse(campaign.description)
        toolData = {
          toolId: metadata.toolId || toolData.toolId,
          toolTitle: metadata.toolName || toolData.toolTitle,
          toolPath: metadata.toolPath || toolData.toolPath,
          toolGradient: toolData.toolGradient // Keep default gradient
        }
      } catch (e) {
        // Use defaults if parsing fails
      }
    }
    
    return (
      <ToastProvider>
        <div>
          {/* Back link */}
          <button
            onClick={() => {
              setViewMode('list')
              setEditingCampaign(null)
              setWizardInitialStep(1)
            }}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to campaigns</span>
          </button>
          
          {/* Inline wizard */}
          <CampaignCreationWizard
            toolId={toolData.toolId}
            toolTitle={toolData.toolTitle}
            toolPath={toolData.toolPath}
            toolGradient={toolData.toolGradient}
            toolIcon={<Target className="w-6 h-6" />}
            editingCampaign={campaign}
            initialStep={wizardInitialStep}
            onClose={() => {
              setViewMode('list')
              setEditingCampaign(null)
              setWizardInitialStep(1)
              loadCampaigns() // Refresh the list
            }}
          />
        </div>
      </ToastProvider>
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
            Launch your first assessment to start gathering insights from your team
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
        /* Campaign List */
        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const isExpanded = expandedCampaigns.has(campaign.id)
            const participants = campaignParticipants[campaign.id] || []
            const isLoading = loadingCampaignParticipants[campaign.id] || false
            
            return (
              <div
                key={campaign.id}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all"
              >
              <div 
                className="p-6 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => toggleCampaignExpansion(campaign)}
              >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {campaign.name}
                  </h3>
                  {campaign.toolName && (
                    <p className="text-sm text-white/60">
                      {campaign.toolName} Assessment
                    </p>
                  )}
                  {campaign.description && (
                    <p className="text-sm text-white/50 italic mt-1">
                      "{campaign.description}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                  
                  {/* Email Helper Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEmailCampaign(campaign)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Email helper"
                  >
                    <Mail className="w-4 h-4 text-white/60 group-hover:text-white" />
                  </button>
                  
                  {/* Copy Link Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      copyCampaignLink(campaign)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Copy campaign link"
                  >
                    {copiedCampaign === campaign.id ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <Link className="w-4 h-4 text-white/60 group-hover:text-white" />
                    )}
                  </button>
                  
                  {/* Download CSV Icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      exportCampaignData(campaign)
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Export participant data"
                  >
                    <Download className="w-4 h-4 text-white/60 group-hover:text-white" />
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
              
              {/* Expandable Participants Section */}
              {isExpanded && (
              <div className="border-t border-white/10 px-6 pb-6">
                <div className="pt-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white/80">Participants</h4>
                  </div>
                  
                  {isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="animate-spin h-6 w-6 text-purple-600 mr-2" />
                      <span className="text-white/60 text-sm">Loading participants...</span>
                    </div>
                  ) : participants.length > 0 ? (
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                      {participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="bg-white/5 rounded-lg px-4 py-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getParticipantStatusIcon(participant.status)}
                              <div>
                                <p className="text-white text-sm font-medium">{participant.name}</p>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyEmail(participant.email)
                                  }}
                                  className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1 group"
                                >
                                  {participant.email}
                                  {copiedEmails[participant.email] ? (
                                    <CheckCircle className="w-3 h-3 text-green-400 ml-1" />
                                  ) : (
                                    <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 ml-1" />
                                  )}
                                </button>
                                {participant.completedAt && (
                                  <p className="text-xs text-white/40 mt-1">
                                    Completed {formatDate(participant.completedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium px-2 py-1 rounded ${getParticipantStatusColor(participant.status)}`}>
                                {participant.status}
                              </span>
                              {participant.inviteLink && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    copyInviteLink(participant)
                                  }}
                                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors group"
                                  title="Copy unique invite link"
                                >
                                  {copiedLink === participant.id ? (
                                    <CheckCircle className="w-3 h-3 text-green-400" />
                                  ) : (
                                    <Link className="w-3 h-3 text-white/60 group-hover:text-white" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-white/40 text-sm">No participants yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
              </div>
            )
          })}
        </div>
      )}

      {/* Participants Modal */}
      {showParticipantsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-1">
                    Campaign Participants
                  </h3>
                  <p className="text-sm text-white/60">
                    {selectedCampaign.name}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowParticipantsModal(false)
                    setSelectedCampaign(null)
                    setParticipants([])
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[50vh]">
              {loadingParticipants ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-8 w-8 text-purple-600 mr-3" />
                  <span className="text-white/60">Loading participants...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="bg-white/5 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getParticipantStatusIcon(participant.status)}
                          <div>
                            <p className="text-white font-medium">{participant.name}</p>
                            <button
                              onClick={() => copyEmail(participant.email)}
                              className="text-sm text-white/60 hover:text-white transition-colors flex items-center gap-1 group"
                            >
                              {participant.email}
                              {copiedEmails[participant.email] ? (
                                <CheckCircle className="w-3 h-3 text-green-400 ml-1" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 ml-1" />
                              )}
                            </button>
                            {participant.completedAt && (
                              <p className="text-xs text-white/40 mt-1">
                                Completed {formatDate(participant.completedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${getParticipantStatusColor(participant.status)}`}>
                            {participant.status}
                          </span>
                          {participant.inviteLink && (
                            <button
                              onClick={() => copyInviteLink(participant)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                              title="Copy unique invite link"
                            >
                              {copiedLink === participant.id ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Link className="w-4 h-4 text-white/60 group-hover:text-white" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowParticipantsModal(false)
                    setSelectedCampaign(null)
                    setParticipants([])
                  }}
                  className="px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  Close
                </button>
                {participants.some(p => p.status !== 'COMPLETED') && (
                  <button
                    onClick={handleRemindAll}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-4 h-4" />
                    Remind All Incomplete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}