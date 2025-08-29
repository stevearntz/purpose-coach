'use client'

import { useState } from 'react'
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
  ArrowDown
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { user } = useUser()
  const [selectedTimeframe, setSelectedTimeframe] = useState('week')

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
            <button className="text-purple-400 hover:text-purple-300 text-sm">
              View all tasks →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Assigned Assessment */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-orange-400 bg-orange-400/20 px-2 py-1 rounded-full">
                  Assigned
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">
                People Leader Needs Assessment
              </h3>
              <p className="text-white/60 text-sm mb-3">
                Identify your leadership strengths and growth areas
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">15 min</span>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Upcoming Campfire */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-purple-400 bg-purple-400/20 px-2 py-1 rounded-full">
                  Tomorrow
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">
                1-on-1 Mastery Campfire
              </h3>
              <p className="text-white/60 text-sm mb-3">
                Learn effective techniques for meaningful 1-on-1s
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">2:00 PM EST</span>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Recommended Tool */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded-full">
                  Recommended
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">
                Values Explorer
              </h3>
              <p className="text-white/60 text-sm mb-3">
                Discover and align your core values with your work
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/40">10 min</span>
                <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Growth Score</span>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">87</span>
              <span className="text-xs text-green-400 flex items-center">
                <ArrowUp className="w-3 h-3" />
                12%
              </span>
            </div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[87%] bg-gradient-to-r from-green-400 to-emerald-600" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Tools Completed</span>
              <CheckCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">12</span>
              <span className="text-xs text-white/40">/ 20</span>
            </div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[60%] bg-gradient-to-r from-purple-400 to-pink-600" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Team Engagement</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">94%</span>
              <span className="text-xs text-green-400 flex items-center">
                <ArrowUp className="w-3 h-3" />
                5%
              </span>
            </div>
            <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[94%] bg-gradient-to-r from-blue-400 to-cyan-600" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/60 text-sm">Learning Streak</span>
              <Flame className="w-4 h-4 text-orange-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white">7</span>
              <span className="text-xs text-white/40">days</span>
            </div>
            <div className="mt-2 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex-1 h-1 bg-gradient-to-r from-orange-400 to-red-600 rounded-full" />
              ))}
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
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">Completed <span className="font-semibold">Purpose Coach</span></p>
                  <p className="text-white/40 text-xs">2 hours ago</p>
                </div>
                <span className="text-xs text-green-400 bg-green-400/20 px-2 py-1 rounded-full">
                  +10 pts
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">Attended <span className="font-semibold">Leadership 101 Campfire</span></p>
                  <p className="text-white/40 text-xs">Yesterday</p>
                </div>
                <span className="text-xs text-purple-400 bg-purple-400/20 px-2 py-1 rounded-full">
                  +15 pts
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-600 flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">Team completed <span className="font-semibold">Trust Audit</span></p>
                  <p className="text-white/40 text-xs">3 days ago</p>
                </div>
                <span className="text-xs text-blue-400 bg-blue-400/20 px-2 py-1 rounded-full">
                  +25 pts
                </span>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">Earned <span className="font-semibold">Quick Learner</span> badge</p>
                  <p className="text-white/40 text-xs">5 days ago</p>
                </div>
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Insights & Recommendations */}
          <div className="space-y-4">
            {/* Insights */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-400" />
                Quick Insights
              </h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Team morale trending up</p>
                    <p className="text-white/60 text-xs">Based on recent engagement scores</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">3 tools away from milestone</p>
                    <p className="text-white/60 text-xs">Complete to unlock Team Champion badge</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-purple-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Monthly review coming up</p>
                    <p className="text-white/60 text-xs">Schedule your team retrospective</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learning Path */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Your Learning Path
              </h2>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-600 h-2 rounded-full" style={{width: '35%'}} />
                  </div>
                  <span className="text-xs text-white/60 whitespace-nowrap">7/20</span>
                </div>
                <p className="text-white/60 text-xs">Leadership Fundamentals</p>
              </div>
              
              <button className="mt-4 w-full py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-cyan-700 transition-all">
                Continue Path
              </button>
            </div>
          </div>
        </div>
      </div>
  )
}