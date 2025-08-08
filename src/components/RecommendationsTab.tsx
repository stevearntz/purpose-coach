'use client'

import React, { useState } from 'react'
import { 
  TrendingUp, AlertTriangle, Users, Target, Brain, Shield, 
  Heart, ArrowRight, Sparkles, ChevronRight, Award,
  BarChart3, Zap, BookOpen, UserPlus, Send
} from 'lucide-react'

// Simulated recommendations data
const recommendations = [
  {
    id: '1',
    priority: 'high',
    category: 'trust',
    title: 'Critical Trust Gap Identified',
    description: 'Analysis of recent assessments shows 68% of your team members are experiencing trust challenges in cross-functional collaboration.',
    affectedUsers: 12,
    totalUsers: 18,
    insights: [
      '8 team members scored below 60% on trust dimensions',
      'Psychological safety is the lowest-scoring area',
      'Remote team members report 23% lower trust scores'
    ],
    recommendedTool: {
      name: 'Trust Audit',
      path: '/trust-audit',
      gradient: 'from-[#FFA62A] to-[#DB4839]',
      reason: 'This tool will help identify specific trust gaps and provide personalized strategies for each team member.'
    },
    suggestedCourses: [
      { name: 'Building Psychological Safety', duration: '2 hours', type: 'workshop' },
      { name: 'Remote Team Trust Building', duration: '90 min', type: 'course' }
    ],
    expectedImpact: 'Teams that complete this assessment typically see 35% improvement in collaboration metrics within 6 weeks.'
  },
  {
    id: '2',
    priority: 'high',
    category: 'burnout',
    title: 'Burnout Risk Alert',
    description: 'Early warning signs indicate 42% of your team is at moderate to high risk of burnout based on recent engagement patterns.',
    affectedUsers: 8,
    totalUsers: 18,
    insights: [
      '5 team members showing high exhaustion scores',
      'Work-life balance decreased 31% over last quarter',
      'Managers reporting 2x higher burnout risk than ICs'
    ],
    recommendedTool: {
      name: 'Burnout Assessment',
      path: '/burnout-assessment',
      gradient: 'from-[#74DEDE] to-[#30B859]',
      reason: 'Provides personalized recovery strategies and helps identify systemic causes of burnout.'
    },
    suggestedCourses: [
      { name: 'Sustainable Performance', duration: '3 hours', type: 'workshop' },
      { name: 'Energy Management Fundamentals', duration: '45 min', type: 'course' },
      { name: 'Manager\'s Guide to Preventing Burnout', duration: '2 hours', type: 'training' }
    ],
    expectedImpact: 'Organizations addressing burnout proactively see 40% reduction in turnover and 25% increase in productivity.'
  },
  {
    id: '3',
    priority: 'medium',
    category: 'change',
    title: 'Change Readiness Opportunity',
    description: 'With upcoming organizational changes, proactive change management assessment could increase success rate by 60%.',
    affectedUsers: 15,
    totalUsers: 18,
    insights: [
      '73% of team hasn\'t received change management training',
      'Previous changes had 45% adoption rate',
      'Senior team members show higher change resistance'
    ],
    recommendedTool: {
      name: 'Change Readiness Assessment',
      path: '/change-readiness-assessment',
      gradient: 'from-[#F595B6] to-[#BF4C74]',
      reason: 'Identifies individual change styles and provides targeted support strategies.'
    },
    suggestedCourses: [
      { name: 'Leading Through Change', duration: '4 hours', type: 'workshop' },
      { name: 'Change Resilience Training', duration: '2 hours', type: 'course' }
    ],
    expectedImpact: 'Teams with change readiness insights adapt 3x faster to organizational transitions.'
  },
  {
    id: '4',
    priority: 'medium',
    category: 'leadership',
    title: 'Leadership Development Gap',
    description: 'New managers on your team would benefit from decision-making frameworks and leadership assessments.',
    affectedUsers: 6,
    totalUsers: 18,
    insights: [
      '4 managers promoted in last 6 months',
      'Decision confidence scores 40% below benchmark',
      'Team feedback indicates need for clearer direction'
    ],
    recommendedTool: {
      name: 'Decision Making Audit',
      path: '/decision-making-audit',
      gradient: 'from-[#6DC7FF] to-[#3C36FF]',
      reason: 'Helps new leaders understand their decision-making patterns and blind spots.'
    },
    suggestedCourses: [
      { name: 'First-Time Manager Bootcamp', duration: '8 hours', type: 'program' },
      { name: 'Strategic Decision Making', duration: '3 hours', type: 'workshop' }
    ],
    expectedImpact: 'Managers with decision frameworks make 50% faster decisions with 30% better outcomes.'
  },
  {
    id: '5',
    priority: 'low',
    category: 'team',
    title: 'Team Alignment Check-In',
    description: 'Quarterly team charter review could strengthen alignment on priorities and working agreements.',
    affectedUsers: 18,
    totalUsers: 18,
    insights: [
      'Last team charter update was 4 months ago',
      '30% of team joined after last alignment session',
      'Goal clarity scores trending downward'
    ],
    recommendedTool: {
      name: 'Team Charter',
      path: '/team-charter',
      gradient: 'from-[#FF6B6B] to-[#4ECDC4]',
      reason: 'Ensures everyone is aligned on team purpose, values, and ways of working.'
    },
    suggestedCourses: [
      { name: 'Team Alignment Workshop', duration: '4 hours', type: 'workshop' }
    ],
    expectedImpact: 'Teams with clear charters report 45% higher engagement and 30% faster project completion.'
  }
]

// Aggregate insights
const aggregateInsights = {
  topChallenges: [
    { name: 'Trust & Psychological Safety', percentage: 68, trend: 'increasing' },
    { name: 'Burnout & Well-being', percentage: 42, trend: 'stable' },
    { name: 'Change Management', percentage: 38, trend: 'decreasing' },
    { name: 'Decision Making', percentage: 33, trend: 'increasing' },
    { name: 'Team Alignment', percentage: 28, trend: 'stable' }
  ],
  teamHealth: {
    score: 72,
    trend: 'improving',
    benchmark: 78
  },
  engagement: {
    assessmentCompletion: 85,
    activeUsers: 15,
    totalUsers: 18
  }
}

export default function RecommendationsTab() {
  const [selectedRecommendation, setSelectedRecommendation] = useState<string | null>(null)
  const [sendingInvites, setSendingInvites] = useState<string | null>(null)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20 border-red-500/30'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30'
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'High Priority'
      case 'medium': return 'Medium Priority'
      case 'low': return 'Low Priority'
      default: return 'Priority'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="w-4 h-4 text-red-400" />
      case 'decreasing': return <TrendingUp className="w-4 h-4 text-green-400 rotate-180" />
      default: return <ArrowRight className="w-4 h-4 text-yellow-400" />
    }
  }

  const handleSendInvites = (recId: string) => {
    setSendingInvites(recId)
    // Simulate sending
    setTimeout(() => {
      setSendingInvites(null)
    }, 2000)
  }

  return (
    <div>
      {/* Header with AI Badge */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI-Powered Recommendations</h2>
            <p className="text-white/70">Personalized insights based on your team's assessment results</p>
          </div>
        </div>
      </div>

      {/* Aggregate Insights Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Team Health Score */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Team Health Score</h3>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex items-end gap-4">
            <div className="text-4xl font-bold text-white">{aggregateInsights.teamHealth.score}</div>
            <div className="flex-1">
              <div className="text-sm text-white/60 mb-2">Benchmark: {aggregateInsights.teamHealth.benchmark}</div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  style={{ width: `${aggregateInsights.teamHealth.score}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-green-400">
            ↑ Improving (was 68 last month)
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Engagement</h3>
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Active Users</span>
              <span className="text-white font-medium">
                {aggregateInsights.engagement.activeUsers}/{aggregateInsights.engagement.totalUsers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Completion Rate</span>
              <span className="text-white font-medium">{aggregateInsights.engagement.assessmentCompletion}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Avg. Response Time</span>
              <span className="text-white font-medium">2.3 days</span>
            </div>
          </div>
        </div>

        {/* Top Challenges */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Challenges</h3>
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
          </div>
          <div className="space-y-2">
            {aggregateInsights.topChallenges.slice(0, 3).map((challenge, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-white/80">{challenge.name}</span>
                  {getTrendIcon(challenge.trend)}
                </div>
                <span className="text-sm font-medium text-white">{challenge.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recommended Actions</h3>
        
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className={`bg-white/5 backdrop-blur-sm rounded-xl border transition-all duration-200 ${
              selectedRecommendation === rec.id 
                ? 'border-purple-500/50 bg-white/10' 
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            {/* Recommendation Header */}
            <div
              className="p-6 cursor-pointer"
              onClick={() => setSelectedRecommendation(
                selectedRecommendation === rec.id ? null : rec.id
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                      {getPriorityLabel(rec.priority)}
                    </span>
                    <span className="text-white/60 text-sm">
                      Affects {rec.affectedUsers} of {rec.totalUsers} users
                    </span>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-white mb-2">{rec.title}</h4>
                  <p className="text-white/70">{rec.description}</p>
                  
                  {/* Quick Insights */}
                  <div className="flex items-center gap-6 mt-4">
                    {rec.insights.slice(0, 2).map((insight, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        <span className="text-sm text-white/60">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <ChevronRight className={`w-5 h-5 text-white/40 transition-transform ${
                  selectedRecommendation === rec.id ? 'rotate-90' : ''
                }`} />
              </div>
            </div>

            {/* Expanded Content */}
            {selectedRecommendation === rec.id && (
              <div className="px-6 pb-6 border-t border-white/10 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recommended Tool */}
                  <div>
                    <h5 className="text-sm font-medium text-white/80 mb-3">Recommended Assessment</h5>
                    <div className={`bg-gradient-to-br ${rec.recommendedTool.gradient} p-4 rounded-lg`}>
                      <h6 className="text-lg font-semibold text-white mb-2">
                        {rec.recommendedTool.name}
                      </h6>
                      <p className="text-white/90 text-sm mb-4">
                        {rec.recommendedTool.reason}
                      </p>
                      <button
                        onClick={() => handleSendInvites(rec.id)}
                        disabled={sendingInvites === rec.id}
                        className="w-full px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {sendingInvites === rec.id ? (
                          <>Sending...</>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Send to Affected Users
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Suggested Courses */}
                  <div>
                    <h5 className="text-sm font-medium text-white/80 mb-3">Recommended Learning</h5>
                    <div className="space-y-2">
                      {rec.suggestedCourses.map((course, index) => (
                        <div key={index} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-4 h-4 text-purple-400" />
                            <div>
                              <div className="text-sm font-medium text-white">{course.name}</div>
                              <div className="text-xs text-white/60">{course.duration} • {course.type}</div>
                            </div>
                          </div>
                          <button className="text-purple-400 hover:text-purple-300 transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Expected Impact */}
                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <h5 className="text-sm font-medium text-green-400 mb-1">Expected Impact</h5>
                      <p className="text-sm text-white/70">{rec.expectedImpact}</p>
                    </div>
                  </div>
                </div>

                {/* All Insights */}
                <div className="mt-6">
                  <h5 className="text-sm font-medium text-white/80 mb-3">Detailed Insights</h5>
                  <div className="space-y-2">
                    {rec.insights.map((insight, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <BarChart3 className="w-4 h-4 text-purple-400 mt-0.5" />
                        <span className="text-sm text-white/70">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Insights Footer */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-500/20">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold text-white mb-2">AI Learning & Improving</h4>
            <p className="text-white/70 text-sm">
              These recommendations are based on analysis of 1,247 similar teams and continuously improve as more data is collected. 
              The system has identified patterns that predict team success with 89% accuracy.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-white/60">Real-time analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full" />
                <span className="text-sm text-white/60">Updated daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full" />
                <span className="text-sm text-white/60">1,247 teams analyzed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}