'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import {
  CheckCircle,
  Clock,
  Activity,
  MessageCircle,
  Award,
  Users,
  TrendingUp,
  Calendar,
  Filter
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

export default function FeedPage() {
  const { user } = useUser()
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')
  const [completedAssessments, setCompletedAssessments] = useState<AssignedAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    // Fetch user's activity data
    const fetchData = async () => {
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
          
          // Transform campaign data and filter completed ones
          const allAssessments = data.campaigns?.map((campaign: any) => ({
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
          
          // Get completed assessments
          const completed = allAssessments.filter((assessment: any) => 
            assessment.status === 'COMPLETED'
          )
          
          setCompletedAssessments(completed)
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Activity Feed
        </h1>
        <p className="text-white/60">
          Track your progress and stay updated with your team's activities
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
          >
            <option value="all">All Activity</option>
            <option value="assessments">Assessments</option>
            <option value="achievements">Achievements</option>
            <option value="team">Team Updates</option>
          </select>
          
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white hover:bg-white/15 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Activity Feed */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        </div>
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : completedAssessments.length > 0 ? (
          <div className="space-y-3">
            {completedAssessments.map((assessment) => (
              <div key={assessment.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">
                      {assessment.toolName}
                    </h3>
                    <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full flex-shrink-0">
                      Completed
                    </span>
                  </div>
                  <p className="text-white/60 text-sm">
                    {assessment.campaignName}
                  </p>
                  {assessment.completedAt && (
                    <p className="text-white/40 text-xs mt-1">
                      Completed {new Date(assessment.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            
            {/* Sample future activity items */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/40 text-sm mb-4">Coming Soon</p>
              
              <div className="space-y-3 opacity-50">
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">Team Member Updates</h3>
                    <p className="text-white/60 text-sm">See when team members complete assessments</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">Achievements & Milestones</h3>
                    <p className="text-white/60 text-sm">Celebrate your progress and earned badges</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">Discussion Threads</h3>
                    <p className="text-white/60 text-sm">Engage with team conversations and insights</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white/30" />
            </div>
            <h3 className="text-white/70 font-medium mb-2">No activity yet</h3>
            <p className="text-white/50 text-sm text-center max-w-xs">
              Your completed assessments, attended sessions, and achievements will show up here
            </p>
          </div>
        )}
      </div>
    </div>
  )
}