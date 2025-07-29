import ToolSharePage from '@/components/ToolSharePage'
import { toolConfigs } from '@/lib/toolConfigs'
import type { Metadata } from 'next'
import { UserCheck, UsersIcon, MessagesSquare, Laptop, Briefcase, GitBranch, Settings, Handshake, ShieldCheck, DollarSign, Package, Link, Cog, Calendar, RefreshCw, Clock, ShieldAlert, Heart, Target, Users } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

const mainCategories = [
  { id: 'performance', label: 'Individual Performance', icon: UserCheck, color: 'text-blue-600' },
  { id: 'teamDynamics', label: 'Team Dynamics', icon: UsersIcon, color: 'text-purple-600' },
  { id: 'communication', label: 'Communication', icon: MessagesSquare, color: 'text-green-600' },
  { id: 'workModels', label: 'Work Norms', icon: Laptop, color: 'text-orange-600' },
  { id: 'leadership', label: 'Leadership Skills', icon: Briefcase, color: 'text-red-600' },
  { id: 'change', label: 'Change & Alignment', icon: GitBranch, color: 'text-indigo-600' },
  { id: 'systems', label: 'Systems & Operations', icon: Settings, color: 'text-gray-600' },
  { id: 'collaboration', label: 'Cross-functional Collaboration', icon: Handshake, color: 'text-teal-600' },
  { id: 'compliance', label: 'Compliance & Risk', icon: ShieldCheck, color: 'text-amber-600' }
]

const priorityOptions = [
  { id: 'revenue', label: 'Revenue, sales, or growth targets', icon: DollarSign },
  { id: 'customer', label: 'Customer success or retention', icon: Heart },
  { id: 'product', label: 'Product or delivery milestones', icon: Package },
  { id: 'team', label: 'Team performance or growth', icon: Users },
  { id: 'collaboration', label: 'Cross-functional collaboration', icon: Link },
  { id: 'culture', label: 'Culture or engagement', icon: UsersIcon },
  { id: 'efficiency', label: 'Operational efficiency', icon: Cog },
  { id: 'budget', label: 'Budget or cost management', icon: DollarSign },
  { id: 'strategy', label: 'Strategy or planning', icon: Target },
  { id: 'change', label: 'Change or transformation efforts', icon: RefreshCw },
  { id: 'personal', label: 'My own focus / effectiveness', icon: Clock },
  { id: 'risk', label: 'Risk management or compliance', icon: ShieldAlert }
]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const baseUrl = 'https://tools.getcampfire.com'
  
  return {
    title: 'HR Partnership Assessment Results - Campfire',
    description: 'View manager insights on current challenges, skill gaps, support needs, and culture building initiatives.',
    openGraph: {
      title: 'HR Partnership Assessment Results - Campfire',
      description: 'View manager insights on current challenges, skill gaps, support needs, and culture building initiatives.',
      url: `${baseUrl}/hr-partnership/share/${id}`,
      siteName: 'Campfire',
      images: [
        {
          url: `${baseUrl}/og-hr-partnership-share.png`,
          width: 1200,
          height: 630,
          alt: 'HR Partnership Assessment Results - Campfire',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HR Partnership Assessment Results - Campfire',
      description: 'View manager insights on current challenges, skill gaps, support needs, and culture building initiatives.',
      images: [`${baseUrl}/og-hr-partnership-share.png`],
      site: '@campfire',
    },
    metadataBase: new URL(baseUrl),
  }
}

export default async function HRPartnershipSharePage({ params }: Props) {
  const { id } = await params
  const config = toolConfigs.hrPartnership

  const renderResults = (data: any) => {
    if (!data || !data.results) return null
    
    const results = data.results

    return (
      <>
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-900">Manager Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div>
              <span className="font-medium">Name:</span> {results.name}
            </div>
            <div>
              <span className="font-medium">Department:</span> {results.department}
            </div>
            <div>
              <span className="font-medium">Email:</span> {results.email}
            </div>
            <div>
              <span className="font-medium">Team Size:</span> {results.teamSize}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Challenge Categories Overview */}
          {results.selectedCategories?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Key Challenge Areas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {results.selectedCategories.map((catId: string) => {
                  const category = mainCategories.find(c => c.id === catId)
                  if (!category) return null
                  const Icon = category.icon
                  return (
                    <div key={catId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Icon className={`w-6 h-6 ${category.color}`} />
                      <span className="font-medium text-gray-800">{category.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Detailed Category Challenges */}
          {results.selectedCategories?.map((catId: string) => {
            const category = mainCategories.find(c => c.id === catId)
            const categoryData = results.categoryDetails?.[catId]
            if (!category || !categoryData) return null
            
            const Icon = category.icon
            const bgColorMap: { [key: string]: string } = {
              performance: 'bg-blue-100',
              teamDynamics: 'bg-purple-100',
              communication: 'bg-green-100',
              workModels: 'bg-orange-100',
              leadership: 'bg-red-100',
              change: 'bg-indigo-100',
              systems: 'bg-gray-100',
              collaboration: 'bg-teal-100',
              compliance: 'bg-amber-100'
            }
            const textColorMap: { [key: string]: string } = {
              performance: 'text-blue-700',
              teamDynamics: 'text-purple-700',
              communication: 'text-green-700',
              workModels: 'text-orange-700',
              leadership: 'text-red-700',
              change: 'text-indigo-700',
              systems: 'text-gray-700',
              collaboration: 'text-teal-700',
              compliance: 'text-amber-700'
            }
            
            return (
              <div key={catId} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className={`w-8 h-8 ${bgColorMap[catId] || 'bg-gray-100'} rounded-full flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  {category.label} Challenges
                </h3>
                <div className="space-y-3">
                  {categoryData.challenges?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {categoryData.challenges.map((challenge: string) => (
                        <span key={challenge} className={`px-3 py-1 ${bgColorMap[catId] || 'bg-gray-100'} ${textColorMap[catId] || 'text-gray-700'} rounded-full text-sm`}>
                          {challenge}
                        </span>
                      ))}
                    </div>
                  )}
                  {categoryData.details && (
                    <p className="text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">
                      {categoryData.details}
                    </p>
                  )}
                </div>
              </div>
            )
          })}

          {/* Skills & Knowledge Needs */}
          {results.skillGaps?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">🎯</span>
                </div>
                Skills & Knowledge Needs
              </h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {results.skillGaps.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
                {results.skillDetails && (
                  <p className="text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">
                    {results.skillDetails}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Immediate Support Needs */}
          {results.supportNeeds?.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600">🛡️</span>
                </div>
                Immediate Support Needs
              </h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {results.supportNeeds.map((need: string) => (
                    <span key={need} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                      {need}
                    </span>
                  ))}
                </div>
                {results.supportDetails && (
                  <p className="text-gray-600 mt-3 p-3 bg-gray-50 rounded-lg">
                    {results.supportDetails}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Team Priorities */}
          {(results.selectedPriorities?.length > 0 || results.customPriority || results.hrSupport) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-indigo-600">🧠</span>
                </div>
                Team Priorities
              </h3>
              <div className="space-y-4">
                {(results.selectedPriorities?.length > 0 || results.customPriority) && (
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Focus Areas:</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {results.selectedPriorities?.map((priorityId: string) => {
                        const priority = priorityOptions.find(p => p.id === priorityId)
                        const Icon = priority?.icon
                        return priority && Icon ? (
                          <span key={priorityId} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm flex items-center gap-1">
                            <Icon className="w-3 h-3" />
                            {priority.label}
                          </span>
                        ) : null
                      })}
                      {results.customPriority && (
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                          {results.customPriority}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {results.hrSupport && (
                  <div>
                    <p className="font-medium text-gray-700 mb-1">HR Support Needed:</p>
                    <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                      {results.hrSupport}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Insights */}
          {(results.additionalInsights || results.aiFollowUp) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center">
                  <span className="text-cyan-600">💡</span>
                </div>
                Additional Insights
              </h3>
              <div className="space-y-4">
                {results.additionalInsights && (
                  <p className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                    {results.additionalInsights}
                  </p>
                )}
                {results.aiFollowUp && (
                  <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                    <p className="text-sm font-medium text-cyan-800 mb-2">Suggested follow-up questions:</p>
                    <p className="text-gray-700">{results.aiFollowUp}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Priority Actions for HR */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Priority Actions for HR</h3>
            <div className="space-y-3">
              {results.selectedCategories?.map((catId: string, index: number) => {
                const category = mainCategories.find(c => c.id === catId)
                const categoryData = results.categoryDetails?.[catId]
                if (!category || !categoryData?.challenges?.length) return null
                
                return (
                  <div key={catId} className="flex items-start gap-3">
                    <span className="text-cyan-600 mt-1">{index + 1}.</span>
                    <div>
                      <p className="font-medium text-gray-800">Address {category.label} Issues</p>
                      <p className="text-gray-600 text-sm">
                        Focus on: {categoryData.challenges.slice(0, 3).join(', ')}
                        {categoryData.challenges.length > 3 && ` (+${categoryData.challenges.length - 3} more)`}
                      </p>
                    </div>
                  </div>
                )
              })}
              {results.supportNeeds?.length > 0 && (
                <div className="flex items-start gap-3">
                  <span className="text-cyan-600 mt-1">{results.selectedCategories?.length + 1 || 1}.</span>
                  <div>
                    <p className="font-medium text-gray-800">Provide Immediate Support</p>
                    <p className="text-gray-600 text-sm">Priority areas: {results.supportNeeds.slice(0, 3).join(', ')}</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <span className="text-cyan-600 mt-1">{(results.selectedCategories?.length || 0) + (results.supportNeeds?.length ? 1 : 0) + 1}.</span>
                <div>
                  <p className="font-medium text-gray-800">Schedule Follow-up Meeting</p>
                  <p className="text-gray-600 text-sm">Discuss priorities and create action plan together</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <ToolSharePage
      shareId={id}
      toolPath="/hr-partnership"
      toolConfig={config}
      renderResults={renderResults}
    />
  )
}