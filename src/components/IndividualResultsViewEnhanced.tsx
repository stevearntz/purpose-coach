'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Building2, ChevronDown, ChevronUp,
  Clock, CheckCircle, Users, Hash, Loader2, Mail, TrendingUp, X, Copy, Rocket
} from 'lucide-react'

interface AssessmentData {
  id: string
  invitationId: string
  toolId: string
  toolName: string
  completedAt: string
  shareId?: string
  
  user: {
    email: string
    name: string
    company: string
  }
  
  responses: any
  scores?: any
  summary?: string
  insights?: any
  recommendations?: any
  userProfile?: any
  
  pdfUrl?: string
  pdfGeneratedAt?: string
}

interface IndividualResult {
  id: string
  participantName: string
  participantEmail: string
  department?: string
  teamSize?: string
  assessmentType: string
  campaignName?: string
  completedAt?: string
  startedAt?: string
  status: string // Allow any status string for flexibility
  
  // Enhanced with real assessment data
  assessmentData?: AssessmentData
}

interface Props {
  results: IndividualResult[]
  loading?: boolean
  companyId?: string
}

const statusConfig: Record<string, any> = {
  'COMPLETED': {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    label: 'Completed'
  },
  'STARTED': {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    label: 'In Progress'
  },
  'SENT': {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Mail,
    label: 'Invited'
  },
  'INVITED': {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Mail,
    label: 'Invited'
  },
  'PENDING': {
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: Clock,
    label: 'Pending'
  }
}

const toolColors: Record<string, string> = {
  'purpose-coach': 'bg-purple-100 text-purple-700',
  'values-explorer': 'bg-blue-100 text-blue-700',
  'strengths-finder': 'bg-green-100 text-green-700',
  'team-charter': 'bg-amber-100 text-amber-700',
  'trust-audit': 'bg-red-100 text-red-700',
  'hr-partnership': 'bg-indigo-100 text-indigo-700',
  'burnout-assessment': 'bg-orange-100 text-orange-700'
}

export default function IndividualResultsViewEnhanced({ results, loading = false, companyId }: Props) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssessment, setFilterAssessment] = useState<string>('all')
  const [filterCampaign, setFilterCampaign] = useState<string>('all')
  const [assessmentData, setAssessmentData] = useState<Record<string, AssessmentData[]>>({})
  const [loadingAssessments, setLoadingAssessments] = useState<Set<string>>(new Set())
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [showBulkCopy, setShowBulkCopy] = useState(false)
  
  // Email modal state - commented out for now
  // const [showEmailModal, setShowEmailModal] = useState(false)
  // const [selectedParticipant, setSelectedParticipant] = useState<IndividualResult | null>(null)
  // const [emailSubject, setEmailSubject] = useState('')
  // const [emailMessage, setEmailMessage] = useState('')
  
  // Fetch assessment data for completed results
  useEffect(() => {
    const fetchAssessmentData = async () => {
      const completedResults = results.filter(r => r.status?.toLowerCase() === 'completed')
      
      for (const result of completedResults) {
        if (!assessmentData[result.id] && !loadingAssessments.has(result.id)) {
          setLoadingAssessments(prev => new Set(prev).add(result.id))
          
          try {
            const response = await fetch(`/api/assessments/results?email=${encodeURIComponent(result.participantEmail)}`)
            const data = await response.json()
            
            if (data.success && data.results.length > 0) {
              setAssessmentData(prev => ({
                ...prev,
                [result.id]: data.results
              }))
            }
          } catch (error) {
            console.error('Error fetching assessment data:', error)
          } finally {
            setLoadingAssessments(prev => {
              const newSet = new Set(prev)
              newSet.delete(result.id)
              return newSet
            })
          }
        }
      }
    }
    
    fetchAssessmentData()
  }, [results])
  
  // First, filter to get only the most recent result per user/campaign/assessment combination
  const getMostRecentResults = (allResults: IndividualResult[]) => {
    const resultMap = new Map<string, IndividualResult>()
    
    // Sort by completedAt/startedAt date (newest first)
    const sortedResults = [...allResults].sort((a, b) => {
      const dateA = new Date(a.completedAt || a.startedAt || 0).getTime()
      const dateB = new Date(b.completedAt || b.startedAt || 0).getTime()
      return dateB - dateA // Newest first
    })
    
    // Keep only the most recent result for each user+campaign+assessment combination
    // If no campaign (individual), group those separately
    sortedResults.forEach(result => {
      // Create a unique key that includes campaign (or 'individual' if no campaign)
      // This keeps campaign results separate from individual results
      const campaignKey = result.campaignName || 'individual'
      const key = `${result.participantEmail}_${campaignKey}_${result.assessmentType}`
      
      // Only add if we haven't seen this combination before (since we sorted by newest first)
      if (!resultMap.has(key)) {
        resultMap.set(key, result)
      }
    })
    
    return Array.from(resultMap.values())
  }
  
  // Get deduplicated results
  const deduplicatedResults = getMostRecentResults(results)
  
  // Filter results based on search and filters
  const filteredResults = deduplicatedResults.filter(result => {
    const matchesSearch = searchTerm === '' || 
      result.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.participantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || result.status?.toLowerCase() === filterStatus
    const matchesAssessment = filterAssessment === 'all' || result.assessmentType === filterAssessment
    const matchesCampaign = filterCampaign === 'all' || 
      (filterCampaign === 'No Campaign' && !result.campaignName) ||
      result.campaignName === filterCampaign
    
    return matchesSearch && matchesStatus && matchesAssessment && matchesCampaign
  })
  
  // Get unique assessment types and campaigns for filters (use deduplicated results)
  const assessmentTypes = [...new Set(deduplicatedResults.map(r => r.assessmentType))]
  const campaigns = [...new Set(deduplicatedResults.filter(r => r.campaignName).map(r => r.campaignName!))]
  
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  const getCompletionTime = (startedAt?: string, completedAt?: string) => {
    if (!startedAt || !completedAt) return null
    const start = new Date(startedAt).getTime()
    const end = new Date(completedAt).getTime()
    const minutes = Math.round((end - start) / 60000)
    
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }
  
  // Copy single email to clipboard
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }
  
  // Copy all filtered emails as CSV
  const copyAllEmails = () => {
    const emails = filteredResults.map(r => r.participantEmail).join(', ')
    navigator.clipboard.writeText(emails)
    setShowBulkCopy(true)
    setTimeout(() => setShowBulkCopy(false), 2000)
  }
  
  // Email modal handlers - commented out for now
  // const openEmailModal = (participant: IndividualResult) => {
  //   setSelectedParticipant(participant)
  //   setEmailSubject('')
  //   setEmailMessage('')
  //   setShowEmailModal(true)
  // }
  
  // const closeEmailModal = () => {
  //   setShowEmailModal(false)
  //   setSelectedParticipant(null)
  //   setEmailSubject('')
  //   setEmailMessage('')
  // }
  
  // const sendEmail = async () => {
  //   if (!selectedParticipant || !emailSubject.trim() || !emailMessage.trim()) {
  //     console.warn('Missing required fields for email')
  //     return
  //   }
    
  //   try {
  //     const response = await fetch('/api/send-message', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         recipientEmail: selectedParticipant.participantEmail,
  //         recipientName: selectedParticipant.participantName,
  //         senderName: 'HR Team', // TODO: Get from session
  //         subject: emailSubject,
  //         message: emailMessage,
  //         assessmentType: selectedParticipant.assessmentType,
  //         status: selectedParticipant.status.toLowerCase(),
  //         campaignId: selectedParticipant.campaignName,
  //         deadline: 'August 26, 2025' // TODO: Get from campaign
  //       })
  //     })
      
  //     const data = await response.json()
      
  //     if (data.success) {
  //       console.log('Email template generated:', data)
  //       // TODO: Show success notification
  //     }
  //   } catch (error) {
  //     console.error('Error sending message:', error)
  //     // TODO: Show error notification
  //   }
    
  //   closeEmailModal()
  // }
  
  const renderAssessmentDetails = (resultId: string, assessments: AssessmentData[], result: IndividualResult) => {
    // Check if we're still loading this result's data
    const isLoadingData = loadingAssessments.has(resultId);
    
    if (isLoadingData) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-purple-600 mr-3" />
          <span className="text-gray-600">Loading assessment details...</span>
        </div>
      )
    }
    
    if (!assessments || assessments.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          <p className="text-sm">No assessment data available</p>
        </div>
      )
    }
    
    // Filter to only show the most recent assessment that matches this result's campaign context
    let relevantAssessment: AssessmentData | null = null;
    
    if (result.campaignName) {
      // For campaign results, find the assessment that matches the campaign
      relevantAssessment = assessments.find(a => {
        // Check if the assessment was from this campaign
        // This would need to be stored in the assessment data
        return a.completedAt === result.completedAt;
      }) || assessments[0]; // Fallback to most recent
    } else {
      // For individual results, use the most recent assessment
      relevantAssessment = assessments[0];
    }
    
    if (!relevantAssessment) {
      return (
        <div className="py-8 text-center text-gray-500">
          <p className="text-sm">No matching assessment data found</p>
        </div>
      )
    }
    
    // Now render only the single relevant assessment
    const assessment = relevantAssessment;
    
    // Priority names mapping
    const priorityLabels: Record<string, string> = {
      'revenue': 'Revenue, sales, or growth targets',
      'customer': 'Customer success or retention',
      'product': 'Product or delivery milestones',
      'team': 'Team performance or growth',
      'collaboration': 'Cross-functional collaboration',
      'culture': 'Culture or engagement',
      'operations': 'Operational efficiency',
      'budget': 'Budget or cost management',
      'strategy': 'Strategy or planning',
      'change': 'Change or transformation efforts',
      'focus': 'My own focus / effectiveness',
      'risk': 'Risk management or compliance'
    };
    
    return (
      <div className="space-y-4">
        <div className="space-y-4 bg-white/5 rounded-lg p-6">
          {/* Only show insights for HR Partnership */}
          {assessment.toolId === 'hr-partnership' && assessment.insights && typeof assessment.insights === 'object' && (
            <div className="space-y-6">
                {/* Challenge Areas - Main focus */}
                {assessment.insights.mainChallengeAreas && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Challenge Areas</h3>
                    <div className="space-y-3">
                      {(Array.isArray(assessment.insights.mainChallengeAreas) 
                        ? assessment.insights.mainChallengeAreas 
                        : Object.values(assessment.insights.mainChallengeAreas)
                      ).map((area: any, idx: number) => (
                        <div key={idx} className="border-l-4 border-red-400 pl-4">
                          <h4 className="font-medium text-white/90 mb-2">{area.category}</h4>
                          {area.challenges && Array.isArray(area.challenges) && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {area.challenges.map((challenge: string, cidx: number) => (
                                <span key={cidx} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                                  {challenge}
                                </span>
                              ))}
                            </div>
                          )}
                          {/* Challenge area details/comments */}
                          {area.details && area.details.trim() && (
                            <blockquote className="border-l-4 border-white/30 pl-4 italic text-white/70 text-sm mt-2">
                              "{area.details}"
                            </blockquote>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills to Develop */}
                {assessment.insights.skillGaps && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Skills to Develop</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(Array.isArray(assessment.insights.skillGaps) 
                        ? assessment.insights.skillGaps 
                        : Object.values(assessment.insights.skillGaps).flat()
                      ).map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                    {/* Skills details/comments */}
                    {assessment.responses?.skillDetails && assessment.responses.skillDetails.trim() && (
                      <blockquote className="border-l-4 border-white/30 pl-4 italic text-white/70 text-sm">
                        "{assessment.responses.skillDetails}"
                      </blockquote>
                    )}
                  </div>
                )}

                {/* Support Needs - as pills */}
                {assessment.insights.supportNeeds && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Support Needs</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(Array.isArray(assessment.insights.supportNeeds) 
                        ? assessment.insights.supportNeeds 
                        : Object.values(assessment.insights.supportNeeds).flat()
                      ).map((need: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                          {need}
                        </span>
                      ))}
                    </div>
                    {/* Support details/comments */}
                    {assessment.responses?.supportDetails && assessment.responses.supportDetails.trim() && (
                      <blockquote className="border-l-4 border-white/30 pl-4 italic text-white/70 text-sm">
                        "{assessment.responses.supportDetails}"
                      </blockquote>
                    )}
                  </div>
                )}

                {/* Focus Areas (Priorities) with full names */}
                {assessment.insights.priorities && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Focus Areas</h3>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(Array.isArray(assessment.insights.priorities) 
                        ? assessment.insights.priorities 
                        : Object.values(assessment.insights.priorities).flat()
                      ).map((priority: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                          {priorityLabels[priority] || priority}
                        </span>
                      ))}
                    </div>
                    {/* Team priorities comments */}
                    {assessment.responses?.teamPriorities && assessment.responses.teamPriorities.trim() && (
                      <blockquote className="border-l-4 border-white/30 pl-4 italic text-white/70 text-sm">
                        "{assessment.responses.teamPriorities}"
                      </blockquote>
                    )}
                  </div>
                )}

                {/* Additional Insights - always show if present */}
                {assessment.responses?.additionalInsights && assessment.responses.additionalInsights.trim() && (
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Additional Insights</h3>
                    <blockquote className="border-l-4 border-white/30 pl-4 italic text-white/70">
                      "{assessment.responses.additionalInsights}"
                    </blockquote>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }
  
  if (results.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
        <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Individual Results Yet
        </h3>
        <p className="text-white/60 max-w-md mx-auto mb-6">
          Individual assessment results will appear here as participants complete their assessments
        </p>
        <button
          onClick={() => router.push('/dashboard/launch')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Rocket className="w-5 h-5" />
          Go to Assessments
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box - takes up less space */}
          <div className="md:col-span-4">
            <input
              type="text"
              placeholder="Search by name, email, dept..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            />
          </div>
          
          {/* Status filter */}
          <div className="md:col-span-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            >
              <option value="all" className="bg-gray-900">All Status</option>
              <option value="completed" className="bg-gray-900">Completed</option>
              <option value="started" className="bg-gray-900">In Progress</option>
              <option value="invited" className="bg-gray-900">Invited</option>
              <option value="pending" className="bg-gray-900">Pending</option>
            </select>
          </div>
          
          {/* Campaign filter */}
          <div className="md:col-span-3">
            <select
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            >
              <option value="all" className="bg-gray-900">All Campaigns</option>
              {campaigns.map(campaign => (
                <option key={campaign} value={campaign} className="bg-gray-900">{campaign}</option>
              ))}
              <option value="No Campaign" className="bg-gray-900">Individual Assessments</option>
            </select>
          </div>
          
          {/* Assessment type filter */}
          <div className="md:col-span-3">
            <select
              value={filterAssessment}
              onChange={(e) => setFilterAssessment(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50"
            >
              <option value="all" className="bg-gray-900">All Assessments</option>
              {assessmentTypes.map(type => (
                <option key={type} value={type} className="bg-gray-900">{type}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-3 text-sm text-white/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>Showing {filteredResults.length} of {deduplicatedResults.length} results</span>
            {results.length > deduplicatedResults.length && (
              <span className="text-amber-400 text-xs">
                ({results.length - deduplicatedResults.length} duplicate{results.length - deduplicatedResults.length > 1 ? 's' : ''} hidden)
              </span>
            )}
            {filteredResults.length > 0 && (
              <>
                <span className="text-white/40">•</span>
                <button
                  onClick={copyAllEmails}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {showBulkCopy ? 'Copied!' : 'Copy result emails as CSV'}
                </button>
              </>
            )}
          </div>
          {(searchTerm || filterStatus !== 'all' || filterAssessment !== 'all' || filterCampaign !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('')
                setFilterStatus('all')
                setFilterAssessment('all')
                setFilterCampaign('all')
              }}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {/* Results Cards */}
      <div className="space-y-4">
        {filteredResults.map((result) => {
          const status = result.status?.toUpperCase() || 'PENDING'
          const StatusIcon = statusConfig[status]?.icon || Clock
          const isExpanded = expandedId === result.id
          const completionTime = getCompletionTime(result.startedAt, result.completedAt)
          const resultAssessments = assessmentData[result.id] || []
          const isLoadingData = loadingAssessments.has(result.id)
          
          return (
            <div key={result.id} className="bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-white/20 transition-all">
              {/* Card Header - Always Visible */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(result.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Top row: Name, Email Pill, Status Pill, Timestamp */}
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <h3 className="font-semibold text-lg text-white">
                        {result.participantName}
                      </h3>
                      
                      {/* Email Pill with Copy */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyEmail(result.participantEmail)
                        }}
                        className="px-3 py-1 rounded-full text-sm font-medium border bg-indigo-500/20 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/30 transition-colors flex items-center gap-1"
                      >
                        {copiedEmail === result.participantEmail ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-3 h-3" />
                            <span>{result.participantEmail}</span>
                          </>
                        )}
                      </button>
                      
                      {/* Status Pill */}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[status]?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig[status]?.label || 'Unknown'}
                      </span>
                      
                      {/* Timestamp */}
                      {result.completedAt && (
                        <span className="text-sm text-white/60">
                          {formatDate(result.completedAt)}
                        </span>
                      )}
                    </div>
                    
                    {/* Meta Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-1 text-white/60">
                        <Building2 className="w-4 h-4" />
                        <span>Department: <span className="font-medium text-white">{resultAssessments[0]?.responses?.department || result.department || 'N/A'}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <Users className="w-4 h-4" />
                        <span>Team Size: <span className="font-medium text-white">{resultAssessments[0]?.responses?.teamSize || result.teamSize || 'N/A'}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <Hash className="w-4 h-4" />
                        <span>{result.assessmentType}</span>
                      </div>
                      {result.campaignName && (
                        <div className="flex items-center gap-1 text-white/60">
                          <TrendingUp className="w-4 h-4" />
                          <span>{result.campaignName}</span>
                        </div>
                      )}
                    </div>
                    
                  </div>
                  
                  {/* Action Icons */}
                  <div className="ml-4 flex items-center gap-2">
                    {/* Email Icon - commented out for now */}
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openEmailModal(result)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={`Send message to ${result.participantName}`}
                    >
                      <Mail className="w-4 h-4" />
                    </button> */}
                    
                    {/* Expand/Collapse Icon */}
                    {status === 'COMPLETED' && (
                      <div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {isExpanded && status === 'COMPLETED' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="mt-4">
                    {renderAssessmentDetails(result.id, resultAssessments, result)}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
