'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  Target,
  ChevronRight,
  BookOpen,
  BarChart3,
  Brain,
  Inbox,
  TrendingUp as TrendIcon,
  Users
} from 'lucide-react'

interface AssignedAssessment {
  id: string
  toolName: string
  toolId: string
  toolPath: string
  description: string
  estimatedTime: string
  campaignName: string
  campaignCode?: string
  inviteCode?: string
  dueDate?: string
  status?: string
  completedAt?: string
}

interface CompletedAssessment {
  id: string
  toolId: string
  toolName: string
  status: string
  completedAt: string | null
  scores: any
  summary: string | null
  shareId: string | null
  pdfUrl: string | null
  inviteCode: string
  userEmail: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUser()
  const [assignedAssessments, setAssignedAssessments] = useState<AssignedAssessment[]>([])
  const [completedAssessments, setCompletedAssessments] = useState<CompletedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    // Fetch user profile and assigned assessments
    const fetchData = async () => {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress
        if (!email) {
          setLoading(false)
          return
        }

        // Fetch user profile
        const profileResponse = await fetch('/api/user/profile')
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          setUserProfile(profileData.profile)
          
          // Check if onboarding is complete, redirect if not
          if (profileData.profile && profileData.profile.onboardingComplete === false) {
            router.push('/dashboard/member/start/onboarding')
            return
          }
        }

        // Fetch active campaigns assigned to this user
        const campaignsResponse = await fetch(`/api/campaigns/assigned?email=${encodeURIComponent(email)}`)
        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json()
          
          // Transform and separate campaign data
          const allAssessments = campaignsData.campaigns?.map((campaign: any) => ({
            id: campaign.id,
            toolName: campaign.toolName || 'Assessment',
            toolId: campaign.toolId || '',
            toolPath: campaign.toolPath || '',
            description: campaign.description || 'Complete this assessment to help us understand your needs',
            estimatedTime: '15 min',
            campaignName: campaign.name,
            campaignCode: campaign.campaignCode || '',
            inviteCode: campaign.inviteCode || '',
            dueDate: campaign.endDate,
            status: campaign.status,
            completedAt: campaign.completedAt
          })) || []
          
          // Get only pending assessments
          const pending = allAssessments.filter((assessment: any) => 
            assessment.status !== 'COMPLETED'
          )
          
          setAssignedAssessments(pending)
        }
        
        // Fetch completed assessments
        const assessmentsResponse = await fetch('/api/user/assessments')
        if (assessmentsResponse.ok) {
          const assessmentsData = await assessmentsResponse.json()
          setCompletedAssessments(assessmentsData.assessments || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-white/60">
            Your personalized growth journey continues here
          </p>
        </div>

        {/* Next Up Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Next Up
            </h2>
          </div>
          
          {loading ? (
            // Loading state
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 animate-pulse">
                  <div className="h-32 bg-white/5 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (userProfile && userProfile.onboardingComplete === false) || assignedAssessments.length > 0 ? (
            // Show onboarding card and/or assigned assessments
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Onboarding Card - Shows first if not completed */}
              {userProfile && userProfile.onboardingComplete === false && (
                <div 
                  onClick={() => router.push('/dashboard/member/start/onboarding')}
                  className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-400/30 hover:border-purple-400/50 transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs text-purple-300 bg-purple-400/20 px-2 py-1 rounded-full font-semibold">
                        Setup Required
                      </span>
                    </div>
                    <h3 className="text-white font-semibold mb-1">
                      Complete Your Profile
                    </h3>
                    <p className="text-white/70 text-sm mb-3">
                      Set up your team and profile to unlock personalized insights and recommendations
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-300 font-medium">2 minutes</span>
                      <ChevronRight className="w-4 h-4 text-purple-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Assigned Assessments */}
              {assignedAssessments.map((assessment) => (
                <div 
                  key={assessment.id}
                  onClick={() => {
                    // Build URL based on whether we have campaign/invite codes
                    let targetUrl = ''
                    
                    if (assessment.campaignCode) {
                      // Use the campaign assessment URL with proper encoding
                      targetUrl = `/assessment/${encodeURIComponent(assessment.campaignCode)}`
                    } else {
                      // Fallback to direct tool path
                      targetUrl = assessment.toolPath || `/tools/${assessment.toolId}`
                    }
                    
                    if (targetUrl) {
                      const params = new URLSearchParams()
                      
                      // Add invite code if available
                      if (assessment.inviteCode) {
                        params.set('invite', assessment.inviteCode)
                      }
                      
                      // Add context parameters for navigation
                      params.set('context', 'member-dashboard')
                      params.set('returnUrl', '/dashboard/member/start/dashboard')
                      
                      // Add user profile data as query parameters
                      const userEmail = user?.emailAddresses?.[0]?.emailAddress
                      
                      if (user?.firstName || userProfile?.firstName) {
                        const fullName = `${user?.firstName || userProfile?.firstName || ''} ${user?.lastName || userProfile?.lastName || ''}`.trim()
                        if (fullName) {
                          params.set('name', fullName)
                        }
                      }
                      if (userEmail) {
                        params.set('email', userEmail)
                      }
                      if (userProfile?.department) {
                        params.set('department', userProfile.department)
                      }
                      if (userProfile?.teamSize) {
                        params.set('teamSize', String(userProfile.teamSize))
                      }
                      
                      // Build the complete URL
                      const fullUrl = `${window.location.origin}${targetUrl}?${params.toString()}`
                      
                      // Debug: Log the URL being opened
                      console.log('[Member Dashboard] Opening assessment URL:', fullUrl)
                      console.log('[Member Dashboard] Parameters:', Array.from(params.entries()))
                      
                      // Open in new tab with full URL
                      window.open(fullUrl, '_blank')
                      return
                    }
                    
                    // Fallback if no URL could be built
                    console.error('[Member Dashboard] Could not build assessment URL')
                  }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs text-orange-400 bg-orange-400/20 px-2 py-1 rounded-full">
                      Assigned
                    </span>
                  </div>
                  <h3 className="text-white font-semibold mb-1">
                    {assessment.toolName}
                  </h3>
                  <p className="text-white/60 text-sm mb-3 line-clamp-2">
                    {assessment.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/40">{assessment.estimatedTime}</span>
                    <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty state
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10 text-center">
              <Inbox className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-white/70 font-medium mb-2">No tasks yet</h3>
              <p className="text-white/50 text-sm max-w-md mx-auto">
                When your team leader assigns assessments or schedules activities, they'll appear here
              </p>
            </div>
          )}
        </div>

        {/* Progress and Momentum Section */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <TrendIcon className="w-5 h-5 text-green-400" />
              Progress and Momentum
            </h2>
          </div>
          
          {completedAssessments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Assessments Completed Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Assessments Completed</p>
                    <p className="text-2xl font-bold text-white">{completedAssessments.length}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {completedAssessments.slice(0, 3).map((assessment) => (
                    <div key={assessment.id} className="text-xs">
                      <p className="text-white/70 font-medium">{assessment.toolName}</p>
                      <p className="text-white/40">
                        {assessment.completedAt ? new Date(assessment.completedAt).toLocaleDateString() : 'In progress'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Growth Score Card (placeholder for now) */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <TrendIcon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">Growth Score</p>
                    <p className="text-2xl font-bold text-white">-</p>
                  </div>
                </div>
                <p className="text-white/50 text-xs">
                  Complete more assessments to calculate your growth score
                </p>
              </div>
              
              {/* Recent Activity Card */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm">This Week</p>
                    <p className="text-2xl font-bold text-white">
                      {completedAssessments.filter(a => {
                        if (!a.completedAt) return false
                        const completed = new Date(a.completedAt)
                        const weekAgo = new Date()
                        weekAgo.setDate(weekAgo.getDate() - 7)
                        return completed > weekAgo
                      }).length}
                    </p>
                  </div>
                </div>
                <p className="text-white/50 text-xs">
                  Assessments completed in the last 7 days
                </p>
              </div>
            </div>
          ) : (
            /* Empty state for stats */
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white/30" />
                </div>
                <div>
                  <h3 className="text-white/70 font-medium mb-2">Your metrics will appear here</h3>
                  <p className="text-white/50 text-sm">
                    As you complete assessments and engage with your team, we'll track your growth score, 
                    learning streak, and other key performance indicators to help you visualize your progress.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Your Learning Path */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Your Learning Path
          </h2>
          
          {/* Empty state for learning path */}
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5 text-white/30" />
            </div>
            <p className="text-white/50 text-sm text-center">
              Your personalized learning journey will be created based on your assessment results
            </p>
          </div>
        </div>
      </div>
  )
}