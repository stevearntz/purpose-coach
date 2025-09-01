'use client'

import { useUser } from '@clerk/nextjs'
import { BarChart3, FileText, Calendar, TrendingUp, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MemberResultsPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Future: Fetch user's assessment results
    setLoading(false)
  }, [])

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

      {/* Results Content - Empty State for now */}
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
    </div>
  )
}