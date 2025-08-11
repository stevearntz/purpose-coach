'use client'

import React from 'react'
import { FileText, TrendingUp } from 'lucide-react'

export default function ResultsTab() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-3">
          Assessment Results
        </h2>
        <p className="text-lg text-white/80">
          View and analyze results from completed assessments
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
        <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Results Yet
        </h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Results will appear here once your team members complete their assessments
        </p>
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
          <TrendingUp className="w-4 h-4" />
          <span>Analytics and insights coming soon</span>
        </div>
      </div>
    </div>
  )
}