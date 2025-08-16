'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Lightbulb, Sparkles, BookOpen, Wrench, Brain, Target,
  Users, TrendingUp, Clock, Star, ExternalLink, Loader2,
  RefreshCw, AlertCircle, CheckCircle, Rocket
} from 'lucide-react'

interface Course {
  id: string
  title: string
  category: string
  duration: string
  format: string
  description: string
  relevanceScore: number
  type: 'course'
}

interface Tool {
  id: string
  title: string
  category: string
  duration: string
  format: string
  description: string
  relevanceScore: number
  type: 'tool'
}

interface Insights {
  topChallenges: string[]
  topSkills: string[]
  topNeeds: string[]
  topFocusAreas: string[]
  aiSummary: string | null
}

interface RecommendationsData {
  courses: Course[]
  tools: Tool[]
  insights: Insights
  metadata: {
    totalAssessments: number
    lastUpdated: string
  }
}

export default function RecommendationsTab() {
  const router = useRouter()
  const [recommendations, setRecommendations] = useState<RecommendationsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadRecommendations()
  }, [])

  const loadRecommendations = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/recommendations', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to view recommendations')
        } else {
          setError('Failed to load recommendations')
        }
        return
      }
      
      const data = await response.json()
      setRecommendations(data.recommendations)
    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError('An error occurred while loading recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadRecommendations()
    setRefreshing(false)
  }

  const getRelevanceIcon = (score: number) => {
    if (score >= 70) return <Star className="w-4 h-4 text-yellow-400" />
    if (score >= 40) return <CheckCircle className="w-4 h-4 text-green-400" />
    return null
  }

  const getRelevanceLabel = (score: number) => {
    if (score >= 70) return 'Highly Relevant'
    if (score >= 40) return 'Recommended'
    return 'Suggested'
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Recommendations
          </h2>
          <p className="text-lg text-white/80">
            Analyzing your team's assessment data...
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin h-12 w-12 text-purple-400" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Recommendations
          </h2>
        </div>
        <div className="bg-red-500/10 backdrop-blur-sm rounded-xl p-8 border border-red-500/20 text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-white/80">{error}</p>
          <button
            onClick={loadRecommendations}
            className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!recommendations || recommendations.metadata.totalAssessments === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Recommendations
          </h2>
          <p className="text-lg text-white/80">
            Personalized insights and recommendations based on assessment results
          </p>
        </div>

        {/* Empty State */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
          <Lightbulb className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            AI-powered recommendations will appear here once your team completes assessments
          </p>
          <button
            onClick={() => router.push('/dashboard/assessments')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Rocket className="w-5 h-5" />
            Go to Assessments
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-3">
            AI Recommendations
          </h2>
          <p className="text-lg text-white/80">
            Personalized insights based on {recommendations.metadata.totalAssessments} assessment{recommendations.metadata.totalAssessments !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* AI Insights Summary */}
      {recommendations.insights.aiSummary && (
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-6">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Strategic Insights</h3>
              <p className="text-white/90">{recommendations.insights.aiSummary}</p>
            </div>
          </div>
        </div>
      )}

      {/* Key Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Top Challenges */}
        {recommendations.insights.topChallenges.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-red-400" />
              <h4 className="font-medium text-white">Top Challenges</h4>
            </div>
            <div className="space-y-1">
              {recommendations.insights.topChallenges.slice(0, 3).map((challenge, idx) => (
                <div key={idx} className="text-sm text-white/70">• {challenge}</div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Gaps */}
        {recommendations.insights.topSkills.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              <h4 className="font-medium text-white">Skills to Develop</h4>
            </div>
            <div className="space-y-1">
              {recommendations.insights.topSkills.slice(0, 3).map((skill, idx) => (
                <div key={idx} className="text-sm text-white/70">• {skill}</div>
              ))}
            </div>
          </div>
        )}

        {/* Support Needs */}
        {recommendations.insights.topNeeds.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-yellow-400" />
              <h4 className="font-medium text-white">Support Needs</h4>
            </div>
            <div className="space-y-1">
              {recommendations.insights.topNeeds.slice(0, 3).map((need, idx) => (
                <div key={idx} className="text-sm text-white/70">• {need}</div>
              ))}
            </div>
          </div>
        )}

        {/* Focus Areas */}
        {recommendations.insights.topFocusAreas.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h4 className="font-medium text-white">Focus Areas</h4>
            </div>
            <div className="space-y-1">
              {recommendations.insights.topFocusAreas.slice(0, 3).map((area, idx) => (
                <div key={idx} className="text-sm text-white/70">• {area}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recommended Courses */}
      {recommendations.courses.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            Recommended Courses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.courses.map((course) => (
              <div key={course.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRelevanceIcon(course.relevanceScore)}
                    <span className="text-xs text-white/60">{getRelevanceLabel(course.relevanceScore)}</span>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                    {course.format}
                  </span>
                </div>
                <h4 className="font-semibold text-white mb-2">{course.title}</h4>
                <p className="text-sm text-white/70 mb-3">{course.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                    <span>{course.category}</span>
                  </div>
                  <a 
                    href="https://tools.getcampfire.com/courses"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="View Course Catalog"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Tools */}
      {recommendations.tools.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-green-400" />
            Recommended Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.tools.map((tool) => (
              <div key={tool.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRelevanceIcon(tool.relevanceScore)}
                    <span className="text-xs text-white/60">{getRelevanceLabel(tool.relevanceScore)}</span>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                    {tool.format}
                  </span>
                </div>
                <h4 className="font-semibold text-white mb-2">{tool.title}</h4>
                <p className="text-sm text-white/70 mb-3">{tool.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tool.duration}
                    </span>
                    <span>{tool.category}</span>
                  </div>
                  <a 
                    href={`https://tools.getcampfire.com/toolkit/${tool.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 transition-colors"
                    title="Use Tool"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-8 text-center text-sm text-white/40">
        Last updated: {new Date(recommendations.metadata.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}