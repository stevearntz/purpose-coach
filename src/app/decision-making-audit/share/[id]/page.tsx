import ToolSharePage from '@/components/ToolSharePage'
import { dimensionInfo, getDecisionRecommendations } from '../../page'
import { toolConfigs } from '@/lib/toolConfigs'

interface Props {
  params: { id: string }
}

export default function DecisionMakingAuditSharePage({ params }: Props) {
  const config = toolConfigs.decisionMakingAudit

  const renderResults = (data: any) => {
    const { decisionContext, dimensions, total, readinessLevel } = data

    return (
      <>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
          <p className="text-gray-600 mb-4 text-center">
            Decision: <span className="font-medium">{decisionContext}</span>
          </p>
          <h2 className="text-2xl font-semibold text-nightfall mb-4 text-center">
            Decision Readiness: {readinessLevel}
          </h2>
          <div className="text-3xl font-bold text-[#3C36FF] text-center">
            {total.toFixed(1)} / 20
          </div>
        </div>
      
        <div className="space-y-6 mb-8">
          {dimensions.map(({ dimension, score }: any) => {
            const info = dimensionInfo[dimension as keyof typeof dimensionInfo]
            const percentage = (score / 5) * 100
            
            return (
              <div key={dimension} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-nightfall">{info.title}</h3>
                  <div className="text-2xl font-bold text-[#3C36FF]">
                    {score.toFixed(1)} / 5
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#6DC7FF] to-[#3C36FF] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Recommendations:</h4>
                  {getDecisionRecommendations(dimension, score).map((rec, index) => (
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
      shareId={params.id}
      toolPath="/decision-making-audit"
      toolConfig={{
        title: config.title,
        gradient: 'from-[#6DC7FF] to-[#3C36FF]'
      }}
      renderResults={renderResults}
    />
  )
}