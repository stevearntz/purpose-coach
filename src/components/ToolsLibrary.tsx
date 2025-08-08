'use client'

import React from 'react'
import { 
  Users, Shield, Heart, Brain, ArrowRight, 
  Lightbulb, Sparkles, Target, RefreshCw 
} from 'lucide-react'

interface Tool {
  id: string
  path: string
  title: string
  subtitle: string
  description: string
  gradient: string
  icon: React.ReactNode
}

const tools: Tool[] = [
  {
    id: 'team-charter',
    path: '/team-charter',
    title: 'Team Charter',
    subtitle: 'Align your team',
    description: 'Create clarity and alignment on your team\'s purpose, values, and ways of working.',
    gradient: 'from-[#FF6B6B] to-[#4ECDC4]',
    icon: <Users className="w-8 h-8" />
  },
  {
    id: 'trust-audit',
    path: '/trust-audit',
    title: 'Trust Audit',
    subtitle: 'Build stronger relationships',
    description: 'Assess trust across key dimensions to strengthen your professional relationships.',
    gradient: 'from-[#FFA62A] to-[#DB4839]',
    icon: <Shield className="w-8 h-8" />
  },
  {
    id: 'burnout-assessment',
    path: '/burnout-assessment',
    title: 'Burnout Assessment',
    subtitle: 'Check your energy levels',
    description: 'Evaluate your current state and get strategies for maintaining well-being.',
    gradient: 'from-[#74DEDE] to-[#30B859]',
    icon: <Heart className="w-8 h-8" />
  },
  {
    id: 'decision-audit',
    path: '/decision-making-audit',
    title: 'Decision Making Audit',
    subtitle: 'Improve your decisions',
    description: 'Evaluate how you make decisions to identify strengths and growth areas.',
    gradient: 'from-[#6DC7FF] to-[#3C36FF]',
    icon: <Brain className="w-8 h-8" />
  },
  {
    id: 'change-style',
    path: '/change-style',
    title: 'Change Style Profile',
    subtitle: 'Discover your change persona',
    description: 'Understand how you naturally respond to change and get strategies for navigating transitions.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    icon: <ArrowRight className="w-8 h-8" />
  },
  {
    id: 'change-readiness',
    path: '/change-readiness-assessment',
    title: 'Change Readiness Assessment',
    subtitle: 'Navigate change confidently',
    description: 'Assess your readiness for change and identify where you need support.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    icon: <ArrowRight className="w-8 h-8" />
  },
  {
    id: 'user-guide',
    path: '/user-guide',
    title: 'User Guide',
    subtitle: 'Create your user guide',
    description: 'Build a shareable guide that helps others collaborate effectively with you.',
    gradient: 'from-[#30C7C7] to-[#2A74B9]',
    icon: <Lightbulb className="w-8 h-8" />
  },
  {
    id: 'expectations-reflection',
    path: '/expectations-reflection',
    title: 'Expectations Reflection',
    subtitle: 'Surface team dynamics',
    description: 'Create psychological safety by sharing hopes, fears, and expectations.',
    gradient: 'from-[#C67AF4] to-[#3E37FF]',
    icon: <Heart className="w-8 h-8" />
  },
  {
    id: 'drivers-reflection',
    path: '/drivers-reflection',
    title: 'Drivers Reflection',
    subtitle: 'Understand motivations',
    description: 'Identify and prioritize what truly drives you in your career.',
    gradient: 'from-[#FBBF24] to-[#F59E0B]',
    icon: <Sparkles className="w-8 h-8" />
  },
  {
    id: 'coaching-cards',
    path: '/coaching-cards',
    title: 'Coaching Cards',
    subtitle: 'Guided reflection',
    description: 'Use powerful questions to guide self-reflection and growth.',
    gradient: 'from-[#D4F564] to-[#87AE05]',
    icon: <Lightbulb className="w-8 h-8" />
  },
  {
    id: 'change-reflection',
    path: '/change-reflection',
    title: 'Change Reflection',
    subtitle: '1:1 conversation prep',
    description: 'Prepare for meaningful conversations about change with your team members.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    icon: <RefreshCw className="w-8 h-8" />
  },
  {
    id: 'focus-finder',
    path: '/accountability-builder',
    title: 'Focus Finder',
    subtitle: '5-minute weekly check-in',
    description: 'A rapid weekly reflection to surface what really matters.',
    gradient: 'from-[#C67AF4] to-[#3E37FF]',
    icon: <Target className="w-8 h-8" />
  },
  {
    id: 'hr-partnership',
    path: '/hr-partnership',
    title: 'HR Partnership Assessment',
    subtitle: 'Bridge the gap with HR',
    description: 'Help managers articulate their needs for growth, support, and strategic direction.',
    gradient: 'from-[#30C7C7] to-[#2A74B9]',
    icon: <Lightbulb className="w-8 h-8" />
  }
]

interface ToolsLibraryProps {
  onToolClick: (toolId: string, toolTitle: string, toolPath: string) => void
}

export default function ToolsLibrary({ onToolClick }: ToolsLibraryProps) {
  const handleToolClick = (tool: Tool) => {
    // Instead of going to the tool directly, go to the invite page for that tool
    onToolClick(tool.id, tool.title, `/dashboard/tools/${tool.id}/invite`)
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Content Library</h2>
        <p className="text-white/70">
          Select a tool to invite team members to use it
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool)}
            className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl text-left"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
            
            <div className="relative p-6">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tool.gradient} text-white mb-4 shadow-lg`}>
                {tool.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-1">
                {tool.title}
              </h3>
              <p className="text-sm text-white/70 mb-3">
                {tool.subtitle}
              </p>

              <p className="text-sm text-white/60 line-clamp-2">
                {tool.description}
              </p>

              {/* Hover indicator */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                  <ArrowRight className="w-4 h-4 text-white/80" />
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}