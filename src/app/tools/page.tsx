'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, Target, Shield, Heart, Brain, Users, Lightbulb, CheckCircle, ArrowLeft } from 'lucide-react'
import Footer from '@/components/Footer'
import { useAnalytics } from '@/hooks/useAnalytics'

interface Tool {
  id: string
  path: string
  title: string
  subtitle: string
  description: string
  gradient: string
  icon: React.ReactNode
  challenges: string[]
}

interface Challenge {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

const challenges: Challenge[] = [
  {
    id: 'purpose-direction',
    title: 'Purpose + Direction',
    description: 'Clarify your purpose and set clear direction for yourself and your team',
    icon: <Target className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'navigating-change',
    title: 'Navigating Change',
    description: 'Lead effectively through transitions and uncertainty',
    icon: <ArrowRight className="w-6 h-6" />,
    color: 'from-green-500 to-teal-500'
  },
  {
    id: 'trust-feedback',
    title: 'Trust + Feedback',
    description: 'Build trust, psychological safety, and healthy feedback cultures',
    icon: <Shield className="w-6 h-6" />,
    color: 'from-blue-500 to-indigo-500'
  },
  {
    id: 'empowering-others',
    title: 'Empowering Others',
    description: 'Develop, coach, and empower your team members',
    icon: <Users className="w-6 h-6" />,
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 'decision-making',
    title: 'Decision Making',
    description: 'Make better decisions under pressure and complexity',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'wellbeing',
    title: 'Well-Being',
    description: 'Maintain balance, resilience, and prevent burnout',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-red-500 to-pink-500'
  },
  {
    id: 'communication',
    title: 'Communication',
    description: 'Improve team communication and collaboration',
    icon: <Lightbulb className="w-6 h-6" />,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'skill-building',
    title: 'Skill Building',
    description: 'Develop key leadership and professional skills',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-500 to-indigo-500'
  },
  {
    id: 'alignment',
    title: 'Alignment + Clarity',
    description: 'Create clarity and align teams around shared goals',
    icon: <CheckCircle className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-500'
  }
]

const tools: Tool[] = [
  {
    id: 'purpose',
    path: '/purpose',
    title: 'Purpose Discovery',
    subtitle: 'Find your why',
    description: 'Uncover your core purpose and align your work with what matters most to you.',
    gradient: 'from-[#6E3FCC] to-[#EB6593]',
    icon: <Target className="w-8 h-8" />,
    challenges: ['purpose-direction', 'alignment']
  },
  {
    id: 'team-canvas',
    path: '/team-canvas',
    title: 'Team Canvas',
    subtitle: 'Align your team',
    description: 'Create clarity and alignment on your team\'s purpose, values, and ways of working.',
    gradient: 'from-[#FF6B6B] to-[#4ECDC4]',
    icon: <Users className="w-8 h-8" />,
    challenges: ['purpose-direction', 'alignment', 'communication']
  },
  {
    id: 'trust-audit',
    path: '/trust-audit',
    title: 'Trust Audit',
    subtitle: 'Build stronger relationships',
    description: 'Assess trust across key dimensions to strengthen your professional relationships.',
    gradient: 'from-[#FFA62A] to-[#DB4839]',
    icon: <Shield className="w-8 h-8" />,
    challenges: ['trust-feedback', 'communication']
  },
  {
    id: 'burnout-assessment',
    path: '/burnout-assessment',
    title: 'Burnout Assessment',
    subtitle: 'Check your energy levels',
    description: 'Evaluate your current state and get strategies for maintaining well-being.',
    gradient: 'from-[#74DEDE] to-[#30B859]',
    icon: <Heart className="w-8 h-8" />,
    challenges: ['wellbeing']
  },
  {
    id: 'decision-audit',
    path: '/decision-making-audit',
    title: 'Decision Making Audit',
    subtitle: 'Improve your decisions',
    description: 'Evaluate how you make decisions to identify strengths and growth areas.',
    gradient: 'from-[#6DC7FF] to-[#3C36FF]',
    icon: <Brain className="w-8 h-8" />,
    challenges: ['decision-making']
  },
  {
    id: 'change-readiness',
    path: '/change-readiness',
    title: 'Change Readiness',
    subtitle: 'Navigate change confidently',
    description: 'Assess your readiness for change and identify where you need support.',
    gradient: 'from-[#FCA376] to-[#BF4C74]',
    icon: <ArrowRight className="w-8 h-8" />,
    challenges: ['navigating-change']
  },
  {
    id: 'working-with-me',
    path: '/user-guide',
    title: 'Working with Me',
    subtitle: 'Create your user guide',
    description: 'Build a shareable guide that helps others collaborate effectively with you.',
    gradient: 'from-[#30C7C7] to-[#2A74B9]',
    icon: <Lightbulb className="w-8 h-8" />,
    challenges: ['communication', 'alignment']
  },
  {
    id: 'hopes-fears',
    path: '/hopes-fears-expectations',
    title: 'Hopes, Fears & Expectations',
    subtitle: 'Surface team dynamics',
    description: 'Create psychological safety by sharing hopes, fears, and expectations.',
    gradient: 'from-[#F687B3] to-[#9333EA]',
    icon: <Heart className="w-8 h-8" />,
    challenges: ['trust-feedback', 'navigating-change', 'communication']
  },
  {
    id: 'career-drivers',
    path: '/career-drivers',
    title: 'Career Drivers',
    subtitle: 'Understand motivations',
    description: 'Identify and prioritize what truly drives you in your career.',
    gradient: 'from-[#FBBF24] to-[#F59E0B]',
    icon: <Sparkles className="w-8 h-8" />,
    challenges: ['purpose-direction', 'skill-building']
  },
  {
    id: 'coaching-cards',
    path: '/coaching-cards',
    title: 'Coaching Cards',
    subtitle: 'Guided reflection',
    description: 'Use powerful questions to guide self-reflection and growth.',
    gradient: 'from-[#10B981] to-[#059669]',
    icon: <Lightbulb className="w-8 h-8" />,
    challenges: ['empowering-others', 'skill-building']
  }
]

export default function ToolsIndexPage() {
  const analytics = useAnalytics()
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null)

  const filteredTools = useMemo(() => {
    if (!selectedChallenge) return tools
    return tools.filter(tool => tool.challenges.includes(selectedChallenge))
  }, [selectedChallenge])

  const handleChallengeClick = (challengeId: string) => {
    if (selectedChallenge === challengeId) {
      setSelectedChallenge(null)
      analytics.trackAction('Challenge Filter Cleared', { challenge: challengeId })
    } else {
      setSelectedChallenge(challengeId)
      analytics.trackAction('Challenge Filter Selected', { challenge: challengeId })
    }
  }

  const handleToolClick = (toolId: string, toolTitle: string) => {
    analytics.trackAction('Tool Selected', { 
      tool: toolTitle,
      from_page: 'tools_index',
      filtered_by: selectedChallenge || 'none'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-indigo-600/20 animate-gradient-shift" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 px-4 py-20 max-w-7xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              Leadership Development Tools
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto">
              Evidence-based tools to help you grow as a leader, build stronger teams, and navigate workplace challenges with confidence.
            </p>
          </div>

          {/* Challenge Filters */}
          <div className="mb-12">
            <h2 className="text-lg font-semibold text-white/80 mb-4 text-center">
              Filter by Challenge
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {challenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => handleChallengeClick(challenge.id)}
                  className={`
                    px-4 py-2 rounded-full flex items-center gap-2 transition-all duration-200
                    ${selectedChallenge === challenge.id
                      ? 'bg-white text-gray-900 shadow-lg scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm'
                    }
                  `}
                >
                  {challenge.icon}
                  <span className="font-medium">{challenge.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="px-4 py-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.path}
              onClick={() => handleToolClick(tool.id, tool.title)}
              className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative p-8">
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${tool.gradient} text-white mb-6 shadow-lg`}>
                  {tool.icon}
                </div>

                {/* Title and Subtitle */}
                <h3 className="text-2xl font-bold text-white mb-2">
                  {tool.title}
                </h3>
                <p className="text-lg text-white/70 mb-4">
                  {tool.subtitle}
                </p>

                {/* Description */}
                <p className="text-white/60 mb-6 line-clamp-2">
                  {tool.description}
                </p>

                {/* Challenge Tags */}
                <div className="flex flex-wrap gap-2">
                  {tool.challenges.map((challengeId) => {
                    const challenge = challenges.find(c => c.id === challengeId)
                    return challenge ? (
                      <span
                        key={challengeId}
                        className={`
                          text-xs px-3 py-1 rounded-full
                          ${selectedChallenge === challengeId
                            ? 'bg-white text-gray-900 font-semibold'
                            : 'bg-white/10 text-white/70'
                          }
                        `}
                      >
                        {challenge.title}
                      </span>
                    ) : null
                  })}
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <div className="text-center py-20">
            <p className="text-white/60 text-lg">
              No tools match the selected challenge. Try selecting a different one.
            </p>
          </div>
        )}
      </div>

      {/* Coming Soon Section */}
      <div className="px-4 py-16 max-w-7xl mx-auto">
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            More Tools Coming Soon
          </h2>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            We're continuously developing new tools to help you tackle workplace challenges. 
            Have a specific need? Let us know what tools would be most helpful for you.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}