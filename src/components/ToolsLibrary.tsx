'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Target, Heart, Briefcase, Brain, Users, ShieldCheck, 
  Lightbulb, ArrowRight, ArrowLeft, ClipboardCheck, MessageCircle, BookOpen
} from 'lucide-react'
import CampaignCreationWizard from './CampaignCreationWizard'
import { ToastProvider } from '@/hooks/useToast'

export type ToolType = 'assessment' | 'reflection' | 'conversation-guide'

interface Tool {
  id: string
  path: string
  title: string
  subtitle: string
  description: string
  gradient: string
  icon: React.ReactNode
  type: ToolType
}

const tools: Tool[] = [
  // Assessments (shown in Assessments tab for campaigns)
  {
    id: 'people-leader-needs',
    path: '/people-leader-needs',
    title: 'Needs Assessment',
    subtitle: 'Identify leader pain points',
    description: 'Help managers articulate their needs for growth, support, and strategic direction.',
    gradient: 'from-[#30C7C7] to-[#2A74B9]',
    icon: <Lightbulb className="w-8 h-8" />,
    type: 'assessment'
  },
  {
    id: 'burnout-assessment',
    path: '/burnout-assessment',
    title: 'Burnout Assessment',
    subtitle: 'Check your energy levels',
    description: 'Evaluate your current state and get strategies for maintaining well-being.',
    gradient: 'from-[#74DEDE] to-[#30B859]',
    icon: <Heart className="w-8 h-8" />,
    type: 'assessment'
  },
  {
    id: 'change-readiness',
    path: '/change-readiness-assessment',
    title: 'Change Readiness Assessment',
    subtitle: 'Navigate change confidently',
    description: 'Assess your readiness for change and identify where you need support.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    icon: <Target className="w-8 h-8" />,
    type: 'assessment'
  },
  {
    id: 'change-style',
    path: '/change-style',
    title: 'Change Style Profile',
    subtitle: 'Discover your change persona',
    description: 'Understand how you naturally respond to change.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    icon: <Target className="w-8 h-8" />,
    type: 'assessment'
  },
  // Conversation Guides
  {
    id: 'team-charter',
    path: '/team-charter',
    title: 'Team Charter',
    subtitle: 'Align your team',
    description: 'Create clarity and alignment on your team\'s purpose, values, and ways of working.',
    gradient: 'from-[#FF6B6B] to-[#4ECDC4]',
    icon: <Users className="w-8 h-8" />,
    type: 'conversation-guide'
  },
  {
    id: 'trust-audit',
    path: '/trust-audit',
    title: 'Trust Audit',
    subtitle: 'Build stronger relationships',
    description: 'Assess trust across key dimensions to strengthen your professional relationships.',
    gradient: 'from-[#FFA62A] to-[#DB4839]',
    icon: <ShieldCheck className="w-8 h-8" />,
    type: 'conversation-guide'
  },
  // Reflections
  {
    id: 'decision-audit',
    path: '/decision-making-audit',
    title: 'Decision Making Audit',
    subtitle: 'Improve your decisions',
    description: 'Evaluate how you make decisions to identify strengths and growth areas.',
    gradient: 'from-[#6DC7FF] to-[#3C36FF]',
    icon: <Brain className="w-8 h-8" />,
    type: 'reflection'
  },
  {
    id: 'user-guide',
    path: '/user-guide',
    title: 'User Guide',
    subtitle: 'Create your user guide',
    description: 'Build a shareable guide that helps others collaborate effectively with you.',
    gradient: 'from-[#30C7C7] to-[#2A74B9]',
    icon: <Briefcase className="w-8 h-8" />,
    type: 'reflection'
  },
  {
    id: 'expectations-reflection',
    path: '/expectations-reflection',
    title: 'Expectations Reflection',
    subtitle: 'Surface team dynamics',
    description: 'Create psychological safety by sharing hopes, fears, and expectations.',
    gradient: 'from-[#C67AF4] to-[#3E37FF]',
    icon: <Target className="w-8 h-8" />,
    type: 'conversation-guide'
  },
  {
    id: 'drivers-reflection',
    path: '/drivers-reflection',
    title: 'Drivers Reflection',
    subtitle: 'Understand motivations',
    description: 'Identify and prioritize what truly drives you in your career.',
    gradient: 'from-[#FBBF24] to-[#F59E0B]',
    icon: <Target className="w-8 h-8" />,
    type: 'reflection'
  },
  {
    id: 'coaching-cards',
    path: '/coaching-cards',
    title: 'Coaching Cards',
    subtitle: 'Guided reflection',
    description: 'Use powerful questions to guide self-reflection and growth.',
    gradient: 'from-[#D4F564] to-[#87AE05]',
    icon: <Target className="w-8 h-8" />,
    type: 'conversation-guide'
  },
  {
    id: 'change-reflection',
    path: '/change-reflection',
    title: 'Change Reflection',
    subtitle: '1:1 conversation prep',
    description: 'Prepare for meaningful conversations about change with your team members.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    icon: <Target className="w-8 h-8" />,
    type: 'reflection'
  },
  {
    id: 'focus-finder',
    path: '/accountability-builder',
    title: 'Focus Finder',
    subtitle: '5-minute weekly check-in',
    description: 'A rapid weekly reflection to surface what really matters.',
    gradient: 'from-[#C67AF4] to-[#3E37FF]',
    icon: <Target className="w-8 h-8" />,
    type: 'reflection'
  }
]

interface ToolsLibraryProps {
  onToolClick: (toolId: string, toolTitle: string, toolPath: string) => void
  filterType?: ToolType | 'all'
  showTypeBadges?: boolean
}

export default function ToolsLibrary({ 
  onToolClick, 
  filterType = 'assessment', // Default to showing only assessments
  showTypeBadges = true 
}: ToolsLibraryProps) {
  const router = useRouter()
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null)
  const [showWizard, setShowWizard] = useState(false)
  
  // Filter tools based on type
  const filteredTools = filterType === 'all' 
    ? tools 
    : tools.filter(tool => tool.type === filterType)

  const handleToolClick = (tool: Tool) => {
    // For assessments, show the campaign creation wizard
    if (tool.type === 'assessment') {
      setSelectedTool(tool)
      setShowWizard(true)
    } else {
      // For other tool types, navigate directly to the tool
      router.push(tool.path)
    }
  }

  const getTypeIcon = (type: ToolType) => {
    switch (type) {
      case 'assessment':
        return <ClipboardCheck className="w-3 h-3" />
      case 'reflection':
        return <BookOpen className="w-3 h-3" />
      case 'conversation-guide':
        return <MessageCircle className="w-3 h-3" />
    }
  }

  const getTypeLabel = (type: ToolType) => {
    switch (type) {
      case 'assessment':
        return 'Assessment'
      case 'reflection':
        return 'Reflection'
      case 'conversation-guide':
        return 'Conversation Guide'
    }
  }

  const getTypeColor = (type: ToolType) => {
    switch (type) {
      case 'assessment':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'reflection':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'conversation-guide':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
    }
  }

  // If wizard is shown, only render wizard with back link
  if (showWizard && selectedTool) {
    return (
      <ToastProvider>
        <div>
          {/* Back link */}
          <button
            onClick={() => {
              setShowWizard(false)
              setSelectedTool(null)
            }}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to assessments</span>
          </button>
          
          {/* Campaign Creation Wizard */}
          <CampaignCreationWizard
            toolId={selectedTool.id}
            toolTitle={selectedTool.title}
            toolPath={selectedTool.path}
            toolGradient={selectedTool.gradient}
            toolIcon={selectedTool.icon}
            campaignContext="admin" // Admin launch page always creates HR_CAMPAIGN
            onClose={() => {
              setShowWizard(false)
              setSelectedTool(null)
            }}
          />
        </div>
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <div>
        <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-3">
          {filterType === 'assessment' && 'Launch Assessment Campaigns'}
          {filterType === 'reflection' && 'Reflection Tools'}
          {filterType === 'conversation-guide' && 'Conversation Guides'}
          {filterType === 'all' && 'All Tools'}
        </h2>
        <p className="text-lg text-white/80">
          {filterType === 'assessment' && 'Select an assessment below to invite your team and gather insights about their needs, challenges, and opportunities for growth.'}
          {filterType === 'reflection' && 'Tools for personal and team reflection to drive insights and growth.'}
          {filterType === 'conversation-guide' && 'Structured guides to facilitate meaningful team conversations.'}
          {filterType === 'all' && 'Choose from our complete library of assessment, reflection, and conversation tools.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className="group relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden text-left"
          >
            {/* Background gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            
            <div className="relative p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.gradient} text-white shadow-lg`}>
                  {tool.icon}
                </div>
                
                {showTypeBadges && (
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(tool.type)}`}>
                    {getTypeIcon(tool.type)}
                    {getTypeLabel(tool.type)}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {tool.title}
              </h3>
              <p className="text-sm text-white/70 mb-3">
                {tool.subtitle}
              </p>

              <p className="text-sm text-white/60 line-clamp-2 mb-6 flex-grow">
                {tool.description}
              </p>

              {/* Prominent CTA Button */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-3 rounded-lg group-hover:from-purple-700 group-hover:to-purple-800 transition-all shadow-lg group-hover:shadow-xl">
                  <span className="text-sm text-white font-semibold">
                    Launch Campaign
                  </span>
                  <ArrowRight className="w-4 h-4 text-white transition-all group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredTools.length === 0 && (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <p className="text-white/60">No tools available in this category</p>
        </div>
      )}
      </div>
    </ToastProvider>
  )
}

// Export the tools data for use in other components
export { tools }