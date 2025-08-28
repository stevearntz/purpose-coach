'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, Mail, Calendar, Building2, ChevronDown, ChevronUp,
  AlertCircle, Target, Shield, Heart, Brain, MessageSquare,
  Clock, CheckCircle, TrendingUp, Users, Hash, Rocket
} from 'lucide-react'

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
  
  // Assessment-specific data
  challengeAreas?: {
    category: string
    items: string[]
    details?: string
  }[]
  
  skillsToDevlop?: string[]
  supportNeeds?: string[]
  focusAreas?: string[]
  
  additionalInsights?: string
  aiFollowUp?: string
  
  // Scores or metrics
  completionTime?: number
  overallScore?: number
  categoryScores?: Record<string, number>
}

interface Props {
  results: IndividualResult[]
  loading?: boolean
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

const categoryColors: Record<string, string> = {
  'Individual Performance': 'bg-red-100 text-red-700',
  'Team Dynamics': 'bg-blue-100 text-blue-700',
  'Leadership Skills': 'bg-purple-100 text-purple-700',
  'Communication': 'bg-green-100 text-green-700',
  'Change & Alignment': 'bg-amber-100 text-amber-700',
  'Systems & Operations': 'bg-indigo-100 text-indigo-700',
  'Cross-functional Collaboration': 'bg-pink-100 text-pink-700'
}

export default function IndividualResultsView({ results, loading = false }: Props) {
  const router = useRouter()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAssessment, setFilterAssessment] = useState<string>('all')
  
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
  
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
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
          const StatusIcon = statusConfig[result.status].icon
          const isExpanded = expandedId === result.id
          const completionTime = getCompletionTime(result.startedAt, result.completedAt)
          
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
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[result.status].color}`}>
                        <StatusIcon className="w-3 h-3 inline mr-1" />
                        {statusConfig[result.status].label}
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
                    
                    {/* Summary Badges (only for completed assessments) */}
                    {result.status === 'completed' && (
                      <div className="flex flex-wrap gap-3">
                        {result.challengeAreas && result.challengeAreas.length > 0 && (
                          <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-sm text-gray-700">
                              {result.challengeAreas.length} challenge {result.challengeAreas.length === 1 ? 'area' : 'areas'}
                            </span>
                          </div>
                        )}
                        {result.skillsToDevlop && result.skillsToDevlop.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-700">
                              {result.skillsToDevlop.length} skills to develop
                            </span>
                          </div>
                        )}
                        {result.supportNeeds && result.supportNeeds.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-amber-600" />
                            <span className="text-sm text-gray-700">
                              {result.supportNeeds.length} support needs
                            </span>
                          </div>
                        )}
                        {completionTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">
                              Completed in {completionTime}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
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
                  <div className="mt-4 space-y-6">
                    {/* Challenge Areas */}
                    {result.challengeAreas && result.challengeAreas.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Challenge Areas</h4>
                        <div className="space-y-3">
                          {result.challengeAreas.map((area, idx) => (
                            <div key={idx} className="pl-4 border-l-2 border-red-200">
                              <p className="font-medium text-gray-800 mb-2">
                                {area.category}
                              </p>
                              <div className="flex flex-wrap gap-2 mb-2">
                                {area.items.map((item, itemIdx) => (
                                  <span 
                                    key={itemIdx}
                                    className={`px-3 py-1 rounded-full text-sm ${
                                      categoryColors[area.category] || 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {item}
                                  </span>
                                ))}
                              </div>
                              {area.details && (
                                <p className="text-sm text-gray-600 italic mt-2">{area.details}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Skills to Develop */}
                    {result.skillsToDevlop && result.skillsToDevlop.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Skills to Develop</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.skillsToDevlop.map((skill, idx) => (
                            <span 
                              key={idx}
                              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Support Needs */}
                    {result.supportNeeds && result.supportNeeds.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Immediate Support Needs</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.supportNeeds.map((need, idx) => (
                            <span 
                              key={idx}
                              className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium"
                            >
                              {need}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Focus Areas */}
                    {result.focusAreas && result.focusAreas.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Focus Areas</h4>
                        <div className="flex flex-wrap gap-2">
                          {result.focusAreas.map((area, idx) => (
                            <span 
                              key={idx}
                              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Additional Insights */}
                    {result.additionalInsights && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Additional Insights</h4>
                        <p className="text-gray-700 leading-relaxed">{result.additionalInsights}</p>
                        
                        {result.aiFollowUp && (
                          <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">AI Analysis:</span> {result.aiFollowUp}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                        View Full Report
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Export PDF
                      </button>
                      <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                        Send Follow-up
                      </button>
                    </div>
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