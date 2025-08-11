'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Rocket } from 'lucide-react'

export default function CampaignsTab() {
  const router = useRouter()

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-3">
          Active Campaigns
        </h2>
        <p className="text-lg text-white/80">
          Manage and monitor your assessment campaigns
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
        <Rocket className="w-16 h-16 text-white/40 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No Active Campaigns
        </h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">
          Launch your first assessment campaign to start gathering insights from your team
        </p>
        <button
          onClick={() => router.push('/dashboard?tab=tools')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Launch First Campaign
        </button>
      </div>
    </div>
  )
}