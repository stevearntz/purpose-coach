import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Clock, Heart, Users, MessageSquare, Target, Lightbulb, Zap, Shield, GitBranch, Rocket, UserCheck, Building2, Briefcase, Home, DollarSign, Award, Brain } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import { headers } from 'next/headers'
import type { Metadata } from 'next'

// Icon mapping for change types
const changeTypeIcons: Record<string, any> = {
  'Re-organization': GitBranch,
  'Launch': Rocket,
  'Leadership': UserCheck,
  'Team/People': Users,
  'Role': Briefcase,
  'Location': Home,
  'Financial': DollarSign,
  'Process': Target,
  'Technology': Zap,
  'Policy': Shield,
  'Promotion': Award,
  'Other': Brain
}

// Icon mapping for emotions
const emotionIcons: Record<string, any> = {
  'Excited': '🎉',
  'Anxious': '😰',
  'Confident': '💪',
  'Frustrated': '😤',
  'Hopeful': '🌟',
  'Worried': '😟',
  'Curious': '🤔',
  'Overwhelmed': '😵',
  'Motivated': '🚀',
  'Uncertain': '❓',
  'Energized': '⚡',
  'Sad': '😢'
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
    
    // Check if this is a change-reflection share
    if (result.type !== 'change-reflection') {
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
    title: 'Change Reflection Summary - Campfire',
    description: 'View my change reflection summary and insights about navigating this transition.',
    openGraph: {
      title: 'Change Reflection Summary - Campfire',
      description: 'View my change reflection summary and insights about navigating this transition.',
      url: `${baseUrl}/change-reflection/share/${id}`,
      siteName: 'Campfire',
      images: [
        {
          url: `${baseUrl}/og-change-reflection-share.png`,
          width: 1200,
          height: 630,
          alt: 'Change Reflection Summary - Campfire',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Change Reflection Summary - Campfire',
      description: 'View my change reflection summary and insights about navigating this transition.',
      images: [`${baseUrl}/og-change-reflection-share.png`],
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

  return (
    <>
      <ViewportContainer className="bg-gradient-to-br from-[#F595B6]/10 via-[#E37A75]/10 to-[#BF4C74]/10 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Change Reflection Summary
            </h1>
            <p className="text-lg text-gray-600">
              A comprehensive view of this change journey
            </p>
          </div>

          <div className="space-y-8">
            {/* Change Types */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-xl flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Type of Change</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {data.changeTypes.map((type: string, index: number) => {
                  const Icon = changeTypeIcons[type] || Brain
                  return (
                    <div key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-[#BF4C74]/10 text-[#BF4C74] rounded-full font-medium">
                      <Icon className="w-4 h-4" />
                      {type}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Change Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">What's Changing</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">{data.changeDescription}</p>
            </div>

            {/* Current Emotions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Current Feelings</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {data.currentEmotions.map((emotion: string, index: number) => (
                  <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F595B6]/20 to-[#BF4C74]/20 text-[#BF4C74] rounded-full font-medium">
                    <span className="text-xl">{emotionIcons[emotion] || '💭'}</span>
                    {emotion}
                  </span>
                ))}
              </div>
            </div>

            {/* Concerns */}
            {data.concerns && data.concerns.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-xl flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Key Concerns</h2>
                </div>
                <ul className="space-y-3">
                  {data.concerns.map((concern: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#BF4C74] mt-1">•</span>
                      <span className="text-gray-700 text-lg">{concern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coping Strategies */}
            {data.copingStrategies && data.copingStrategies.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Coping Strategies</h2>
                </div>
                <ul className="space-y-3">
                  {data.copingStrategies.map((strategy: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-[#BF4C74] mt-1">✓</span>
                      <span className="text-gray-700 text-lg">{strategy}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Support Needs */}
            {data.supportNeeds && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Support Needed</h2>
                </div>
                <p className="text-gray-700 text-lg leading-relaxed">{data.supportNeeds}</p>
              </div>
            )}

            {/* People Impacted */}
            {data.peopleImpacted && data.peopleImpacted.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">People Impacted</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {data.peopleImpacted.map((person: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium">
                      {person}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Person & Anticipated Emotions */}
            {data.selectedPerson && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Planning to Talk With: {data.selectedPerson}</h2>
                </div>
                {data.anticipatedEmotions && data.anticipatedEmotions.length > 0 && (
                  <div>
                    <p className="text-gray-600 mb-4">Anticipated emotions for this conversation:</p>
                    <div className="flex flex-wrap gap-3">
                      {data.anticipatedEmotions.map((emotion: string, index: number) => (
                        <span key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#F595B6]/20 to-[#BF4C74]/20 text-[#BF4C74] rounded-full font-medium">
                          <span className="text-xl">{emotionIcons[emotion] || '💭'}</span>
                          {emotion}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/change-reflection"
              className="inline-flex items-center px-6 py-3 bg-[#BF4C74] text-white rounded-lg hover:bg-[#A63D5F] transition-colors font-semibold"
            >
              Create Your Own Reflection
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </ViewportContainer>
      <Footer />
    </>
  )
}