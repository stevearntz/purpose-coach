'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, ArrowRight, Printer, Share2, Target, Users, CheckCircle2, 
  AlertCircle, Calendar, Flag, Zap, Trophy, Lightbulb, MessageSquare,
  ClipboardList, GitBranch, BarChart3, Clock, Shield, Star, Heart,
  Brain, Rocket, Package, UserCheck, Building2, Briefcase, Award,
  TrendingUp, DollarSign, UserPlus, Shuffle, Settings, PiggyBank,
  Layers, RefreshCw, Activity, CircleDot, AlertTriangle, Timer, X, Plus
} from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ViewportContainer from '@/components/ViewportContainer'
import ShareButton from '@/components/ShareButton'
import ToolNavigation from '@/components/ToolNavigation'
import ToolProgressIndicator from '@/components/ToolProgressIndicator'
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
  needDescription?: string
  currentStage?: number
}

interface TeamMember {
  name: string
  reasons?: string[]
}

interface OutcomeStatus {
  outcome: string
  status: 'at-risk' | 'needs-push' | 'on-track' | 'figuring-out'
  note?: string
  relatedAreas?: string[]
}

interface FocusItem {
  item: string
  reason: string
  note?: string
  supportPeople?: SupportPerson[]
}

interface SupportPerson {
  name: string
  how: string
}

// Major ownership areas
const ownershipAreas = [
  { id: 'revenue', label: 'Revenue, sales, or growth targets', shortLabel: 'Revenue', icon: DollarSign },
  { id: 'customer', label: 'Customer success or retention', shortLabel: 'Customer', icon: Heart },
  { id: 'product', label: 'Product or delivery milestones', shortLabel: 'Product', icon: Package },
  { id: 'team', label: 'Team performance or growth', shortLabel: 'Team', icon: UserPlus },
  { id: 'collaboration', label: 'Cross-functional collaboration', shortLabel: 'Collaboration', icon: Shuffle },
  { id: 'culture', label: 'Culture or engagement', shortLabel: 'Culture', icon: Users },
  { id: 'efficiency', label: 'Operational efficiency', shortLabel: 'Efficiency', icon: Settings },
  { id: 'budget', label: 'Budget or cost management', shortLabel: 'Budget', icon: PiggyBank },
  { id: 'strategy', label: 'Strategy or planning', shortLabel: 'Strategy', icon: Target },
  { id: 'change', label: 'Change or transformation efforts', shortLabel: 'Change', icon: RefreshCw },
  { id: 'focus', label: 'My own focus / effectiveness', shortLabel: 'Focus', icon: Brain },
  { id: 'risk', label: 'Risk management or compliance', shortLabel: 'Risk', icon: Shield }
]

// Sample team members (in real app, would come from API/data)
const sampleTeamMembers = [
  'Alex Chen', 'Jordan Smith', 'Maria Garcia', 'David Kim', 'Sarah Johnson',
  'Michael Brown', 'Emily Davis', 'Chris Wilson', 'Lisa Anderson', 'Tom Miller'
]

// Team member tags
const memberTags = [
  { id: 'help', emoji: '🚩', label: 'Help' },
  { id: 'grow', emoji: '🌱', label: 'Grow' },
  { id: 'check-in', emoji: '🎯', label: 'Check-in' },
  { id: 'recognize', emoji: '⭐', label: 'Recognize' },
  { id: 'align', emoji: '🤝', label: 'Align' },
  { id: 'delegate', emoji: '📋', label: 'Delegate' },
  { id: 'unblock', emoji: '🚧', label: 'Unblock' }
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
  'Deadline',
  'Visibility',
  'Friction',
  'Impact',
  'Urgency',
  'Importance'
]

// Weekly needs
const weeklyNeeds = [
  { id: 'time', label: 'Time to think', icon: Clock },
  { id: 'priorities', label: 'Clear priorities', icon: Target },
  { id: 'support', label: 'Support from a teammate', icon: Users },
  { id: 'meetings', label: 'Fewer meetings', icon: Calendar },
  { id: 'recognition', label: 'Recognition or motivation', icon: Trophy },
  { id: 'energy', label: 'An energy reset', icon: Zap }
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
  const [showAddNote, setShowAddNote] = useState<number | null>(null)
  const [outcomeNote, setOutcomeNote] = useState('')
  const [teamMemberInput, setTeamMemberInput] = useState('')
  const [outcomeInput, setOutcomeInput] = useState('')
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set())
  const [customNeed, setCustomNeed] = useState('')
  const [needDescription, setNeedDescription] = useState('')
  const [showSupportInput, setShowSupportInput] = useState<number | null>(null)
  const [supportPersonInput, setSupportPersonInput] = useState('')
  const [supportHowInput, setSupportHowInput] = useState('')
  const [editingSupportIndex, setEditingSupportIndex] = useState<number | null>(null)
  
  const [data, setData] = useState<TopOfMindData>({
    majorAreas: [],
    teamMembers: [],
    outcomes: [],
    topThree: [],
    focusLevel: 50,
    weeklyNeed: '',
    needDescription: ''
  })


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
    if (currentStage < 6) {
      // Mark current stage as completed
      setCompletedStages(prev => new Set([...prev, currentStage]))
      setCurrentStage(currentStage + 1)
      const progress = ((currentStage + 1) / 7) * 100
      analytics.trackToolProgress('Top of Mind', `Step ${currentStage + 1}`, progress)
    } else if (currentStage === 6) {
      // Mark stage 6 as completed
      setCompletedStages(prev => new Set([...prev, 6]))
      // Going to final stage (7)
      setCurrentStage(7)
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
        weeklyNeed: data.weeklyNeed === 'custom' ? customNeed : data.weeklyNeed,
        needDescription: data.needDescription,
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

  // Helper function for navigation header
  const renderNavigationHeader = (step: number) => (
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={() => {
          setCurrentStage(0)
          setData({
            majorAreas: [],
            teamMembers: [],
            outcomes: [],
            topThree: [],
            focusLevel: 50,
            weeklyNeed: '',
            needDescription: ''
          })
          setCompletedStages(new Set())
        }}
        className="flex items-center gap-2 text-[#3E37FF] hover:text-[#2E27EF] transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Start Over
      </button>
      <ToolProgressIndicator
        currentStep={step - 1}
        totalSteps={6}
        completedSteps={new Set([...completedStages].map(s => s - 1))}
        onStepClick={(index) => {
          const targetStage = index + 1
          if (completedStages.has(targetStage) || targetStage < currentStage) {
            setCurrentStage(targetStage)
          }
        }}
        color="#3E37FF"
        stepLabel="Step"
      />
    </div>
  )

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
              {/* Progress Pills */}
              {renderNavigationHeader(1)}
              
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
              {/* Progress Pills */}
              {renderNavigationHeader(2)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Who's On Your Mind?</h2>
                  <p className="text-gray-600">Add up to 5 people you're thinking about this week</p>
                </div>
                
                {/* Input field */}
                <div className="relative mb-8">
                  <input
                    type="text"
                    value={teamMemberInput}
                    onChange={(e) => setTeamMemberInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && teamMemberInput.trim() && data.teamMembers.length < 5) {
                        e.preventDefault()
                        setData({ 
                          ...data, 
                          teamMembers: [...data.teamMembers, { name: teamMemberInput.trim() }] 
                        })
                        setTeamMemberInput('')
                      }
                    }}
                    placeholder={data.teamMembers.length >= 5 ? "Maximum reached" : "Add a name..."}
                    className="w-full px-6 py-4 pr-12 bg-white rounded-xl border-2 border-[#C67AF4]/30 focus:border-[#3E37FF] focus:outline-none text-lg placeholder-gray-400 transition-colors disabled:bg-gray-50 disabled:border-gray-200"
                    disabled={data.teamMembers.length >= 5}
                  />
                  <button
                    onClick={() => {
                      if (teamMemberInput.trim() && data.teamMembers.length < 5) {
                        setData({ 
                          ...data, 
                          teamMembers: [...data.teamMembers, { name: teamMemberInput.trim() }] 
                        })
                        setTeamMemberInput('')
                      }
                    }}
                    disabled={!teamMemberInput.trim() || data.teamMembers.length >= 5}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      teamMemberInput.trim() && data.teamMembers.length < 5
                        ? 'bg-[#3E37FF] text-white hover:bg-[#2E27EF]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Added team members */}
                {data.teamMembers.length > 0 && (
                  <div className="space-y-3 mb-8">
                    {data.teamMembers.map((member, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10 rounded-xl border border-[#3E37FF]/20">
                          <span className="font-medium text-gray-900">{member.name}</span>
                          <button
                            onClick={() => {
                              setData({ 
                                ...data, 
                                teamMembers: data.teamMembers.filter((_, i) => i !== index) 
                              })
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex gap-2 ml-4">
                          {memberTags.map((tag) => (
                            <button
                              key={tag.id}
                              onClick={() => {
                                const updatedMembers = data.teamMembers.map((tm, i) => {
                                  if (i === index) {
                                    const currentReasons = tm.reasons || []
                                    const hasTag = currentReasons.includes(tag.id)
                                    return {
                                      ...tm,
                                      reasons: hasTag 
                                        ? currentReasons.filter(r => r !== tag.id)
                                        : [...currentReasons, tag.id]
                                    }
                                  }
                                  return tm
                                })
                                setData({ ...data, teamMembers: updatedMembers })
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                member.reasons?.includes(tag.id)
                                  ? 'bg-[#3E37FF] text-white'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {tag.emoji} {tag.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {data.teamMembers.length === 5 && (
                  <p className="text-center text-gray-500 text-sm mb-4">Maximum 5 people selected</p>
                )}
                
                {data.teamMembers.length > 0 && data.teamMembers.length < 5 && (
                  <p className="text-center text-gray-500 text-sm mb-4">You can add {5 - data.teamMembers.length} more {data.teamMembers.length === 4 ? 'person' : 'people'}</p>
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

      // Step 3: Which outcomes need you most?
      case 3:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              {/* Progress Pills */}
              {renderNavigationHeader(3)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Which outcomes need you most?</h2>
                  <p className="text-gray-600">Not everything needs your attention. But something does.</p>
                </div>
                
                {/* Show major areas as reference */}
                {data.majorAreas.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Your areas of focus:</p>
                    <div className="flex flex-wrap gap-2">
                      {data.majorAreas.map((area, index) => {
                        const areaConfig = ownershipAreas.find(a => a.label === area)
                        const Icon = areaConfig?.icon || Target
                        return (
                          <div key={index} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm">
                            <Icon className="w-4 h-4 text-gray-600" />
                            <span className="text-gray-700">{area}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                {/* Input field */}
                <div className="relative mb-8">
                  <input
                    type="text"
                    value={outcomeInput}
                    onChange={(e) => setOutcomeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && outcomeInput.trim()) {
                        e.preventDefault()
                        setData({ 
                          ...data, 
                          outcomes: [...data.outcomes, { outcome: outcomeInput.trim(), status: 'on-track' }] 
                        })
                        setOutcomeInput('')
                      }
                    }}
                    placeholder="Add an outcome..."
                    className="w-full px-6 py-4 pr-12 bg-white rounded-xl border-2 border-[#C67AF4]/30 focus:border-[#3E37FF] focus:outline-none text-lg placeholder-gray-400 transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (outcomeInput.trim()) {
                        setData({ 
                          ...data, 
                          outcomes: [...data.outcomes, { outcome: outcomeInput.trim(), status: 'on-track' }] 
                        })
                        setOutcomeInput('')
                      }
                    }}
                    disabled={!outcomeInput.trim()}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                      outcomeInput.trim()
                        ? 'bg-[#3E37FF] text-white hover:bg-[#2E27EF]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Added outcomes */}
                {data.outcomes.length > 0 && (
                  <div className="space-y-3 mb-8">
                    {data.outcomes.map((outcome, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start justify-between p-4 bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10 rounded-xl border border-[#3E37FF]/20">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900">{outcome.outcome}</span>
                            {outcome.note && (
                              <p className="text-sm text-gray-600 mt-1 italic">"{outcome.note}"</p>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setData({ 
                                ...data, 
                                outcomes: data.outcomes.filter((_, i) => i !== index) 
                              })
                            }}
                            className="text-gray-500 hover:text-red-500 transition-colors ml-2"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        {/* Status tags */}
                        <div className="flex gap-2 ml-4">
                          {outcomeStatuses.map((status) => (
                            <button
                              key={status.id}
                              onClick={() => {
                                const updatedOutcomes = data.outcomes.map((o, i) => 
                                  i === index 
                                    ? { ...o, status: status.id as any }
                                    : o
                                )
                                setData({ ...data, outcomes: updatedOutcomes })
                              }}
                              className={`px-3 py-1 rounded-full text-sm transition-all ${
                                outcome.status === status.id
                                  ? status.color
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {status.emoji} {status.label}
                            </button>
                          ))}
                        </div>
                        
                        {/* Related areas tags */}
                        {data.majorAreas.length > 0 && (
                          <div className="ml-4">
                            <p className="text-xs text-gray-600 mb-1">Related to:</p>
                            <div className="flex flex-wrap gap-1">
                              {data.majorAreas.map((area) => {
                                const areaId = ownershipAreas.find(a => a.label === area)?.id
                                const isRelated = outcome.relatedAreas?.includes(areaId || '')
                                return (
                                  <button
                                    key={area}
                                    onClick={() => {
                                      const updatedOutcomes = data.outcomes.map((o, i) => {
                                        if (i === index) {
                                          const currentRelated = o.relatedAreas || []
                                          const areaKey = areaId || area
                                          return {
                                            ...o,
                                            relatedAreas: isRelated
                                              ? currentRelated.filter(a => a !== areaKey)
                                              : [...currentRelated, areaKey]
                                          }
                                        }
                                        return o
                                      })
                                      setData({ ...data, outcomes: updatedOutcomes })
                                    }}
                                    className={`px-2 py-0.5 rounded-full text-xs transition-all ${
                                      isRelated
                                        ? 'bg-[#3E37FF] text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                  >
                                    {ownershipAreas.find(a => a.label === area)?.shortLabel || area}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        
                        {/* Note */}
                        {showAddNote === index ? (
                          <div className="flex gap-2 ml-4">
                            <input
                              type="text"
                              value={outcomeNote}
                              onChange={(e) => setOutcomeNote(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && outcomeNote.trim()) {
                                  const updatedOutcomes = data.outcomes.map((o, i) => 
                                    i === index 
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
                                  const updatedOutcomes = data.outcomes.map((o, i) => 
                                    i === index 
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
                              setShowAddNote(index)
                              setOutcomeNote(outcome.note || '')
                            }}
                            className="text-sm text-[#3E37FF] hover:text-[#2E27EF] ml-4"
                          >
                            {outcome.note ? '✏️ Edit note' : '📝 Add note (optional)'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {data.outcomes.length === 0 && (
                  <p className="text-center text-gray-400 text-sm mb-8">Add outcomes that need your attention this week</p>
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
          ...data.teamMembers.map(tm => ({ type: 'person', value: tm.name, data: tm })),
          ...data.outcomes.map(o => ({ type: 'outcome', value: o.outcome, data: o }))
        ]
        
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              {/* Progress Pills */}
              {renderNavigationHeader(4)}
              
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
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {option.type === 'person' && <Users className="w-4 h-4 text-gray-500" />}
                                {option.type === 'outcome' && <Flag className="w-4 h-4 text-gray-500" />}
                                <span className="text-gray-700 font-medium">{option.value}</span>
                              </div>
                              {option.type === 'person' && (option.data as TeamMember).reasons && (option.data as TeamMember).reasons!.length > 0 && (
                                <div className="flex gap-1 ml-6">
                                  {(option.data as TeamMember).reasons!.map((reasonId: string) => {
                                    const tag = memberTags.find(t => t.id === reasonId)
                                    return tag ? (
                                      <span key={reasonId} className="text-xs inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full">
                                        <span>{tag.emoji}</span>
                                        <span>{tag.label}</span>
                                      </span>
                                    ) : null
                                  })}
                                </div>
                              )}
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
                                  <div className="flex items-center gap-2 flex-1">
                                    <span className="font-medium text-gray-900">{focusItem.item}</span>
                                    {/* Show person tags inline */}
                                    {(() => {
                                      const personData = data.teamMembers.find(tm => tm.name === focusItem.item)
                                      if (personData && personData.reasons && personData.reasons.length > 0) {
                                        return (
                                          <div className="flex gap-1">
                                            {personData.reasons.map((reasonId: string) => {
                                              const tag = memberTags.find(t => t.id === reasonId)
                                              return tag ? (
                                                <span key={reasonId} className="text-xs inline-flex items-center gap-1 px-2 py-0.5 bg-white/50 rounded-full">
                                                  <span>{tag.emoji}</span>
                                                  <span>{tag.label}</span>
                                                </span>
                                              ) : null
                                            })}
                                          </div>
                                        )
                                      }
                                      return null
                                    })()}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setData({
                                        ...data,
                                        topThree: data.topThree.filter(t => t.item !== focusItem.item)
                                      })
                                    }}
                                    className="text-gray-400 hover:text-red-500 ml-2"
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
                          <div className="ml-11 space-y-3">
                            <div>
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
                            
                            {/* Note for both people and outcomes */}
                            <div>
                              {showAddNote === index ? (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={outcomeNote}
                                    onChange={(e) => setOutcomeNote(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' && outcomeNote.trim()) {
                                        const updatedTop = data.topThree.map(t => 
                                          t.item === focusItem.item 
                                            ? { ...t, note: outcomeNote.trim() }
                                            : t
                                        )
                                        setData({ ...data, topThree: updatedTop })
                                        setOutcomeNote('')
                                        setShowAddNote(null)
                                      }
                                    }}
                                    placeholder={data.teamMembers.some(tm => tm.name === focusItem.item) ? "Quick note about this person..." : "Quick note about this outcome..."}
                                    className="flex-1 px-3 py-1 text-sm bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => {
                                      if (outcomeNote.trim()) {
                                        const updatedTop = data.topThree.map(t => 
                                          t.item === focusItem.item 
                                            ? { ...t, note: outcomeNote.trim() }
                                            : t
                                        )
                                        setData({ ...data, topThree: updatedTop })
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
                                    setShowAddNote(index)
                                    setOutcomeNote(focusItem.note || '')
                                  }}
                                  className="text-sm text-[#3E37FF] hover:text-[#2E27EF]"
                                >
                                  {focusItem.note ? '✏️ Edit note' : '📝 Add note (optional)'}
                                </button>
                              )}
                              {focusItem.note && showAddNote !== index && (
                                <p className="text-sm text-gray-600 italic mt-1">"{focusItem.note}"</p>
                              )}
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
              {/* Progress Pills */}
              {renderNavigationHeader(5)}
              
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {weeklyNeeds.map((need) => {
                        const Icon = need.icon
                        const isSelected = data.weeklyNeed === need.id
                        
                        return (
                          <button
                            key={need.id}
                            onClick={() => {
                              setData({ ...data, weeklyNeed: need.id, needDescription: '' })
                              setCustomNeed('')
                            }}
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
                      
                      {/* Custom need input */}
                      <div className="relative">
                        {data.weeklyNeed === 'custom' ? (
                          <input
                            type="text"
                            value={customNeed}
                            onChange={(e) => setCustomNeed(e.target.value)}
                            placeholder="Something else..."
                            className="w-full p-4 rounded-xl border-2 border-[#3E37FF] bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50"
                            autoFocus
                          />
                        ) : (
                          <button
                            onClick={() => {
                              setData({ ...data, weeklyNeed: 'custom', needDescription: '' })
                            }}
                            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              data.weeklyNeed === 'custom'
                                ? 'border-[#3E37FF] bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10'
                                : 'border-gray-200 hover:border-[#3E37FF]/50'
                            }`}
                          >
                            <Plus className="w-5 h-5 text-gray-500" />
                            <span className="text-sm text-gray-700">Something else...</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Description text box */}
                    {(data.weeklyNeed || (data.weeklyNeed === 'custom' && customNeed)) && (
                      <div className="mt-4">
                        <label className="block text-sm text-gray-700 mb-2">
                          What would {data.weeklyNeed === 'custom' ? customNeed.toLowerCase() || 'this' : weeklyNeeds.find(n => n.id === data.weeklyNeed)?.label.toLowerCase()} look like?
                        </label>
                        <textarea
                          value={data.needDescription || ''}
                          onChange={(e) => setData({ ...data, needDescription: e.target.value })}
                          placeholder="Describe what this would mean for your week..."
                          className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50 resize-none"
                          rows={3}
                        />
                      </div>
                    )}
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
                    disabled={!data.weeklyNeed || (data.weeklyNeed === 'custom' && !customNeed.trim())}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.weeklyNeed && (data.weeklyNeed !== 'custom' || customNeed.trim())
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

      // Step 6: Get Support
      case 6:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              {/* Progress Pills */}
              {renderNavigationHeader(6)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Get Support</h2>
                  <p className="text-gray-600">Who can help you succeed with your top priorities?</p>
                </div>
                
                <div className="space-y-6">
                  {data.topThree.map((item, index) => {
                    const isPerson = data.teamMembers.some(tm => tm.name === item.item)
                    const isOutcome = data.outcomes.some(o => o.outcome === item.item)
                    
                    return (
                      <div key={index} className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="flex-shrink-0 w-8 h-8 bg-[#3E37FF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-lg">{item.item}</h3>
                            {item.reason && (
                              <p className="text-sm text-gray-600 mt-1">Priority: {item.reason}</p>
                            )}
                          </div>
                        </div>
                        
                        {/* Support People List */}
                        {item.supportPeople && item.supportPeople.length > 0 && (
                          <div className="ml-11 space-y-3 mb-4">
                            {item.supportPeople.map((support, supportIndex) => (
                              <div key={supportIndex} className="bg-white rounded-lg p-4 border border-[#3E37FF]/20">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{support.name}</p>
                                    <p className="text-sm text-gray-700 mt-1">{support.how}</p>
                                  </div>
                                  <div className="flex gap-2 ml-4">
                                    <button
                                      onClick={() => {
                                        setShowSupportInput(index)
                                        setEditingSupportIndex(supportIndex)
                                        setSupportPersonInput(support.name)
                                        setSupportHowInput(support.how)
                                      }}
                                      className="text-gray-400 hover:text-[#3E37FF]"
                                      title="Edit"
                                    >
                                      ✏️
                                    </button>
                                    <button
                                      onClick={() => {
                                        const updatedTopThree = data.topThree.map((t, i) => {
                                          if (i === index) {
                                            const updatedSupport = [...(t.supportPeople || [])]
                                            updatedSupport.splice(supportIndex, 1)
                                            return { ...t, supportPeople: updatedSupport }
                                          }
                                          return t
                                        })
                                        setData({ ...data, topThree: updatedTopThree })
                                      }}
                                      className="text-gray-400 hover:text-red-500"
                                      title="Remove"
                                    >
                                      ×
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {showSupportInput === index ? (
                          <div className="ml-11 space-y-3">
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">
                                {isPerson ? "Who else can support this relationship?" : "Who can help you with this?"}
                              </label>
                              <input
                                type="text"
                                value={supportPersonInput}
                                onChange={(e) => setSupportPersonInput(e.target.value)}
                                placeholder="Name or role..."
                                className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50"
                                autoFocus
                              />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-700 mb-1">
                                {isOutcome ? "How can they help carry this forward?" : "How can they help?"}
                              </label>
                              <textarea
                                value={supportHowInput}
                                onChange={(e) => setSupportHowInput(e.target.value)}
                                placeholder={isOutcome ? "Can they own a piece? Remove blockers? Provide expertise?" : "What specific support do you need?"}
                                className="w-full px-4 py-2 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50 resize-none"
                                rows={2}
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const updatedTopThree = data.topThree.map((t, i) => {
                                    if (i === index) {
                                      const currentSupport = t.supportPeople || []
                                      const newSupport = { name: supportPersonInput, how: supportHowInput }
                                      
                                      if (editingSupportIndex !== null) {
                                        // Edit existing
                                        const updatedSupport = [...currentSupport]
                                        updatedSupport[editingSupportIndex] = newSupport
                                        return { ...t, supportPeople: updatedSupport }
                                      } else {
                                        // Add new
                                        return { ...t, supportPeople: [...currentSupport, newSupport] }
                                      }
                                    }
                                    return t
                                  })
                                  setData({ ...data, topThree: updatedTopThree })
                                  setShowSupportInput(null)
                                  setSupportPersonInput('')
                                  setSupportHowInput('')
                                  setEditingSupportIndex(null)
                                }}
                                disabled={!supportPersonInput.trim() || !supportHowInput.trim()}
                                className="px-4 py-2 bg-[#3E37FF] text-white rounded-lg hover:bg-[#2E27EF] disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                {editingSupportIndex !== null ? 'Update' : 'Add'}
                              </button>
                              <button
                                onClick={() => {
                                  setShowSupportInput(null)
                                  setSupportPersonInput('')
                                  setSupportHowInput('')
                                  setEditingSupportIndex(null)
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="ml-11">
                            <button
                              onClick={() => {
                                setShowSupportInput(index)
                                setSupportPersonInput('')
                                setSupportHowInput('')
                                setEditingSupportIndex(null)
                              }}
                              className="px-4 py-2 bg-[#3E37FF]/10 text-[#3E37FF] rounded-lg hover:bg-[#3E37FF]/20 font-medium text-sm"
                            >
                              + Add Support
                            </button>
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
                    Complete
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 7: Top of Mind Snapshot (Final)
      case 7:
        const weekOfDate = new Date()
        const weekString = `Week of ${weekOfDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
        const selectedNeed = weeklyNeeds.find(n => n.id === data.weeklyNeed)
        const getAreaIcon = (area: string) => {
          const areaObj = ownershipAreas.find(a => a.label === area || a.shortLabel === area)
          return areaObj ? areaObj.icon : Target
        }
        
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
            <ViewportContainer className="bg-gradient-to-br from-[#FFA62A]/5 via-[#C67AF4]/10 to-[#3E37FF]/10 min-h-screen p-4 print-section">
              <div className="max-w-5xl mx-auto">
                <div className="mb-8 flex justify-between items-center no-print">
                  <button
                    onClick={() => {
                      setCurrentStage(0)
                      setCompletedStages(new Set())
                      setData({
                        majorAreas: [],
                        teamMembers: [],
                        outcomes: [],
                        topThree: [],
                        focusLevel: 50,
                        weeklyNeed: '',
                        needDescription: ''
                      })
                    }}
                    className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors font-medium"
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
                      className="p-2.5 sm:p-3 border-2 border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                      title="Print snapshot"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <ShareButton
                      onShare={handleShare}
                      className="px-6 py-2.5 bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] hover:from-[#B669E3] hover:to-[#2E27EF] text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      <Share2 className="w-5 h-5 inline sm:hidden" />
                      <span className="hidden sm:inline uppercase tracking-wider">Share</span>
                    </ShareButton>
                  </div>
                </div>
                
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-3xl mb-6 shadow-2xl">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] bg-clip-text text-transparent mb-4">Top of Mind</h1>
                  <p className="text-2xl text-gray-700 font-light">{weekString}</p>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="h-1 w-20 bg-gradient-to-r from-transparent to-[#C67AF4] rounded-full" />
                    <div className="h-2 w-2 bg-[#3E37FF] rounded-full" />
                    <div className="h-1 w-20 bg-gradient-to-r from-[#3E37FF] to-transparent rounded-full" />
                  </div>
                </div>
                
                <div className="space-y-8">
                  {/* Major Areas of Ownership - Moved to top with icons */}
                  {data.majorAreas.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#FFA62A] to-[#FF7B47] rounded-2xl flex items-center justify-center shadow-lg">
                          <Layers className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">Major Areas of Ownership</h3>
                          <p className="text-gray-600 text-sm">Your key responsibilities this week</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {data.majorAreas.map((area, index) => {
                          const AreaIcon = getAreaIcon(area)
                          const areaObj = ownershipAreas.find(a => a.label === area || a.shortLabel === area)
                          const shortLabel = areaObj?.shortLabel || area
                          return (
                            <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200 hover:border-[#3E37FF]/30 transition-all hover:shadow-md">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                                  <AreaIcon className="w-5 h-5 text-[#3E37FF]" />
                                </div>
                                <span className="font-medium text-gray-800">{shortLabel}</span>
                              </div>
                              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Top 3 Focus Areas with Support Info */}
                  <div className="bg-gradient-to-br from-white to-[#3E37FF]/5 rounded-3xl shadow-xl border border-[#3E37FF]/20 p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#C67AF4]/10 to-[#3E37FF]/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] rounded-2xl flex items-center justify-center shadow-lg">
                          <Target className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">My Top 3 Focus Areas</h3>
                          <p className="text-gray-600 text-sm">What matters most this week</p>
                        </div>
                      </div>
                      <div className="space-y-6">
                        {data.topThree.map((item, index) => (
                          <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
                            <div className="flex items-start gap-4">
                              <span className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#C67AF4] to-[#3E37FF] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-md">
                                {index + 1}
                              </span>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 text-lg mb-1">{item.item}</h4>
                                {item.reason && (
                                  <p className="text-gray-600 flex items-center gap-2 mb-3">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">Priority</span>
                                    <span className="text-sm">{item.reason}</span>
                                  </p>
                                )}
                                {item.note && (
                                  <p className="text-gray-600 text-sm italic mb-3 pl-4 border-l-2 border-gray-200">"{item.note}"</p>
                                )}
                                {item.supportPeople && item.supportPeople.length > 0 && (
                                  <div className="mt-4 space-y-3">
                                    <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                      <UserCheck className="w-4 h-4 text-[#3E37FF]" />
                                      Support Network
                                    </p>
                                    {item.supportPeople.map((support, supportIdx) => (
                                      <div key={supportIdx} className="p-4 bg-gradient-to-r from-[#3E37FF]/5 to-[#C67AF4]/5 rounded-xl border border-[#3E37FF]/20">
                                        <p className="font-medium text-gray-900 mb-1">{support.name}</p>
                                        <p className="text-gray-600 text-sm">{support.how}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Two Column Layout */}
                  <div className="grid lg:grid-cols-2 gap-8">
                    {/* People on My Mind */}
                    {data.teamMembers.length > 0 && (
                      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#9333EA] to-[#C084FC] rounded-2xl flex items-center justify-center shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">People on My Mind</h3>
                            <p className="text-gray-600 text-sm">Relationships that need attention</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {data.teamMembers.map((member, index) => {
                            const tags = member.reasons || []
                            return (
                              <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                                <p className="font-semibold text-gray-900 mb-2">{member.name}</p>
                                {tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {tags.map((reasonId: string) => {
                                      const tag = memberTags.find(t => t.id === reasonId)
                                      return tag ? (
                                        <span key={reasonId} className="inline-flex items-center gap-1 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-sm font-medium text-purple-700 border border-purple-200">
                                          <span>{tag.emoji}</span>
                                          <span>{tag.label}</span>
                                        </span>
                                      ) : null
                                    })}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  
                    {/* Outcomes Needing Attention */}
                    {data.outcomes.length > 0 && (
                      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#EA580C] to-[#F97316] rounded-2xl flex items-center justify-center shadow-lg">
                            <Flag className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">Outcomes Needing Attention</h3>
                            <p className="text-gray-600 text-sm">Key results to track</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {data.outcomes.map((outcome, index) => {
                            const status = outcomeStatuses.find(s => s.id === outcome.status)
                            const borderColor = {
                              'at-risk': 'border-red-400',
                              'needs-push': 'border-yellow-400',
                              'on-track': 'border-green-400',
                              'figuring-out': 'border-purple-400'
                            }[outcome.status] || 'border-gray-400'
                            
                            return (
                              <div key={index} className={`border-l-4 ${borderColor} pl-5 py-3 hover:bg-gray-50 transition-colors rounded-r-lg`}>
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{outcome.outcome}</p>
                                    {outcome.note && (
                                      <p className="text-sm text-gray-600 mt-1 italic">"{outcome.note}"</p>
                                    )}
                                  </div>
                                  {status && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.color} whitespace-nowrap`}>
                                      {status.emoji} {status.label}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Metrics Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Focus Level */}
                    <div className="bg-gradient-to-br from-[#3E37FF]/10 to-[#C67AF4]/10 rounded-3xl p-8 border border-[#3E37FF]/20">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                            <Brain className="w-6 h-6 text-[#3E37FF]" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Focus Level</h3>
                        </div>
                      </div>
                      <div className="relative">
                        <div className="flex justify-between text-sm text-gray-600 mb-4">
                          <span>Scattered</span>
                          <span>Laser Focused</span>
                        </div>
                        <div className="h-6 bg-white/50 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] rounded-full transition-all duration-1000 ease-out shadow-md"
                            style={{ width: `${data.focusLevel}%` }}
                          />
                        </div>
                        <div className="text-center mt-6">
                          <div className="text-5xl font-bold bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] bg-clip-text text-transparent">
                            {data.focusLevel}%
                          </div>
                          <p className="text-gray-600 mt-2 text-lg">
                            {data.focusLevel < 30 ? '🌀 Feeling scattered' : 
                             data.focusLevel < 70 ? '⚡ Getting there' : 
                             '🎯 Laser focused'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* What I Need */}
                    <div className="bg-gradient-to-br from-[#EC4899]/10 to-[#F97316]/10 rounded-3xl p-8 border border-[#EC4899]/20">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
                          <Heart className="w-6 h-6 text-[#EC4899]" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">What I Need Most</h3>
                      </div>
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6">
                        {data.weeklyNeed === 'custom' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#EC4899] to-[#F97316] rounded-lg flex items-center justify-center">
                              <Plus className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-gray-900">{customNeed}</span>
                          </div>
                        ) : selectedNeed ? (
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#EC4899] to-[#F97316] rounded-lg flex items-center justify-center">
                              <selectedNeed.icon className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-semibold text-gray-900">{selectedNeed.label}</span>
                          </div>
                        ) : null}
                        {data.needDescription && (
                          <p className="text-gray-700 mt-4 pl-4 border-l-4 border-[#EC4899]/30 italic">
                            "{data.needDescription}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                </div>
                
                {/* Action Buttons */}
                <div className="mt-16 flex flex-col items-center gap-6 no-print">
                  <div className="flex gap-4">
                    <Link
                      href="/"
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
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
                          weeklyNeed: '',
                          needDescription: ''
                        })
                      }}
                      className="px-8 py-3 bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] hover:from-[#B669E3] hover:to-[#2E27EF] text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl uppercase tracking-wider"
                    >
                      Start New Week
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