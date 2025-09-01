'use client'

import { useUser } from '@clerk/nextjs'
import { BarChart3, FileText, Calendar, TrendingUp, Clock, ChevronDown, ChevronUp, Brain, Target, Users, Award, Download, ExternalLink, AlertTriangle, Sparkles, HeartHandshake, Flag, Lightbulb } from 'lucide-react'
import { useState, useEffect } from 'react'

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

export default function MemberResultsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<AssessmentResult[]>([])
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress
        if (!email) {
          setLoading(false)
          return
        }

        const response = await fetch(`/api/assessments/results?email=${encodeURIComponent(email)}`)
        if (response.ok) {
          const data = await response.json()
          setResults(data.results || [])
        }
      } catch (error) {
        console.error('Error fetching assessment results:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchResults()
    }
  }, [user])

  const toggleResultExpansion = (resultId: string) => {
    setExpandedResults(prev => {
      const newSet = new Set(prev)
      if (newSet.has(resultId)) {
        newSet.delete(resultId)
      } else {
        newSet.add(resultId)
      }
      return newSet
    })
  }

  const getToolIcon = (toolId: string) => {
    switch (toolId) {
      case 'people-leader-needs':
        return <Brain className="w-5 h-5 text-purple-400" />
      case 'burnout-assessment':
        return <Target className="w-5 h-5 text-orange-400" />
      case 'team-charter':
        return <Users className="w-5 h-5 text-blue-400" />
      default:
        return <Award className="w-5 h-5 text-green-400" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading your results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Your Results</h1>
        <p className="text-white/60">
          View and track your assessment results and progress over time
        </p>
      </div>

      {/* Results Content */}
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => {
            const isExpanded = expandedResults.has(result.id)
            
            return (
              <div
                key={result.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden transition-all"
              >
                {/* Card Header - Clickable */}
                <div
                  onClick={() => toggleResultExpansion(result.id)}
                  className="p-6 cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                        {getToolIcon(result.toolId)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {result.toolName}
                        </h3>
                        <p className="text-white/60 text-sm">
                          Completed {formatDate(result.completedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {result.pdfUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(result.pdfUrl, '_blank')
                          }}
                          className="text-white/60 hover:text-white transition-colors"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          const shareUrl = `${window.location.origin}/${result.toolId}/share/${result.shareId}`
                          navigator.clipboard.writeText(shareUrl)
                        }}
                        className="text-white/60 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                      <div className="text-white/60 transition-transform duration-200">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Content */}
                {isExpanded && (
                  <div className="border-t border-white/10 bg-white/5">
                    <div className="p-6 space-y-6">
                      {/* Debug: Log the data structure */}
                      {console.log('[Results Debug] Full result object:', result)}
                      {console.log('[Results Debug] Responses:', result.responses)}
                      {console.log('[Results Debug] Challenges:', result.responses?.challenges)}
                      {console.log('[Results Debug] Skills:', result.responses?.skillsToGrow)}
                      {console.log('[Results Debug] Support:', result.responses?.supportNeeds)}
                      {console.log('[Results Debug] TeamImpact:', result.responses?.teamImpact)}
                      {console.log('[Results Debug] Context:', result.responses?.additionalContext)}
                      
                      {/* Challenge Areas Section - ALWAYS SHOW */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          Challenge Areas
                        </h4>
                        <div className="space-y-4">
                          {result.responses?.challenges ? (
                            <>
                              {/* Individual Performance subsection */}
                              {result.responses.challenges.map((category: any) => {
                              if (category.name === 'Individual Performance') {
                                return (
                                  <div key="individual">
                                    <h5 className="text-white/90 font-medium mb-2">Individual Performance</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {category.subcategories?.map((sub: string, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                                          {sub}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })}
                            
                            {/* Leadership Skills subsection */}
                            {result.responses.challenges.map((category: any) => {
                              if (category.name === 'Leadership Skills') {
                                return (
                                  <div key="leadership">
                                    <h5 className="text-white/90 font-medium mb-2">Leadership Skills</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {category.subcategories?.map((sub: string, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                                          {sub}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })}
                            
                            {/* Compliance & Risk subsection */}
                            {result.responses.challenges.map((category: any) => {
                              if (category.name === 'Compliance & Risk') {
                                return (
                                  <div key="compliance">
                                    <h5 className="text-white/90 font-medium mb-2">Compliance & Risk</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {category.subcategories?.map((sub: string, index: number) => (
                                        <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                                          {sub}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )
                              }
                              return null
                            })}
                            </>
                          ) : (
                            <p className="text-white/50 text-sm">No challenge data available</p>
                          )}
                        </div>
                      </div>

                      {/* Skills to Develop Section - ALWAYS SHOW */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          Skills to Develop
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.responses?.skillsToGrow ? (
                            result.responses.skillsToGrow.map((skill: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <p className="text-white/50 text-sm">No skills data available</p>
                          )}
                        </div>
                      </div>

                      {/* Support Needs Section - ALWAYS SHOW */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <HeartHandshake className="w-5 h-5 text-pink-400" />
                          Support Needs
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.responses?.supportNeeds ? (
                            result.responses.supportNeeds.map((need: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                                {need}
                              </span>
                            ))
                          ) : (
                            <p className="text-white/50 text-sm">No support needs data available</p>
                          )}
                        </div>
                      </div>

                      {/* Focus Areas Section - ALWAYS SHOW */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Flag className="w-5 h-5 text-blue-400" />
                          Focus Areas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {result.responses?.teamImpact ? (
                            result.responses.teamImpact.map((area: string, index: number) => (
                              <span key={index} className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                                {area}
                              </span>
                            ))
                          ) : (
                            <p className="text-white/50 text-sm">No focus areas data available</p>
                          )}
                        </div>
                      </div>

                      {/* Additional Insights Section - ALWAYS SHOW */}
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-400" />
                          Additional Insights
                        </h4>
                        <div className="bg-white/10 rounded-lg p-4">
                          {result.responses?.additionalContext ? (
                            <p className="text-white/80 leading-relaxed italic">
                              "{result.responses.additionalContext}"
                            </p>
                          ) : (
                            <p className="text-white/50 text-sm">No additional insights available</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-white/30" />
          </div>
          <h3 className="text-white/70 font-medium mb-2 text-lg">No results yet</h3>
          <p className="text-white/50 max-w-md mx-auto mb-6">
            Once you complete assessments, your results and insights will appear here. 
            You can track your progress and view detailed reports.
          </p>
          
          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <FileText className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-white/80 text-sm font-medium">Assessment Reports</p>
                <p className="text-white/50 text-xs">Detailed insights and recommendations</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-white/80 text-sm font-medium">Progress Tracking</p>
                <p className="text-white/50 text-xs">See how you're improving over time</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-white/80 text-sm font-medium">History</p>
                <p className="text-white/50 text-xs">Complete timeline of activities</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}