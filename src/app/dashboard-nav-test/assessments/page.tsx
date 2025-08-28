'use client'

import { Lightbulb, Users, Target, Shield, Flame, Brain, Heart, TrendingUp } from 'lucide-react'

export default function AssessmentsTestPage() {
  const assessments = [
    {
      id: 'hr-partnership',
      title: 'HR Partnership Assessment',
      description: 'Evaluate your HR partnership effectiveness',
      icon: Lightbulb,
      color: 'from-cyan-500 to-blue-500',
      available: true
    },
    {
      id: 'trust-audit',
      title: 'Trust Audit',
      description: 'Measure trust levels within your team',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      available: true
    },
    {
      id: 'burnout',
      title: 'Burnout Assessment',
      description: 'Identify and prevent team burnout',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      available: true
    },
    {
      id: 'team-charter',
      title: 'Team Charter',
      description: 'Create your team operating agreement',
      icon: Users,
      color: 'from-purple-500 to-indigo-500',
      available: true
    }
  ]
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assessment Library</h1>
          <p className="text-white/60 mt-1">Choose an assessment to launch for your team</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assessments.map((assessment) => {
          const Icon = assessment.icon
          return (
            <button
              key={assessment.id}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all text-left group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${assessment.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{assessment.title}</h3>
              <p className="text-sm text-white/60 mb-4">{assessment.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-purple-400">Launch Campaign →</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}