import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Target, Users, AlertCircle, Calendar, Flag, BarChart3, Heart, MessageSquare, Rocket, UserCheck, Building2, DollarSign, Package, UserPlus, Shuffle, Settings, PiggyBank, RefreshCw, Brain, Clock, Timer, Shield, Trophy, Zap, Plus } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

// Status color mappings
const statusStyles: Record<string, string> = {
  'at-risk': 'text-red-600 bg-red-100',
  'needs-push': 'text-yellow-600 bg-yellow-100',
  'on-track': 'text-green-600 bg-green-100',
  'figuring-out': 'text-purple-600 bg-purple-100'
}

const statusEmojis: Record<string, string> = {
  'at-risk': '🚨',
  'needs-push': '🟡',
  'on-track': '✅',
  'figuring-out': '🧠'
}

const statusLabels: Record<string, string> = {
  'at-risk': 'At risk',
  'needs-push': 'Needs push',
  'on-track': 'On track',
  'figuring-out': 'Still figuring it out'
}

// Member tag mappings
const memberTagEmojis: Record<string, string> = {
  'help': '🚩',
  'grow': '🌱',
  'check-in': '🎯',
  'recognize': '⭐',
  'align': '🤝',
  'delegate': '📋',
  'unblock': '🚧'
}

const memberTagLabels: Record<string, string> = {
  'help': 'Help',
  'grow': 'Grow',
  'check-in': 'Check-in',
  'recognize': 'Recognize',
  'align': 'Align',
  'delegate': 'Delegate',
  'unblock': 'Unblock'
}

// Area icons
const areaIcons: Record<string, any> = {
  revenue: DollarSign,
  customer: Heart,
  product: Package,
  team: UserPlus,
  collaboration: Shuffle,
  culture: Users,
  efficiency: Settings,
  budget: PiggyBank,
  strategy: Target,
  change: RefreshCw,
  focus: Brain,
  risk: Shield
}

const areaLabels: Record<string, string> = {
  revenue: 'Revenue, sales, or growth targets',
  customer: 'Customer success or retention',
  product: 'Product or delivery milestones',
  team: 'Team performance or growth',
  collaboration: 'Cross-functional collaboration',
  culture: 'Culture or engagement',
  efficiency: 'Operational efficiency',
  budget: 'Budget or cost management',
  strategy: 'Strategy or planning',
  change: 'Change or transformation efforts',
  focus: 'My own focus / effectiveness',
  risk: 'Risk management or compliance'
}

// Weekly need icons
const weeklyNeedIcons: Record<string, any> = {
  time: Clock,
  priorities: Target,
  support: Users,
  meetings: Calendar,
  recognition: Trophy,
  energy: Zap,
  custom: Plus
}

async function getSharedResult(id: string) {
  try {
    // Get the host from headers in server component
    const headersList = await headers()
    const host = headersList.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`
    
    console.log('Fetching share data from:', `${baseUrl}/api/share?id=${id}`)
    
    const response = await fetch(`${baseUrl}/api/share?id=${id}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      console.error('Share fetch failed with status:', response.status)
      return null
    }
    
    const result = await response.json()
    console.log('Share data retrieved:', result)
    
    // Check if this is a top-of-mind share (handle both old and new types)
    if (result.type !== 'top-of-mind' && result.type !== 'accountability-builder') {
      console.error('Invalid tool type:', result.type)
      return null
    }
    
    return result.data || result
  } catch (error) {
    console.error('Error fetching shared result:', error)
    return null
  }
}

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const baseUrl = 'https://tools.getcampfire.com'
  
  return {
    title: 'Focus Finder - Weekly Snapshot | Campfire',
    description: 'My weekly focus snapshot - what matters most this week.',
    openGraph: {
      title: 'Focus Finder - Weekly Snapshot | Campfire',
      description: 'My weekly focus snapshot - what matters most this week.',
      url: `${baseUrl}/accountability-builder/share/${id}`,
      siteName: 'Campfire',
      images: [
        {
          url: `${baseUrl}/og-accountability-builder-share.png`,
          width: 1200,
          height: 630,
          alt: 'Focus Finder - Weekly Snapshot | Campfire',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Focus Finder - Weekly Snapshot | Campfire',
      description: 'My weekly focus snapshot - what matters most this week.',
      images: [`${baseUrl}/og-accountability-builder-share.png`],
      site: '@campfire',
    },
    metadataBase: new URL(baseUrl),
  }
}

export default async function SharePage({ params }: Props) {
  const { id } = await params
  const sharedData = await getSharedResult(id)
  
  if (!sharedData || !sharedData.data) {
    notFound()
  }

  const data = sharedData.data
  const weekOf = data.weekOf ? new Date(data.weekOf) : new Date()
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Get the icon for a major area
  const getAreaIcon = (area: string) => {
    const standardArea = Object.keys(areaLabels).find(key => areaLabels[key] === area)
    return standardArea ? areaIcons[standardArea] : Target
  }

  // Get the icon for weekly need
  const getWeeklyNeedIcon = (need: string) => {
    const standardNeed = [
      { id: 'time', label: 'Time to think' },
      { id: 'priorities', label: 'Clear priorities' },
      { id: 'support', label: 'Support from a teammate' },
      { id: 'meetings', label: 'Fewer meetings' },
      { id: 'recognition', label: 'Recognition or motivation' },
      { id: 'energy', label: 'An energy reset' }
    ].find(item => item.id === need || item.label === need)
    
    if (standardNeed) {
      return weeklyNeedIcons[standardNeed.id]
    }
    
    // For custom needs or legacy data
    return weeklyNeedIcons.custom || Plus
  }

  return (
    <>
      <ViewportContainer className="bg-gradient-to-br from-[#C67AF4]/10 to-[#3E37FF]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Focus Finder
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              Weekly Snapshot for {formatDate(weekOf)}
            </p>
            <p className="text-sm text-gray-500">
              What matters most this week
            </p>
          </div>

          <div className="space-y-8">
            {/* Major Areas */}
            {data.majorAreas && data.majorAreas.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-xl flex items-center justify-center">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Areas of Focus</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {data.majorAreas.map((area: string, index: number) => {
                    const AreaIcon = getAreaIcon(area)
                    return (
                      <div key={index} className="flex items-center gap-2 px-4 py-2 bg-[#3E37FF]/10 text-[#3E37FF] rounded-full">
                        <AreaIcon className="w-5 h-5" />
                        <span className="font-medium">{area}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Top Three Focus Items */}
            {data.topThree && data.topThree.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-xl flex items-center justify-center">
                    <Flag className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Top 3 Priorities</h2>
                </div>
                <div className="space-y-4">
                  {data.topThree.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-[#3E37FF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{item.item}</p>
                        {item.reason && (
                          <p className="text-sm text-gray-600 mt-1">Why: {item.reason}</p>
                        )}
                        {item.notes && item.notes.length > 0 && (
                          <div className="space-y-0.5 mt-1">
                            {item.notes.map((note: string, noteIndex: number) => (
                              <p key={noteIndex} className="text-sm text-gray-600 italic">• {note}</p>
                            ))}
                          </div>
                        )}
                        {item.supportPeople && item.supportPeople.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-xs font-medium text-gray-700 flex items-center gap-1">
                              <UserCheck className="w-3 h-3 text-[#3E37FF]" />
                              Support Network
                            </p>
                            {item.supportPeople.map((support: any, idx: number) => (
                              <div key={idx} className="p-2 bg-gray-50 rounded-lg">
                                <p className="font-medium text-gray-800 text-sm">{support.name}</p>
                                <p className="text-gray-600 text-xs mt-0.5">{support.how}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outcomes Status */}
            {data.outcomes && data.outcomes.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Outcome Status</h2>
                </div>
                <div className="space-y-3">
                  {data.outcomes.map((outcome: any, index: number) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-gray-900 flex-1">{outcome.outcome}</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-1 ${statusStyles[outcome.status]}`}>
                          <span>{statusEmojis[outcome.status]}</span>
                          <span>{statusLabels[outcome.status]}</span>
                        </span>
                      </div>
                      {outcome.note && (
                        <p className="text-sm text-gray-600 mt-2">{outcome.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8">
              {/* Team Members */}
              {data.teamMembers && data.teamMembers.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">People & Teams on My Mind</h2>
                  </div>
                  <div className="space-y-3">
                    {data.teamMembers.map((member: any, index: number) => (
                      <div key={index} className="space-y-2">
                        <span className="text-gray-700 font-medium">{member.name}</span>
                        {member.reasons && member.reasons.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {member.reasons.map((reason: string) => (
                              <span key={reason} className="text-xs inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full">
                                <span>{memberTagEmojis[reason]}</span>
                                <span>{memberTagLabels[reason]}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Focus Level & Weekly Need */}
              <div className="space-y-8">
                {/* Focus Level */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-xl flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Focus Level</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-3 relative overflow-hidden">
                      <div 
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] transition-all duration-300"
                        style={{ width: `${data.focusLevel}%` }}
                      />
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{data.focusLevel}%</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {data.focusLevel < 30 ? '🌀 Feeling scattered' : 
                     data.focusLevel < 70 ? '⚡ Getting there' : 
                     '🎯 Laser focused'}
                  </p>
                </div>

                {/* Weekly Need */}
                {data.weeklyNeed && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-xl flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">What I Need Most</h2>
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        {(() => {
                          const NeedIcon = getWeeklyNeedIcon(data.weeklyNeed)
                          return <NeedIcon className="w-6 h-6 text-[#3E37FF]" />
                        })()}
                        <span className="text-lg text-gray-700">
                          {[
                            { id: 'time', label: 'Time to think' },
                            { id: 'priorities', label: 'Clear priorities' },
                            { id: 'support', label: 'Support from a teammate' },
                            { id: 'meetings', label: 'Fewer meetings' },
                            { id: 'recognition', label: 'Recognition or motivation' },
                            { id: 'energy', label: 'An energy reset' }
                          ].find(item => item.id === data.weeklyNeed)?.label || data.weeklyNeed}
                        </span>
                      </div>
                      {data.needDescription && (
                        <p className="text-gray-600 mt-3 italic">"{data.needDescription}"</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/accountability-builder"
              className="inline-flex items-center px-6 py-3 bg-[#3E37FF] text-white rounded-lg hover:bg-[#2E27EF] transition-colors font-semibold"
            >
              Create Your Weekly Snapshot
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </ViewportContainer>
      <Footer />
    </>
  )
}