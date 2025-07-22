import ToolSharePage from '@/components/ToolSharePage'
import { dimensionInfo, getChangeRecommendations } from '@/lib/changeReadinessHelpers'
import { toolConfigs } from '@/lib/toolConfigs'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const baseUrl = 'https://tools.getcampfire.com'
  
  return {
    title: 'My Change Readiness Assessment Results - Campfire',
    description: 'View my change readiness assessment across People, Purpose, and Principles dimensions to navigate change with confidence.',
    openGraph: {
      title: 'My Change Readiness Assessment Results - Campfire',
      description: 'View my change readiness assessment across People, Purpose, and Principles dimensions to navigate change with confidence.',
      url: `${baseUrl}/change-readiness-assessment/share/${id}`,
      siteName: 'Campfire',
      images: [
        {
          url: `${baseUrl}/og-change-readiness-share.png`,
          width: 1200,
          height: 630,
          alt: 'Change Readiness Assessment Results - Campfire',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'My Change Readiness Assessment Results - Campfire',
      description: 'View my change readiness assessment across People, Purpose, and Principles dimensions to navigate change with confidence.',
      images: [`${baseUrl}/og-change-readiness-share.png`],
      site: '@campfire',
    },
    metadataBase: new URL(baseUrl),
  }
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function ChangeReadinessSharePage({ params }: Props) {
  const { id } = await params
  const config = toolConfigs.changeReadiness

  const renderResults = (data: any) => {
    const { changeContext, dimensions, total, overallReadiness } = data

    return (
      <>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
          <p className="text-gray-600 mb-4 text-center">
            Change context: <span className="font-medium">{changeContext}</span>
          </p>
          <h2 className="text-2xl font-semibold text-nightfall mb-2 text-center">
            Overall Readiness: <span className={overallReadiness.color}>{overallReadiness.level}</span>
          </h2>
          <p className="text-gray-600 text-center mb-4">{overallReadiness.description}</p>
          <div className="text-3xl font-bold text-[#BF4C74] text-center">
            {total} / 75 points
          </div>
        </div>
      
        <div className="space-y-6 mb-8">
          {dimensions.map(({ dimension, score }: any) => {
            const info = dimensionInfo[dimension as keyof typeof dimensionInfo]
            const percentage = (score / 25) * 100
            const readiness = score >= 21 
              ? { level: 'High', color: 'text-green-600' }
              : score >= 16 
              ? { level: 'Moderate', color: 'text-yellow-600' }
              : score >= 11
              ? { level: 'Low', color: 'text-orange-600' }
              : { level: 'Very Low', color: 'text-red-600' }
            
            return (
              <div key={dimension} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-nightfall">{info.title}</h3>
                    <p className="text-sm text-gray-600">{info.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#BF4C74]">
                      {score} / 25
                    </div>
                    <div className={`text-sm font-medium ${readiness.color}`}>
                      {readiness.level}
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-[#F595B6] to-[#BF4C74] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-700">Actions to consider:</h4>
                  {getChangeRecommendations(dimension, score).map((rec, index) => (
                    <p key={index} className="text-gray-600 text-sm pl-4">
                      • {rec}
                    </p>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-nightfall mb-3">Reflection Questions</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Which area (People, Purpose, Principles) was your strongest?</li>
            <li>• Which area had the lowest score? What would help increase it?</li>
            <li>• Who could you talk to for clarity or support?</li>
          </ul>
        </div>
      </>
    )
  }

  return (
    <ToolSharePage 
      shareId={id}
      toolPath="/change-readiness-assessment"
      toolConfig={{
        title: config.title,
        gradient: 'from-[#F595B6] to-[#BF4C74]'
      }}
      renderResults={renderResults}
    />
  )
}