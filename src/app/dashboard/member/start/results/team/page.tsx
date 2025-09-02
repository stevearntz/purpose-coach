'use client'

import { useUser } from '@clerk/nextjs'
import { Users, UserCheck } from 'lucide-react'
import { useState, useEffect } from 'react'
import TeamResultsView from '@/components/TeamResultsView'

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

export default function TeamResultsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [teamResults, setTeamResults] = useState<AssessmentResult[]>([])
  const [teamMemberResults, setTeamMemberResults] = useState<TeamMemberResult[]>([])
  const [expandedMembers, setExpandedMembers] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<'shared' | 'individuals'>('shared')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch team results (results from team share links)
        const teamResponse = await fetch('/api/team/shared-results', {
          credentials: 'include'
        })
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeamResults(teamData.results || [])
          
          // Group results by team member for Individuals tab
          const memberMap = new Map<string, TeamMemberResult>()
          teamData.results?.forEach((result: AssessmentResult) => {
            const memberEmail = result.user.email
            if (!memberMap.has(memberEmail)) {
              memberMap.set(memberEmail, {
                id: memberEmail,
                name: result.user.name,
                email: memberEmail,
                completedAssessments: 0,
                lastActivity: result.completedAt,
                results: []
              })
            }
            const member = memberMap.get(memberEmail)!
            member.results.push(result)
            member.completedAssessments = member.results.length
            if (new Date(result.completedAt) > new Date(member.lastActivity)) {
              member.lastActivity = result.completedAt
            }
          })
          setTeamMemberResults(Array.from(memberMap.values()))
        }
      } catch (error) {
        console.error('Error fetching team results:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchResults()
    }
  }, [user])
  
  const toggleMemberExpansion = (memberId: string) => {
    setExpandedMembers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(memberId)) {
        newSet.delete(memberId)
      } else {
        newSet.add(memberId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading team results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Team Results</h1>
        <p className="text-white/60">
          Monitor your team's assessment results and insights
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'shared'
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          Shared
        </button>
        <button
          onClick={() => setActiveTab('individuals')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'individuals'
              ? 'bg-white/20 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          Individuals
        </button>
      </div>

      {activeTab === 'shared' ? (
        /* Shared Tab - Show tool shares and aggregate results */
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Shared Assessments</h2>
            <p className="text-white/60 mb-6">
              Track the assessments you've shared with your team and their overall completion
            </p>
            
            {/* Placeholder for shared assessment campaigns - will be populated when sharing is implemented */}
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/60">No assessments shared yet</p>
              <p className="text-white/40 text-sm mt-1">
                Go to the Tools page to share assessments with your team
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Individuals Tab - Show individual member results or empty state */
        teamMemberResults.length > 0 ? (
          <TeamResultsView 
            teamResults={teamResults}
            teamMemberResults={teamMemberResults}
            expandedMembers={expandedMembers}
            toggleMemberExpansion={toggleMemberExpansion}
          />
        ) : (
          /* Empty state for Individuals tab */
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
              <UserCheck className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-white/70 font-medium mb-2 text-lg">No individual results yet</h3>
            <p className="text-white/50 max-w-md mx-auto">
              When team members complete assessments through your shared links, their individual results will appear here.
            </p>
          </div>
        )
      )}
    </div>
  )
}