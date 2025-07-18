'use client'

import { useParams } from 'next/navigation'
import ToolSharePage from '@/components/ToolSharePage'
import { toolConfigs } from '@/lib/toolConfigs'

const dimensionInfo = {
  exhaustion: {
    title: 'Emotional Exhaustion',
    description: 'Feeling emotionally drained and depleted'
  },
  cynicism: {
    title: 'Cynicism',
    description: 'Detachment and negative attitudes toward work'
  },
  inefficacy: {
    title: 'Professional Efficacy',
    description: 'Feelings of competence and achievement'
  },
  neglect: {
    title: 'Self-Care Neglect',
    description: 'Sacrificing personal needs for work'
  },
  workload: {
    title: 'Workload',
    description: 'Amount and pace of work demands'
  },
  values: {
    title: 'Values Alignment',
    description: 'Alignment between personal and organizational values'
  }
}

const getRecommendations = (dimension: string, score: number) => {
  const recommendations = {
    exhaustion: [
      'Schedule regular breaks throughout your workday',
      'Practice energy management techniques like the Pomodoro method',
      'Establish clear work-life boundaries',
      'Prioritize sleep and maintain a consistent sleep schedule'
    ],
    cynicism: [
      'Reconnect with the purpose and impact of your work',
      'Seek opportunities for meaningful projects',
      'Build positive relationships with colleagues',
      'Celebrate small wins and accomplishments'
    ],
    inefficacy: [
      'Set achievable goals and track your progress',
      'Seek feedback and mentorship',
      'Invest in skill development and learning',
      'Document and reflect on your accomplishments'
    ],
    neglect: [
      'Schedule personal activities like you would meetings',
      'Set non-negotiable self-care routines',
      'Use calendar blocking for meals and breaks',
      'Practice saying no to protect personal time'
    ],
    workload: [
      'Communicate workload concerns with your manager',
      'Prioritize tasks using urgency/importance matrix',
      'Delegate when possible',
      'Negotiate realistic deadlines'
    ],
    values: [
      'Identify aspects of work that align with your values',
      'Seek projects that feel meaningful',
      'Connect your daily tasks to larger impact',
      'Consider discussing concerns with leadership'
    ]
  }
  
  if (score >= 3.5) {
    return recommendations[dimension as keyof typeof recommendations] || []
  } else if (score >= 2.5) {
    return recommendations[dimension as keyof typeof recommendations]?.slice(0, 2) || []
  } else {
    return [recommendations[dimension as keyof typeof recommendations]?.[0] || 'Keep up your current practices!']
  }
}

export default function BurnoutAssessmentSharePage() {
  const params = useParams()
  const config = toolConfigs.burnoutAssessment

  const renderResults = (results: any) => {
    if (!results) return null

    return (
      <>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
          <h2 className="text-2xl font-semibold text-nightfall mb-2 text-center">
            Overall Readiness: <span className={results.overallReadiness?.color}>{results.overallReadiness?.level}</span>
          </h2>
          <p className="text-gray-600 text-center mb-4">{results.overallReadiness?.description}</p>
          <div className="text-3xl font-bold text-[#30B859] text-center">
            {results.overall?.toFixed(1)} / 5.0
          </div>
        </div>
      
        <div className="space-y-6 mb-8">
          {results.dimensions?.map(({ dimension, score }: any) => {
            const info = dimensionInfo[dimension as keyof typeof dimensionInfo]
            const percentage = (score / 5) * 100
            
            return (
              <div key={dimension} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-nightfall">{info.title}</h3>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#30B859]">
                      {score.toFixed(1)} / 5.0
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#74DEDE] to-[#30B859] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Strategies:</h4>
                  {getRecommendations(dimension, score).map((rec, index) => (
                    <p key={index} className="text-gray-600 text-sm pl-4">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <ToolSharePage
      shareId={params.id as string}
      toolPath="/burnout-assessment"
      toolConfig={config}
      renderResults={renderResults}
    />
  )
}