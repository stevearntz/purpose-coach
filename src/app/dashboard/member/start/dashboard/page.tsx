'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
  CheckCircle,
  Clock,
  TrendingUp,
  Award,
  Target,
  Users,
  Calendar,
  ChevronRight,
  BookOpen,
  MessageCircle,
  Flame,
  Star,
  Activity,
  BarChart3,
  Brain,
  Heart,
  Zap,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Inbox,
  TrendingUp as TrendIcon,
  Info
} from 'lucide-react'

interface AssignedAssessment {
  id: string
  toolName: string
  toolId: string
  description: string
  estimatedTime: string
  campaignName: string
  dueDate?: string
  inviteUrl?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUser()
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [assignedAssessments, setAssignedAssessments] = useState<AssignedAssessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch assigned assessments from campaigns
    const fetchAssignedAssessments = async () => {
      try {
        const email = user?.emailAddresses?.[0]?.emailAddress
        if (!email) {
          setLoading(false)
          return
        }

        // Fetch active campaigns assigned to this user
        const response = await fetch(`/api/campaigns/assigned?email=${encodeURIComponent(email)}`)
        if (response.ok) {
          const data = await response.json()
          
          // Transform campaign data into assessment format
          const assessments = data.campaigns?.map((campaign: any) => ({
            id: campaign.id,
            toolName: campaign.toolName || 'Assessment',
            toolId: campaign.toolId || '',
            description: campaign.description || 'Complete this assessment to help us understand your needs',
            estimatedTime: '15 min',
            campaignName: campaign.name,
            dueDate: campaign.endDate,
            inviteUrl: campaign.inviteUrl
          })) || []
          
          setAssignedAssessments(assessments)
        }
      } catch (error) {
        console.error('Error fetching assigned assessments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedAssessments()
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
          ) : assignedAssessments.length > 0 ? (
            // Show assigned assessments
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedAssessments.map((assessment) => (
                <div 
                  key={assessment.id}
                  onClick={() => {
                    // If there's an invite URL, use that (it includes campaign parameters)
                    if (assessment.inviteUrl) {
                      // Extract the path from the full URL
                      try {
                        const url = new URL(assessment.inviteUrl)
                        router.push(url.pathname + url.search)
                      } catch {
                        // If URL parsing fails, try as relative path
                        router.push(assessment.inviteUrl)
                      }
                    } else if (assessment.toolId) {
                      // Fallback to tool ID
                      router.push(`/tools/${assessment.toolId}`)
                    }
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
          
          {/* Empty state for stats */}
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
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-400" />
                Recent Activity
              </h2>
              <select 
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none focus:border-purple-400"
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            {/* Empty state for recent activity */}
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white/30" />
              </div>
              <h3 className="text-white/70 font-medium mb-2">No activity yet</h3>
              <p className="text-white/50 text-sm text-center max-w-xs">
                Your completed assessments, attended sessions, and achievements will show up here
              </p>
            </div>
          </div>

          {/* Insights & Recommendations */}
          <div className="space-y-4">
            {/* Quick Insights */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Insights
              </h2>
              
              {/* Empty state for insights */}
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <Info className="w-5 h-5 text-white/30" />
                </div>
                <p className="text-white/50 text-sm text-center">
                  Insights about your progress and team dynamics will appear here as you engage with the platform
                </p>
              </div>
            </div>

            {/* Learning Path */}
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
        </div>
      </div>
  )
}