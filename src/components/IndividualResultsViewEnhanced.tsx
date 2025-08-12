'use client'

import React, { useState, useEffect } from 'react'
import { 
  Building2, ChevronDown, ChevronUp,
  Clock, CheckCircle, Users, Hash, Loader2, Mail
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
  status: 'completed' | 'started' | 'invited' | 'pending'
  
  // Enhanced with real assessment data
  assessmentData?: AssessmentData
}

interface Props {
  results: IndividualResult[]
  loading?: boolean
  companyId?: string
}

const statusConfig = {
  completed: {
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle,
    label: 'Completed'
  },
  started: {
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock,
    label: 'In Progress'
  },
  invited: {
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Mail,
    label: 'Invited'
  },
  pending: {
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssessment, setFilterAssessment] = useState<string>('all')
  const [assessmentData, setAssessmentData] = useState<Record<string, AssessmentData[]>>({})
  const [loadingAssessments, setLoadingAssessments] = useState<Set<string>>(new Set())
  
  // Fetch assessment data for completed results
  useEffect(() => {
    const fetchAssessmentData = async () => {
      const completedResults = results.filter(r => r.status === 'completed')
      
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
  
  // Filter results based on search and filters
  const filteredResults = results.filter(result => {
    const matchesSearch = searchTerm === '' || 
      result.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.participantEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus
    const matchesAssessment = filterAssessment === 'all' || result.assessmentType === filterAssessment
    
    return matchesSearch && matchesStatus && matchesAssessment
  })
  
  // Get unique assessment types for filter
  const assessmentTypes = [...new Set(results.map(r => r.assessmentType))]
  
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
  
  const renderAssessmentDetails = (resultId: string, assessments: AssessmentData[]) => {
    if (!assessments || assessments.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          <p className="text-sm">No assessment data available</p>
        </div>
      )
    }
    
    return (
      <div className="space-y-4">
        {assessments.map((assessment, idx) => (
          <div key={assessment.id} className="space-y-4">
            {/* Only show insights for HR Partnership */}
            {assessment.toolId === 'hr-partnership' && assessment.insights && typeof assessment.insights === 'object' && (
              <div className="space-y-4">
                {/* Challenge Areas - Main focus */}
                {assessment.insights.mainChallengeAreas && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-3">Challenge Areas</h5>
                    <div className="space-y-3">
                      {Object.entries(assessment.insights.mainChallengeAreas).map(([category, details]: [string, any]) => (
                        <div key={category} className="border-l-4 border-red-400 pl-4">
                          <h6 className="font-medium text-gray-800 mb-1">{category}</h6>
                          {details.challenges && Array.isArray(details.challenges) && (
                            <div className="flex flex-wrap gap-2">
                              {details.challenges.map((challenge: string, idx: number) => (
                                <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                                  {challenge}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills to Develop */}
                {assessment.insights.skillGaps && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Skills to Develop</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(assessment.insights.skillGaps).flatMap(([category, items]: [string, any]) => 
                        Array.isArray(items) ? items : [items]
                      ).map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Support Needs */}
                {assessment.insights.supportNeeds && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Immediate Support Needs</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(assessment.insights.supportNeeds).flatMap(([category, items]: [string, any]) => 
                        Array.isArray(items) ? items : [items]
                      ).map((need: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                          {need}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Focus Areas (Priorities) */}
                {assessment.insights.priorities && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Focus Areas</h5>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(assessment.insights.priorities).flatMap(([category, items]: [string, any]) => 
                        Array.isArray(items) ? items : [items]
                      ).map((priority: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {priority}
                        </span>
                      ))}
                    </div>
                  </div>
                    )}
                    {assessment.insights.supportNeeds && (
                      <div>
                        <h6 className="font-medium text-gray-700 mb-2">Support Needs</h6>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(assessment.insights.supportNeeds).map(([category, items]: [string, any]) => (
                            <div key={category} className="bg-yellow-50 rounded-lg p-3">
                              <p className="text-sm font-medium text-yellow-700">{category}</p>
                              {Array.isArray(items) ? (
                                <ul className="mt-1 text-sm text-gray-600">
                                  {items.map((item: string, idx: number) => (
                                    <li key={idx}>• {item}</li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-gray-600 mt-1">{String(items)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                )}

                {/* Additional Insights - Comments/Text */}
                {assessment.responses && assessment.responses.additionalComments && (
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Additional Insights</h5>
                    <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600">
                      "{assessment.responses.additionalComments}"
                    </blockquote>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
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
      <div className="bg-gray-50 rounded-xl p-12 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No Individual Results Yet
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Individual assessment results will appear here as participants complete their assessments
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="started">In Progress</option>
            <option value="invited">Invited</option>
            <option value="pending">Pending</option>
          </select>
          
          <select
            value={filterAssessment}
            onChange={(e) => setFilterAssessment(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Assessments</option>
            {assessmentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredResults.length} of {results.length} results
        </div>
      </div>
      
      {/* Results Cards */}
      <div className="space-y-4">
        {filteredResults.map((result) => {
          const status = result.status || 'pending'
          const StatusIcon = statusConfig[status]?.icon || Clock
          const isExpanded = expandedId === result.id
          const completionTime = getCompletionTime(result.startedAt, result.completedAt)
          const resultAssessments = assessmentData[result.id] || []
          const isLoadingData = loadingAssessments.has(result.id)
          
          return (
            <div key={result.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              {/* Card Header - Always Visible */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleExpand(result.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Name and Email */}
                    <div className="flex items-center gap-4 mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">
                          {result.participantName}
                        </h3>
                        <p className="text-sm text-gray-600">{result.participantEmail}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[status]?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig[status]?.label || 'Unknown'}
                      </span>
                    </div>
                    
                    {/* Meta Information */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>Department: <span className="font-medium">{result.department || 'N/A'}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>Team Size: <span className="font-medium">{result.teamSize || 'N/A'}</span></span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Hash className="w-4 h-4" />
                        <span>{result.assessmentType}</span>
                      </div>
                      {result.campaignName && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <TrendingUp className="w-4 h-4" />
                          <span>{result.campaignName}</span>
                        </div>
                      )}
                    </div>
                    
                  </div>
                  
                  {/* Expand/Collapse Icon */}
                  <div className="ml-4">
                    {result.status === 'completed' && (
                      isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )
                    )}
                  </div>
                </div>
                
                {/* Date Information */}
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500">
                  {result.completedAt ? (
                    <span>Completed {formatDate(result.completedAt)}</span>
                  ) : result.startedAt ? (
                    <span>Started {formatDate(result.startedAt)}</span>
                  ) : (
                    <span>Not started</span>
                  )}
                </div>
              </div>
              
              {/* Expanded Details */}
              {isExpanded && result.status === 'completed' && (
                <div className="px-6 pb-6 border-t border-gray-100">
                  <div className="mt-4">
                    {isLoadingData ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="animate-spin h-8 w-8 text-purple-600 mr-3" />
                        <span className="text-gray-600">Loading assessment details...</span>
                      </div>
                    ) : (
                      renderAssessmentDetails(result.id, resultAssessments)
                    )}
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