'use client'

import React, { useState, useEffect, useRef } from 'react'
import { 
  Users, Target, Brain, Rocket, TrendingUp, 
  ArrowRight, Sparkles, Heart, Shield, Zap,
  CheckCircle, Circle, ChevronRight
} from 'lucide-react'

interface JourneyStep {
  id: number
  icon: React.ElementType
  title: string
  subtitle: string
  description: string
  color: string
  bgGradient: string
  borderColor: string
  outcome: string
}

interface StartTabProps {
  onNavigate?: (tab: string) => void
}

export default function StartTab({ onNavigate }: StartTabProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [expandedStep, setExpandedStep] = useState<number | null>(null)
  const [paths, setPaths] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const stepRefs = useRef<(HTMLDivElement | null)[]>([])

  const journeySteps: JourneyStep[] = [
    {
      id: 1,
      icon: Users,
      title: "Identify Your Champions",
      subtitle: "Start with the people who matter most",
      description: "Every transformation begins with people. We'll help you identify the key leaders and teams who are ready for growth - those experiencing challenges, driving critical initiatives, or simply hungry to level up. These aren't just participants; they're your change champions who will ripple impact throughout your organization.",
      color: "text-blue-400",
      bgGradient: "from-blue-600/20 to-cyan-600/20",
      borderColor: "border-blue-500/30",
      outcome: "Turn managers into multipliers"
    },
    {
      id: 2,
      icon: Target,
      title: "Diagnose Real Needs",
      subtitle: "Uncover what's really holding your team back",
      description: "Generic training fails because it guesses at problems. Our assessment tools reveal the actual challenges your people face - from burnout and trust issues to delegation struggles and change resistance. This isn't about checking boxes; it's about understanding the human dynamics that drive or derail performance.",
      color: "text-purple-400",
      bgGradient: "from-purple-600/20 to-pink-600/20",
      borderColor: "border-purple-500/30",
      outcome: "Move from assumptions to insights"
    },
    {
      id: 3,
      icon: Brain,
      title: "Get AI-Powered Recommendations",
      subtitle: "Let intelligence guide your investment",
      description: "Our AI analyzes your team's assessment data to recommend precisely which workshops and tools will create the most impact. No more spray-and-pray training. Every recommendation is backed by data showing exactly why it matches your team's needs. Spend time and budget only on what will actually move the needle.",
      color: "text-emerald-400",
      bgGradient: "from-emerald-600/20 to-teal-600/20",
      borderColor: "border-emerald-500/30",
      outcome: "Precision-targeted development"
    },
    {
      id: 4,
      icon: Rocket,
      title: "Launch Transformative Experiences",
      subtitle: "Deploy workshops and tools that create real change",
      description: "This isn't passive learning - it's active transformation. Our live workshops create psychological safety, spark vulnerable conversations, and build lasting habits. Your people don't just learn concepts; they practice new behaviors in real-time, with their actual challenges, getting coaching that sticks.",
      color: "text-orange-400",
      bgGradient: "from-orange-600/20 to-red-600/20",
      borderColor: "border-orange-500/30",
      outcome: "From knowing to doing"
    },
    {
      id: 5,
      icon: TrendingUp,
      title: "Measure & Amplify Impact",
      subtitle: "Track progress and scale what works",
      description: "See the transformation unfold through follow-up assessments and engagement metrics. Identify which interventions created breakthroughs, then scale them across teams. Build on momentum by celebrating wins and adjusting your approach based on real results. This is how culture change happens - systematically, measurably, sustainably.",
      color: "text-green-400",
      bgGradient: "from-green-600/20 to-lime-600/20",
      borderColor: "border-green-500/30",
      outcome: "Compound your investment"
    }
  ]

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate('onboarding')
    }
  }

  // Calculate SVG paths between step boxes
  useEffect(() => {
    const calculatePaths = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const newPaths: string[] = []

      // Calculate path between each pair of consecutive steps
      for (let i = 0; i < stepRefs.current.length - 1; i++) {
        const currentStep = stepRefs.current[i]
        const nextStep = stepRefs.current[i + 1]

        if (currentStep && nextStep) {
          const currentRect = currentStep.getBoundingClientRect()
          const nextRect = nextStep.getBoundingClientRect()

          // Calculate relative positions within the container
          const currentX = currentRect.left - containerRect.left
          const currentY = currentRect.top - containerRect.top
          const currentWidth = currentRect.width
          const currentHeight = currentRect.height

          const nextX = nextRect.left - containerRect.left
          const nextY = nextRect.top - containerRect.top
          const nextWidth = nextRect.width

          // Determine connection points based on zigzag pattern
          let startX, startY, endX, endY

          if (i % 2 === 0) {
            // Even index: current is on left, next is on right
            // Connect from right-center of current to top-center of next
            startX = currentX + currentWidth
            startY = currentY + currentHeight / 2
            endX = nextX + nextWidth / 2
            endY = nextY
          } else {
            // Odd index: current is on right, next is on left
            // Connect from left-center of current to top-center of next
            startX = currentX
            startY = currentY + currentHeight / 2
            endX = nextX + nextWidth / 2
            endY = nextY
          }

          // Create a curved path
          const midX = (startX + endX) / 2
          const midY = (startY + endY) / 2
          
          const path = `M ${startX} ${startY} Q ${midX} ${startY} ${midX} ${midY} T ${endX} ${endY}`
          newPaths.push(path)
        }
      }

      setPaths(newPaths)
    }

    // Calculate on mount and window resize
    calculatePaths()
    window.addEventListener('resize', calculatePaths)
    
    // Recalculate when steps expand/collapse
    const timeout = setTimeout(calculatePaths, 350)

    return () => {
      window.removeEventListener('resize', calculatePaths)
      clearTimeout(timeout)
    }
  }, [expandedStep])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full mb-6 border border-yellow-500/30">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-yellow-300">Your Leadership Transformation Journey</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Transform Your Leaders.
          <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Transform Your Culture.
          </span>
        </h1>
        
        <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
          Stop guessing what your team needs. Start delivering exactly what will unlock their potential. 
          Here's how we'll create lasting change together:
        </p>
      </div>

      {/* Journey Path Visualization - Grid Layout */}
      <div className="relative mb-12 w-full max-w-7xl mx-auto px-4" ref={containerRef}>
        {/* SVG Overlay for Connectors */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
          style={{ zIndex: 0 }}
        >
          <defs>
            <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0.8)" />
              <stop offset="50%" stopColor="rgba(236, 72, 153, 0.8)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0.8)" />
            </linearGradient>
          </defs>
          {paths.map((path, index) => (
            <path
              key={index}
              d={path}
              fill="none"
              stroke="url(#pathGradient)"
              strokeWidth="3"
              strokeDasharray="6 4"
              opacity="0.9"
            />
          ))}
        </svg>
        
        {/* Journey Steps - 2-Column Grid Layout with each step on its own row (stacks on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative" style={{ zIndex: 1 }}>
          
          {journeySteps.map((step, index) => {
            const Icon = step.icon
            const isHovered = hoveredStep === step.id
            const isExpanded = expandedStep === step.id
            
            // Create the step component
            const stepComponent = (
              <div
                ref={el => { stepRefs.current[index] = el }}
                className={`relative bg-gradient-to-br ${step.bgGradient} backdrop-blur-sm rounded-2xl border ${step.borderColor} transition-all duration-300 cursor-pointer
                  ${isHovered ? 'transform -translate-y-1 shadow-2xl' : ''}
                  ${isExpanded ? 'ring-2 ring-white/20' : ''}`}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
                onClick={() => setExpandedStep(isExpanded ? null : step.id)}
              >
                <div className="p-4 sm:p-6 flex flex-col">
                  {/* Step Header */}
                  <div className="flex items-start gap-3 sm:gap-4 mb-3">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${step.bgGradient} border ${step.borderColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${step.color}`} />
                    </div>
                    <div className="flex-1">
                      <span className={`text-xs font-bold ${step.color}`}>STEP {step.id}</span>
                      <h3 className="text-base sm:text-lg font-bold text-white mt-1">{step.title}</h3>
                      <p className="text-xs sm:text-sm text-white/70 mt-1">{step.subtitle}</p>
                    </div>
                  </div>
                  
                  {/* Expandable Content */}
                  <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                        {step.description}
                      </p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border ${step.borderColor} mt-3`}>
                        <Zap className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs font-medium text-white/90">{step.outcome}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
            
            // Return either the step in the correct column or an empty div
            // Each step gets its own row by adding empty cells
            if (index === 0) {
              // Step 1: Row 1, Column 1
              return (
                <React.Fragment key={step.id}>
                  <div className="relative">
                    {stepComponent}
                  </div>
                  <div className="hidden md:block"></div>
                </React.Fragment>
              )
            } else if (index === 1) {
              // Step 2: Row 2, Column 2
              return (
                <React.Fragment key={step.id}>
                  <div className="hidden md:block"></div>
                  <div className="relative">
                    {stepComponent}
                  </div>
                </React.Fragment>
              )
            } else if (index === 2) {
              // Step 3: Row 3, Column 1
              return (
                <React.Fragment key={step.id}>
                  <div className="relative">
                    {stepComponent}
                  </div>
                  <div className="hidden md:block"></div>
                </React.Fragment>
              )
            } else if (index === 3) {
              // Step 4: Row 4, Column 2
              return (
                <React.Fragment key={step.id}>
                  <div className="hidden md:block"></div>
                  <div className="relative">
                    {stepComponent}
                  </div>
                </React.Fragment>
              )
            } else if (index === 4) {
              // Step 5: Row 5, Column 1
              return (
                <React.Fragment key={step.id}>
                  <div className="relative">
                    {stepComponent}
                  </div>
                  <div className="hidden md:block"></div>
                </React.Fragment>
              )
            }
            return null
          })}
          
        </div>
      </div>

      {/* Why This Works Section */}
      <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-8 border border-indigo-500/30 mb-12">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Why This Journey Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-3">
              <Heart className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Human-Centered</h3>
            <p className="text-sm text-white/70">We start with real people facing real challenges, not generic competency models</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Evidence-Based</h3>
            <p className="text-sm text-white/70">Every recommendation is backed by data from your actual team assessments</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-3">
              <Zap className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="font-semibold text-white mb-2">Action-Oriented</h3>
            <p className="text-sm text-white/70">Live workshops create immediate behavior change, not just awareness</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <div className="inline-flex flex-col items-center">
          <p className="text-white/60 mb-4">Ready to stop wasting time on training that doesn't stick?</p>
          <button
            onClick={handleGetStarted}
            className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-3"
          >
            <span>Begin Your Journey</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="text-xs text-white/40 mt-3">Takes just 5 minutes to get started</p>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-16 pt-8 border-t border-white/10 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mt-8">
          <div>
            <div className="text-3xl font-bold text-white mb-1">87%</div>
            <div className="text-sm text-white/60">Report improved team performance</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">3x</div>
            <div className="text-sm text-white/60">More effective than generic training</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">15min</div>
            <div className="text-sm text-white/60">Average assessment completion</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-1">92%</div>
            <div className="text-sm text-white/60">Would recommend to peers</div>
          </div>
        </div>
      </div>
    </div>
  )
}