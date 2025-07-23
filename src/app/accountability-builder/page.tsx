'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, ArrowRight, Printer, Share2, Target, Users, CheckCircle2, 
  AlertCircle, Calendar, Flag, Zap, Trophy, Lightbulb, MessageSquare,
  ClipboardList, GitBranch, BarChart3, Clock, Shield, Star, Heart,
  Brain, Rocket, Package, UserCheck, Building2, Briefcase, Award,
  TrendingUp, DollarSign, UserPlus, Shuffle, Settings, PiggyBank,
  Layers, RefreshCw, Activity, CircleDot, AlertTriangle, Timer
} from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ViewportContainer from '@/components/ViewportContainer'
import ShareButton from '@/components/ShareButton'
import ToolNavigation from '@/components/ToolNavigation'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useEmailCapture } from '@/hooks/useEmailCapture'
import { validateEmail, validateEmailRealtime, EmailValidationResult } from '@/utils/emailValidation'

// Types
interface TopOfMindData {
  majorAreas: string[]
  teamMembers: TeamMember[]
  outcomes: OutcomeStatus[]
  topThree: FocusItem[]
  focusLevel: number
  weeklyNeed: string
}

interface TeamMember {
  name: string
  reason?: string
}

interface OutcomeStatus {
  outcome: string
  status: 'at-risk' | 'needs-push' | 'on-track' | 'figuring-out'
  note?: string
}

interface FocusItem {
  item: string
  reason: string
}

// Major ownership areas
const ownershipAreas = [
  { id: 'revenue', label: 'Revenue or sales targets', icon: DollarSign },
  { id: 'customer', label: 'Customer success or retention', icon: Heart },
  { id: 'product', label: 'Product or delivery milestones', icon: Package },
  { id: 'team', label: 'Team performance or growth', icon: UserPlus },
  { id: 'collaboration', label: 'Cross-functional collaboration', icon: Shuffle },
  { id: 'culture', label: 'Culture or engagement', icon: Users },
  { id: 'efficiency', label: 'Operational efficiency', icon: Settings },
  { id: 'budget', label: 'Budget or cost management', icon: PiggyBank },
  { id: 'strategy', label: 'Strategy or planning', icon: Target },
  { id: 'change', label: 'Change or transformation efforts', icon: RefreshCw },
  { id: 'focus', label: 'My own focus / effectiveness', icon: Brain }
]

// Sample team members (in real app, would come from API/data)
const sampleTeamMembers = [
  'Alex Chen', 'Jordan Smith', 'Maria Garcia', 'David Kim', 'Sarah Johnson',
  'Michael Brown', 'Emily Davis', 'Chris Wilson', 'Lisa Anderson', 'Tom Miller'
]

// Team member tags
const memberTags = [
  { id: 'help', emoji: '🚩', label: 'Needs help' },
  { id: 'growth', emoji: '🌱', label: 'Growth focus' },
  { id: 'performance', emoji: '🎯', label: 'Performance check-in' },
  { id: 'recognition', emoji: '⭐', label: 'Recognition due' },
  { id: 'transition', emoji: '🔄', label: 'Role transition' }
]

// Outcome statuses
const outcomeStatuses = [
  { id: 'at-risk', emoji: '🚨', label: 'At risk', color: 'text-red-600 bg-red-100' },
  { id: 'needs-push', emoji: '🟡', label: 'Needs push', color: 'text-yellow-600 bg-yellow-100' },
  { id: 'on-track', emoji: '✅', label: 'On track', color: 'text-green-600 bg-green-100' },
  { id: 'figuring-out', emoji: '🧠', label: 'Still figuring it out', color: 'text-purple-600 bg-purple-100' }
]

// Focus reasons
const focusReasons = [
  'Deadline approaching',
  'Visible to senior leaders',
  'Important for a team member',
  'Causing friction',
  'Strategic impact',
  'Just feels urgent'
]

// Weekly needs
const weeklyNeeds = [
  { id: 'time', label: 'Time to think', icon: Clock },
  { id: 'priorities', label: 'Clear priorities', icon: Target },
  { id: 'support', label: 'Support from a teammate', icon: Users },
  { id: 'meetings', label: 'Fewer meetings', icon: Calendar },
  { id: 'recognition', label: 'Recognition or motivation', icon: Trophy },
  { id: 'energy', label: 'Energy reset', icon: Zap }
]

export default function TopOfMindPage() {
  const analytics = useAnalytics()
  const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
  const [currentStage, setCurrentStage] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ isValid: true })
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [startTime] = useState(Date.now())
  const [customArea, setCustomArea] = useState('')
  const [showAddNote, setShowAddNote] = useState<string | null>(null)
  const [outcomeNote, setOutcomeNote] = useState('')
  
  const [data, setData] = useState<TopOfMindData>({
    majorAreas: [],
    teamMembers: [],
    outcomes: [],
    topThree: [],
    focusLevel: 50,
    weeklyNeed: ''
  })

  // Pre-defined outcomes (in real app, would come from past entries/OKRs)
  const [availableOutcomes] = useState([
    'Q4 revenue target',
    'Product launch milestone',
    'Team hiring goals',
    'Customer satisfaction score',
    'Process improvement initiative',
    'Budget optimization',
    'Cross-team collaboration project'
  ])

  // Track tool start
  useEffect(() => {
    analytics.trackToolStart('Top of Mind')
  }, [])

  // Pre-populate email if available
  useEffect(() => {
    if (hasStoredEmail && email) {
      setUserEmail(email)
      setEmailValidation({ isValid: true })
    }
  }, [email, hasStoredEmail])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setUserEmail(newEmail)
    
    const validation = validateEmailRealtime(newEmail)
    setEmailValidation(validation)
    setShowSuggestion(!!validation.suggestion)
  }

  const handleSuggestionClick = () => {
    if (emailValidation.suggestion) {
      setUserEmail(emailValidation.suggestion)
      setEmailValidation({ isValid: true })
      setShowSuggestion(false)
    }
  }

  const handleStartAssessment = async () => {
    const finalValidation = validateEmail(userEmail)
    setEmailValidation(finalValidation)
    
    if (!finalValidation.isValid) {
      setShowSuggestion(!!finalValidation.suggestion)
      return
    }
    
    if (userEmail) {
      await captureEmailForTool(userEmail, 'Top of Mind', 'top-of-mind')
    }
    setCurrentStage(1)
  }

  const handleNext = () => {
    if (currentStage < 5) {
      setCurrentStage(currentStage + 1)
      const progress = ((currentStage + 1) / 6) * 100
      analytics.trackToolProgress('Top of Mind', `Step ${currentStage + 1}`, progress)
    } else if (currentStage === 5) {
      // Going to final stage (6)
      setCurrentStage(6)
      // Track completion
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      analytics.trackToolComplete('Top of Mind', {
        areas_count: data.majorAreas.length,
        team_members: data.teamMembers.length,
        top_three: data.topThree.length,
        completion_time: timeSpent
      })
    }
  }

  const handleBack = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
    }
  }

  const handleShare = async () => {
    const shareData = {
      type: 'top-of-mind',
      toolName: 'Top of Mind',
      data: {
        majorAreas: data.majorAreas,
        teamMembers: data.teamMembers,
        outcomes: data.outcomes,
        topThree: data.topThree,
        focusLevel: data.focusLevel,
        weeklyNeed: data.weeklyNeed,
        weekOf: new Date().toISOString()
      }
    }
    
    const response = await fetch('/api/share', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shareData)
    })
    
    if (!response.ok) {
      throw new Error('Failed to create share link')
    }
    
    const { url } = await response.json()
    const fullUrl = `${window.location.origin}${url}`
    
    // Track share event
    analytics.trackShare('Top of Mind', 'link', {
      areas_count: data.majorAreas.length,
      completion_time: Math.round((Date.now() - startTime) / 1000)
    })
    
    return fullUrl
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentStage === 0 && emailValidation.isValid && userEmail) {
        handleStartAssessment()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentStage, emailValidation.isValid, userEmail])

  // Stage rendering
  const renderStage = () => {
    switch (currentStage) {
      // Stage 0: Email Capture (Intro)
      case 0:
        return (
          <ViewportContainer className="bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] flex flex-col items-center justify-center p-4">
            <ToolNavigation />
            
            <div className="text-center text-white mb-12 max-w-3xl">
              <div className="inline-flex p-4 sm:p-6 bg-white/20 backdrop-blur-sm rounded-full mb-8">
                <Brain className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-6">Top of Mind</h1>
              <h2 className="text-3xl mb-8">Your weekly 5-minute focus ritual</h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Start your week with clarity. Quickly capture what matters most across 
                your people, responsibilities, and goals. Perfect for Monday mornings 
                or Sunday night planning.
              </p>
            </div>
            
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
              <div className="space-y-4">
                <label className="block text-lg font-medium text-white/90">
                  What's your email?
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={userEmail}
                    onChange={handleEmailChange}
                    placeholder="you@company.com"
                    className={`w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg ${
                      emailValidation.isValid ? 'border-white/30' : 'border-red-300/50'
                    }`}
                    autoComplete="email"
                  />
                </div>
                
                {!emailValidation.isValid && emailValidation.error && (
                  <div className="text-sm text-red-200 mt-1">
                    {emailValidation.error}
                  </div>
                )}
                
                {showSuggestion && emailValidation.suggestion && (
                  <button
                    type="button"
                    onClick={handleSuggestionClick}
                    className="text-sm text-white/80 hover:text-white mt-1 underline"
                  >
                    Use suggested email: {emailValidation.suggestion}
                  </button>
                )}
                
                {hasStoredEmail && (
                  <p className="text-white/70 text-sm text-center">
                    Welcome back! We've pre-filled your email.
                  </p>
                )}
              </div>
              
              <button
                onClick={handleStartAssessment}
                disabled={!emailValidation.isValid || !userEmail}
                className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors mt-6 ${
                  emailValidation.isValid && userEmail
                    ? 'bg-white text-[#3E37FF] hover:bg-white/90'
                    : 'bg-white/50 text-[#3E37FF]/50 cursor-not-allowed'
                }`}
              >
                Start My Weekly Check-In
              </button>
              
              <p className="text-white/70 text-sm text-center mt-4">
                ⏱️ Takes less than 5 minutes
              </p>
            </div>
          </ViewportContainer>
        )

      // Step 1: Zoom Out - What's Big Right Now?
      case 1:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Step 1 of 5</span>
                  <button
                    onClick={() => setCurrentStage(0)}
                    className="text-[#3E37FF] hover:text-[#2E27EF] transition-colors text-sm"
                  >
                    Start Over
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] h-2 rounded-full transition-all duration-300" style={{ width: '20%' }} />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">What's Big Right Now?</h2>
                  <p className="text-gray-600">Let's ground you in the big stuff you own.</p>
                </div>
                
                <p className="text-gray-700 mb-6">Which of these are your major areas of ownership right now?</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {ownershipAreas.map((area) => {
                    const Icon = area.icon
                    const isSelected = data.majorAreas.includes(area.label)
                    return (
                      <button
                        key={area.id}
                        onClick={() => {
                          if (isSelected) {
                            setData({ ...data, majorAreas: data.majorAreas.filter(a => a !== area.label) })
                          } else {
                            setData({ ...data, majorAreas: [...data.majorAreas, area.label] })
                          }
                        }}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-3 text-left ${
                          isSelected
                            ? 'border-[#3E37FF] bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10'
                            : 'border-gray-200 hover:border-[#3E37FF]/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-[#3E37FF]' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                          {area.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
                
                {/* Custom area input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customArea.trim()) {
                        e.preventDefault()
                        setData({ ...data, majorAreas: [...data.majorAreas, customArea.trim()] })
                        setCustomArea('')
                      }
                    }}
                    placeholder="Add custom area (optional)"
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50"
                  />
                  <button
                    onClick={() => {
                      if (customArea.trim()) {
                        setData({ ...data, majorAreas: [...data.majorAreas, customArea.trim()] })
                        setCustomArea('')
                      }
                    }}
                    disabled={!customArea.trim()}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      customArea.trim()
                        ? 'bg-[#3E37FF] text-white hover:bg-[#2E27EF]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Add
                  </button>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={data.majorAreas.length === 0}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.majorAreas.length > 0
                        ? 'bg-[#3E37FF] text-white hover:bg-[#2E27EF]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Step 2: Who's On Your Mind?
      case 2:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Step 2 of 5</span>
                  <button
                    onClick={() => setCurrentStage(0)}
                    className="text-[#3E37FF] hover:text-[#2E27EF] transition-colors text-sm"
                  >
                    Start Over
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] h-2 rounded-full transition-all duration-300" style={{ width: '40%' }} />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Who's On Your Mind?</h2>
                  <p className="text-gray-600">Tap the names of people you're thinking about this week (up to 5)</p>
                </div>
                
                <div className="space-y-4 mb-8">
                  {sampleTeamMembers.map((name) => {
                    const isSelected = data.teamMembers.some(tm => tm.name === name)
                    const memberData = data.teamMembers.find(tm => tm.name === name)
                    
                    return (
                      <div key={name} className="space-y-2">
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setData({ 
                                ...data, 
                                teamMembers: data.teamMembers.filter(tm => tm.name !== name) 
                              })
                            } else if (data.teamMembers.length < 5) {
                              setData({ 
                                ...data, 
                                teamMembers: [...data.teamMembers, { name }] 
                              })
                            }
                          }}
                          disabled={!isSelected && data.teamMembers.length >= 5}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[#3E37FF] bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10'
                              : data.teamMembers.length >= 5
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                              : 'border-gray-200 hover:border-[#3E37FF]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#3E37FF]" />
                            )}
                          </div>
                        </button>
                        
                        {isSelected && (
                          <div className="flex gap-2 ml-4">
                            {memberTags.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => {
                                  const updatedMembers = data.teamMembers.map(tm => 
                                    tm.name === name 
                                      ? { ...tm, reason: tm.reason === tag.id ? undefined : tag.id }
                                      : tm
                                  )
                                  setData({ ...data, teamMembers: updatedMembers })
                                }}
                                className={`px-3 py-1 rounded-full text-sm transition-all ${
                                  memberData?.reason === tag.id
                                    ? 'bg-[#3E37FF] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {tag.emoji} {tag.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                {data.teamMembers.length === 5 && (
                  <p className="text-center text-gray-500 text-sm mb-4">Maximum 5 people selected</p>
                )}
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-[#3E37FF] text-white rounded-lg font-medium hover:bg-[#2E27EF] transition-colors"
                  >
                    {data.teamMembers.length === 0 ? 'Skip' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Step 3: Which Outcomes Need You Most?
      case 3:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Step 3 of 5</span>
                  <button
                    onClick={() => setCurrentStage(0)}
                    className="text-[#3E37FF] hover:text-[#2E27EF] transition-colors text-sm"
                  >
                    Start Over
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] h-2 rounded-full transition-all duration-300" style={{ width: '60%' }} />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Which Outcomes Need You Most?</h2>
                  <p className="text-gray-600">Not everything needs your attention. But something does.</p>
                </div>
                
                <p className="text-gray-700 mb-6">Select outcomes that are top of mind this week:</p>
                
                <div className="space-y-3">
                  {availableOutcomes.map((outcome) => {
                    const outcomeData = data.outcomes.find(o => o.outcome === outcome)
                    const isSelected = !!outcomeData
                    
                    return (
                      <div key={outcome} className="space-y-2">
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setData({ 
                                ...data, 
                                outcomes: data.outcomes.filter(o => o.outcome !== outcome) 
                              })
                              if (showAddNote === outcome) setShowAddNote(null)
                            } else {
                              setData({ 
                                ...data, 
                                outcomes: [...data.outcomes, { outcome, status: 'on-track' }] 
                              })
                            }
                          }}
                          className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                            isSelected
                              ? 'border-[#3E37FF] bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10'
                              : 'border-gray-200 hover:border-[#3E37FF]/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                              {outcome}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-[#3E37FF]" />
                            )}
                          </div>
                        </button>
                        
                        {isSelected && (
                          <div className="ml-4 space-y-2">
                            <div className="flex gap-2">
                              {outcomeStatuses.map((status) => (
                                <button
                                  key={status.id}
                                  onClick={() => {
                                    const updatedOutcomes = data.outcomes.map(o => 
                                      o.outcome === outcome 
                                        ? { ...o, status: status.id as any }
                                        : o
                                    )
                                    setData({ ...data, outcomes: updatedOutcomes })
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                                    outcomeData?.status === status.id
                                      ? status.color
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {status.emoji} {status.label}
                                </button>
                              ))}
                            </div>
                            
                            {showAddNote === outcome ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={outcomeNote}
                                  onChange={(e) => setOutcomeNote(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && outcomeNote.trim()) {
                                      const updatedOutcomes = data.outcomes.map(o => 
                                        o.outcome === outcome 
                                          ? { ...o, note: outcomeNote.trim() }
                                          : o
                                      )
                                      setData({ ...data, outcomes: updatedOutcomes })
                                      setOutcomeNote('')
                                      setShowAddNote(null)
                                    }
                                  }}
                                  placeholder="Quick note..."
                                  className="flex-1 px-3 py-1 text-sm bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50"
                                  autoFocus
                                />
                                <button
                                  onClick={() => {
                                    if (outcomeNote.trim()) {
                                      const updatedOutcomes = data.outcomes.map(o => 
                                        o.outcome === outcome 
                                          ? { ...o, note: outcomeNote.trim() }
                                          : o
                                      )
                                      setData({ ...data, outcomes: updatedOutcomes })
                                    }
                                    setOutcomeNote('')
                                    setShowAddNote(null)
                                  }}
                                  className="px-3 py-1 text-sm bg-[#3E37FF] text-white rounded hover:bg-[#2E27EF]"
                                >
                                  Save
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setShowAddNote(outcome)
                                  setOutcomeNote(outcomeData?.note || '')
                                }}
                                className="text-sm text-[#3E37FF] hover:text-[#2E27EF]"
                              >
                                {outcomeData?.note ? '✏️ Edit note' : '📝 Add note (optional)'}
                              </button>
                            )}
                            
                            {outcomeData?.note && showAddNote !== outcome && (
                              <p className="text-sm text-gray-600 italic">"{outcomeData.note}"</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-8 py-3 bg-[#3E37FF] text-white rounded-lg font-medium hover:bg-[#2E27EF] transition-colors"
                  >
                    {data.outcomes.length === 0 ? 'Skip' : 'Continue'}
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Step 4: Your Focus Filter
      case 4:
        const allFocusOptions = [
          ...data.majorAreas.map(area => ({ type: 'area', value: area })),
          ...data.teamMembers.map(tm => ({ type: 'person', value: tm.name })),
          ...data.outcomes.map(o => ({ type: 'outcome', value: o.outcome }))
        ]
        
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Step 4 of 5</span>
                  <button
                    onClick={() => setCurrentStage(0)}
                    className="text-[#3E37FF] hover:text-[#2E27EF] transition-colors text-sm"
                  >
                    Start Over
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] h-2 rounded-full transition-all duration-300" style={{ width: '80%' }} />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Focus Filter</h2>
                  <p className="text-gray-600">You only get to pick three.</p>
                  <p className="text-gray-500 text-sm mt-2">If you could only make progress on THREE things this week... what would they be?</p>
                </div>
                
                {data.topThree.length < 3 && allFocusOptions.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-3">Choose from your earlier selections:</p>
                    <div className="space-y-2">
                      {allFocusOptions.map((option, index) => {
                        const isSelected = data.topThree.some(t => t.item === option.value)
                        if (isSelected) return null
                        
                        return (
                          <button
                            key={index}
                            onClick={() => {
                              if (data.topThree.length < 3) {
                                setData({
                                  ...data,
                                  topThree: [...data.topThree, { item: option.value, reason: '' }]
                                })
                              }
                            }}
                            className="w-full p-3 rounded-lg border border-gray-200 hover:border-[#3E37FF]/50 text-left transition-all"
                          >
                            <div className="flex items-center gap-2">
                              {option.type === 'area' && <Target className="w-4 h-4 text-gray-500" />}
                              {option.type === 'person' && <Users className="w-4 h-4 text-gray-500" />}
                              {option.type === 'outcome' && <Flag className="w-4 h-4 text-gray-500" />}
                              <span className="text-gray-700">{option.value}</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 mb-6">
                  {[0, 1, 2].map((index) => {
                    const focusItem = data.topThree[index]
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-[#3E37FF] text-white rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </span>
                          {focusItem ? (
                            <div className="flex-1">
                              <div className="p-3 bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">{focusItem.item}</span>
                                  <button
                                    onClick={() => {
                                      setData({
                                        ...data,
                                        topThree: data.topThree.filter(t => t.item !== focusItem.item)
                                      })
                                    }}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <input
                              type="text"
                              placeholder="Type a custom priority..."
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                  setData({
                                    ...data,
                                    topThree: [...data.topThree, { item: e.currentTarget.value.trim(), reason: '' }]
                                  })
                                  e.currentTarget.value = ''
                                }
                              }}
                              className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50"
                            />
                          )}
                        </div>
                        
                        {focusItem && (
                          <div className="ml-11">
                            <p className="text-sm text-gray-600 mb-2">Why this?</p>
                            <div className="flex flex-wrap gap-2">
                              {focusReasons.map((reason) => (
                                <button
                                  key={reason}
                                  onClick={() => {
                                    const updatedTop = data.topThree.map(t => 
                                      t.item === focusItem.item 
                                        ? { ...t, reason: t.reason === reason ? '' : reason }
                                        : t
                                    )
                                    setData({ ...data, topThree: updatedTop })
                                  }}
                                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                                    focusItem.reason === reason
                                      ? 'bg-[#3E37FF] text-white'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                >
                                  {reason}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={data.topThree.length === 0}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.topThree.length > 0
                        ? 'bg-[#3E37FF] text-white hover:bg-[#2E27EF]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Step 5: Reflect + Reset
      case 5:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">Step 5 of 5</span>
                  <button
                    onClick={() => setCurrentStage(0)}
                    className="text-[#3E37FF] hover:text-[#2E27EF] transition-colors text-sm"
                  >
                    Start Over
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] h-2 rounded-full transition-all duration-300" style={{ width: '100%' }} />
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Reflect + Reset</h2>
                  <p className="text-gray-600">One final pulse before you start the week.</p>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <p className="text-gray-700 mb-4">How focused do you feel right now?</p>
                    <div className="relative">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>🌀 Scattered</span>
                        <span>🎯 Laser Focused</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={data.focusLevel}
                        onChange={(e) => setData({ ...data, focusLevel: parseInt(e.target.value) })}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #C67AF4 0%, #3E37FF ${data.focusLevel}%, #e5e7eb ${data.focusLevel}%, #e5e7eb 100%)`
                        }}
                      />
                      <div className="text-center mt-2">
                        <span className="text-2xl font-bold text-[#3E37FF]">{data.focusLevel}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-700 mb-4">What do you need most this week?</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {weeklyNeeds.map((need) => {
                        const Icon = need.icon
                        const isSelected = data.weeklyNeed === need.id
                        
                        return (
                          <button
                            key={need.id}
                            onClick={() => setData({ ...data, weeklyNeed: need.id })}
                            className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'border-[#3E37FF] bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10'
                                : 'border-gray-200 hover:border-[#3E37FF]/50'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-[#3E37FF]' : 'text-gray-500'}`} />
                            <span className={`text-sm ${isSelected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                              {need.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!data.weeklyNeed}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.weeklyNeed
                        ? 'bg-[#3E37FF] text-white hover:bg-[#2E27EF]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 6: Top of Mind Snapshot (Final)
      case 6:
        const weekOfDate = new Date()
        const weekString = `Week of ${weekOfDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        const selectedNeed = weeklyNeeds.find(n => n.id === data.weeklyNeed)
        
        return (
          <>
            <style jsx>{`
              @media print {
                body * {
                  visibility: hidden;
                }
                .print-section, .print-section * {
                  visibility: visible;
                }
                .print-section {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
                .no-print {
                  display: none !important;
                }
                @page {
                  margin: 0.5in;
                  size: letter;
                }
              }
              .slider::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                background: #3E37FF;
                cursor: pointer;
                border-radius: 50%;
              }
              .slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: #3E37FF;
                cursor: pointer;
                border-radius: 50%;
                border: none;
              }
            `}</style>
            <ViewportContainer className="bg-gradient-to-br from-[#C67AF4]/20 to-[#3E37FF]/20 min-h-screen p-4 print-section">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center no-print">
                  <button
                    onClick={() => {
                      setCurrentStage(0)
                      setData({
                        majorAreas: [],
                        teamMembers: [],
                        outcomes: [],
                        topThree: [],
                        focusLevel: 50,
                        weeklyNeed: ''
                      })
                    }}
                    className="inline-flex items-center text-[#3E37FF] hover:text-[#2E27EF] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Start New Week
                  </button>
                  
                  <div className="flex gap-2 sm:gap-4">
                    <button
                      onClick={() => {
                        analytics.trackDownload('Print', 'Top of Mind')
                        window.print()
                      }}
                      className="p-2.5 sm:p-3 border-2 border-[#3E37FF]/50 text-[#3E37FF] rounded-lg hover:border-[#3E37FF] hover:bg-[#3E37FF]/10 transition-all"
                      title="Print snapshot"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <ShareButton
                      onShare={handleShare}
                      className="px-3 sm:px-6 py-2.5 bg-[#3E37FF] hover:bg-[#2E27EF] text-white rounded-lg font-semibold transition-colors"
                    >
                      <Share2 className="w-5 h-5 inline sm:hidden" />
                      <span className="hidden sm:inline uppercase tracking-wider">Share</span>
                    </ShareButton>
                  </div>
                </div>
                
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">Top of Mind</h1>
                  <p className="text-gray-600">{weekString}</p>
                </div>
                
                <div className="space-y-6">
                  {/* Top 3 Focus Areas */}
                  <div className="bg-white rounded-2xl shadow-sm border border-[#3E37FF]/20 p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">My Top 3 Focus Areas</h3>
                    </div>
                    <div className="space-y-3">
                      {data.topThree.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-8 h-8 bg-[#3E37FF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{item.item}</p>
                            {item.reason && (
                              <p className="text-sm text-gray-600 mt-1">Why: {item.reason}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* People on My Mind */}
                  {data.teamMembers.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#3E37FF]/20 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">People on My Mind</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.teamMembers.map((member, index) => {
                          const tag = memberTags.find(t => t.id === member.reason)
                          return (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium text-gray-900">{member.name}</span>
                              {tag && (
                                <span className="text-sm text-gray-600">
                                  {tag.emoji} {tag.label}
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Outcomes Needing Attention */}
                  {data.outcomes.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#3E37FF]/20 p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-full flex items-center justify-center">
                          <Flag className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Outcomes Needing Attention</h3>
                      </div>
                      <div className="space-y-3">
                        {data.outcomes.map((outcome, index) => {
                          const status = outcomeStatuses.find(s => s.id === outcome.status)
                          return (
                            <div key={index} className="border-l-4 border-gray-200 pl-4">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-900">{outcome.outcome}</span>
                                {status && (
                                  <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                                    {status.emoji} {status.label}
                                  </span>
                                )}
                              </div>
                              {outcome.note && (
                                <p className="text-sm text-gray-600 mt-1 italic">"{outcome.note}"</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Bottom Grid */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Focus Level */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#3E37FF]/20 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-full flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Focus Level</h3>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-[#3E37FF] mb-2">{data.focusLevel}%</div>
                        <p className="text-gray-600">
                          {data.focusLevel < 30 ? '🌀 Feeling scattered' : 
                           data.focusLevel < 70 ? '⚡ Getting there' : 
                           '🎯 Laser focused'}
                        </p>
                      </div>
                    </div>
                    
                    {/* What I Need */}
                    <div className="bg-white rounded-2xl shadow-sm border border-[#3E37FF]/20 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">What I Need</h3>
                      </div>
                      {selectedNeed && (
                        <div className="flex items-center gap-3">
                          <selectedNeed.icon className="w-6 h-6 text-[#3E37FF]" />
                          <span className="text-lg text-gray-900">{selectedNeed.label}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Major Areas (smaller) */}
                  {data.majorAreas.length > 0 && (
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Major Areas of Ownership</h3>
                      <div className="flex flex-wrap gap-2">
                        {data.majorAreas.map((area, index) => (
                          <span key={index} className="px-3 py-1 bg-white text-gray-700 rounded-full text-sm border border-gray-200">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="mt-12 flex flex-col items-center gap-4 no-print">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-[#3E37FF]/20">
                    <p className="text-gray-700 text-center mb-3">
                      📆 Want to make this a habit?
                    </p>
                    <button className="px-6 py-2 bg-[#3E37FF] text-white rounded-lg hover:bg-[#2E27EF] transition-colors">
                      Set Weekly Reminder
                    </button>
                  </div>
                  
                  <div className="flex gap-4">
                    <Link
                      href="/"
                      className="text-[#3E37FF] hover:text-[#2E27EF] transition-colors font-medium"
                    >
                      Explore all Tools
                    </Link>
                    <button
                      onClick={() => {
                        setCurrentStage(0)
                        setData({
                          majorAreas: [],
                          teamMembers: [],
                          outcomes: [],
                          topThree: [],
                          focusLevel: 50,
                          weeklyNeed: ''
                        })
                      }}
                      className="px-8 py-3 bg-[#3E37FF] text-white rounded-lg font-semibold hover:bg-[#2E27EF] transition-colors"
                    >
                      START NEW WEEK
                    </button>
                  </div>
                </div>
              </div>
            </ViewportContainer>
          </>
        )

      default:
        return null
    }
  }

  return (
    <>
      {renderStage()}
      {currentStage === 6 && <Footer />}
    </>
  )
}