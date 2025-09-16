'use client'

import React from 'react'
import { ChevronDown, ChevronUp, Mail, CheckCircle, Clock } from 'lucide-react'
import { mapPriorityToFullText } from '@/utils/priorityMapping'

interface AssessmentResult {
  id: string
  toolId: string
  toolName: string
  completedAt: string
  shareId: string
  user: {
    email: string
    name: string
    company: string
  }
  responses: any
  scores: any
  summary: any
  insights: any
  recommendations: any
  userProfile: any
  pdfUrl?: string
}

interface TeamMemberResult {
  id: string
  name: string
  email: string
  completedAssessments: number
  lastActivity: string
  results: AssessmentResult[]
}

interface TeamResultsViewProps {
  teamResults: AssessmentResult[]
  teamMemberResults: TeamMemberResult[]
  expandedMembers: Set<string>
  toggleMemberExpansion: (memberId: string) => void
}

export default function TeamResultsView({
  teamResults,
  teamMemberResults,
  expandedMembers,
  toggleMemberExpansion
}: TeamResultsViewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(dateString)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Individual Results</h2>
      
      {teamMemberResults.map((member) => {
        const isExpanded = expandedMembers.has(member.id)
        const firstResult = member.results[0]
        
        return (
          <div key={member.id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            {/* Member Header - Clickable */}
            <div
              onClick={() => toggleMemberExpansion(member.id)}
              className="p-6 cursor-pointer hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </span>
                  </div>
                  
                  {/* Member Info */}
                  <div>
                    <h3 className="text-white font-semibold text-lg">{member.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-white/60 mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {member.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        Completed
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(member.lastActivity)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Expand Icon and Date */}
                <div className="flex items-center gap-4">
                  <span className="text-white/60 text-sm">
                    {formatDate(member.lastActivity)}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-white/40" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/40" />
                  )}
                </div>
              </div>
              
              {/* Assessment Type Badge */}
              <div className="mt-4">
                <span className="text-sm text-white/60">
                  # {firstResult?.toolName || 'Assessment'}
                </span>
              </div>
            </div>
            
            {/* Expanded Content */}
            {isExpanded && firstResult && (
              <div className="px-6 pb-6 border-t border-white/10">
                <div className="mt-6 space-y-6 bg-white/5 rounded-lg p-6">
                  {/* Challenge Areas */}
                  {firstResult.responses?.categoryDetails && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Challenge Areas</h3>
                      <div className="space-y-3">
                        {Object.entries(firstResult.responses.categoryDetails).map(([category, details]: [string, any]) => {
                          const categoryNames: Record<string, string> = {
                            'performance': 'Individual Performance',
                            'leadership': 'Leadership Skills',
                            'compliance': 'Compliance & Risk'
                          }
                          const categoryName = categoryNames[category.toLowerCase()] || category
                          
                          return (
                            <div key={category} className="border-l-4 border-red-400 pl-4">
                              <h4 className="font-medium text-white/90 mb-2">{categoryName}</h4>
                              <div className="flex flex-wrap gap-2">
                                {details.challenges?.map((challenge: string) => (
                                  <span key={challenge} className="px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-sm">
                                    {challenge}
                                  </span>
                                ))}
                              </div>
                              {details.additionalContext && (
                                <p className="text-sm text-white/60 italic mt-2">
                                  "{details.additionalContext}"
                                </p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Skills to Develop */}
                  {firstResult.responses?.skillGaps && firstResult.responses.skillGaps.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Skills to Develop</h3>
                      <div className="flex flex-wrap gap-2">
                        {firstResult.responses.skillGaps.map((skill: string) => (
                          <span key={skill} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Support Needs */}
                  {firstResult.responses?.supportNeeds && firstResult.responses.supportNeeds.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Support Needs</h3>
                      <div className="flex flex-wrap gap-2">
                        {firstResult.responses.supportNeeds.map((need: string) => (
                          <span key={need} className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                            {need}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Focus Areas */}
                  {firstResult.responses?.selectedPriorities && firstResult.responses.selectedPriorities.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Focus Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {firstResult.responses.selectedPriorities.map((priority: string) => {
                          const displayPriority = mapPriorityToFullText(priority)
                          
                          return (
                            <span key={priority} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">
                              {displayPriority}
                            </span>
                          )
                        })}
                      </div>
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
}