'use client'

import React from 'react'
import { Users, Calendar, TrendingUp, ChevronDown, ChevronUp, User, Mail, Clock, CheckCircle } from 'lucide-react'

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

  // Calculate team statistics
  const totalAssessments = teamResults.length
  const uniqueMembers = teamMemberResults.length
  const completionRate = uniqueMembers > 0 ? Math.round((teamMemberResults.filter(m => m.completedAssessments > 0).length / uniqueMembers) * 100) : 0

  if (teamMemberResults.length === 0) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-white/30" />
        </div>
        <h3 className="text-white/70 font-medium mb-2 text-lg">
          No team results yet
        </h3>
        <p className="text-white/50 max-w-md mx-auto">
          When team members complete assessments through your shared links, their results will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Individual Results */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Individual Results</h2>
        
        <div className="space-y-3">
          {teamMemberResults.map((member) => {
            const isExpanded = expandedMembers.has(member.id)
            
            return (
              <div key={member.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
                {/* Member Header */}
                <div
                  onClick={() => toggleMemberExpansion(member.id)}
                  className="p-4 cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{member.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {member.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {member.completedAssessments} completed
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(member.lastActivity)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-white/60">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-white/5 p-4">
                    <div className="space-y-3">
                      {member.results.map((result) => (
                        <div key={result.id} className="bg-white/10 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-white font-medium">{result.toolName}</h4>
                            <span className="text-white/60 text-sm">
                              {formatDate(result.completedAt)}
                            </span>
                          </div>
                          
                          {/* Quick summary of key responses */}
                          <div className="space-y-2 text-sm">
                            {result.responses?.challenges && result.responses.challenges.length > 0 && (
                              <div>
                                <span className="text-white/60">Top Challenges: </span>
                                <span className="text-white/80">
                                  {result.responses.challenges[0]?.subcategories?.slice(0, 2).join(', ')}
                                </span>
                              </div>
                            )}
                            {result.responses?.skillsToGrow && result.responses.skillsToGrow.length > 0 && (
                              <div>
                                <span className="text-white/60">Skills to Develop: </span>
                                <span className="text-white/80">
                                  {result.responses.skillsToGrow.slice(0, 2).join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {result.pdfUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(result.pdfUrl, '_blank')
                              }}
                              className="mt-3 text-purple-400 hover:text-purple-300 text-sm"
                            >
                              View Full Report →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}