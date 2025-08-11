'use client'

import React from 'react'
import { Lightbulb, Sparkles } from 'lucide-react'

export default function RecommendationsTab() {
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
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
          <Sparkles className="w-4 h-4" />
          <span>Powered by advanced analytics</span>
        </div>
      </div>
    </div>
  )
}