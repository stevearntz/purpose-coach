import ToolSharePage from '@/components/ToolSharePage'
import { toolConfigs } from '@/lib/toolConfigs'

const sectionInfo = {
  integrity: {
    title: 'Integrity',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
    description: 'Consistency, reliability, and honesty'
  },
  competence: {
    title: 'Competence',
    color: 'from-rose-400 to-pink-500',
    bgColor: 'bg-gradient-to-br from-rose-400/20 to-pink-500/20',
    description: 'Capability and growth support'
  },
  empathy: {
    title: 'Empathy',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-gradient-to-br from-red-500/20 to-rose-600/20',
    description: 'Care and understanding'
  }
}

const getRecommendations = (section: string, score: number) => {
  const recommendations = {
    integrity: [
      'Track open requests (even informal ones) and close the loop on them visibly',
      "Don't cancel meetings. If you say you're attending, be there",
      'Be honest, even when it\'s difficult',
      'Take ownership when you don\'t follow through on something, and make sure your team knows what you\'ll do differently next time'
    ],
    competence: [
      'Find a mentor or a senior team member to coach you',
      'If things get tense, take a beat before reacting—and name what\'s happening calmly',
      'Talk through your decision making process and thoughts. Ask for their input',
      'Provide thoughtful support and remove roadblocks that make their job harder'
    ],
    empathy: [
      'Spend time shadowing them in their role. What challenges are they facing?',
      'Learn how they like to be recognized and do it intentionally',
      'Discover what they\'re interested in: hobbies, passions, interests, etc. Ask questions about them',
      'Instead of jumping into tasks, begin 1:1s with a simple check-in'
    ]
  }

  if (score < 2.5) {
    return recommendations[section as keyof typeof recommendations] || []
  } else if (score < 3.8) {
    return recommendations[section as keyof typeof recommendations]?.slice(0, 2) || []
  } else {
    return [recommendations[section as keyof typeof recommendations]?.[0] || 'Keep up the great work!']
  }
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function TrustAuditSharePage({ params }: Props) {
  const { id } = await params
  const config = toolConfigs.trustAudit

  const renderResults = (results: any) => {
    if (!results) return null

    return (
      <>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
          <h2 className="text-2xl font-semibold text-nightfall mb-4 text-center">
            Overall Trust Level: {results.trustLevel}
          </h2>
          <div className="text-3xl font-bold text-[#DB4839] text-center">
            {results.total?.toFixed(1)} / 15
          </div>
        </div>
      
        <div className="space-y-6 mb-8">
          {results.sections?.map(({ section, score }: any) => {
            const info = sectionInfo[section as keyof typeof sectionInfo]
            const percentage = (score / 5) * 100
            
            return (
              <div key={section} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-nightfall">{info.title}</h3>
                  <div className="text-2xl font-bold text-[#DB4839]">
                    {score.toFixed(1)} / 5
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Recommendations:</h4>
                  {getRecommendations(section, score).map((rec, index) => (
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
      shareId={id}
      toolPath="/trust-audit"
      toolConfig={config}
      renderResults={renderResults}
    />
  )
}