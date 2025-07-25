'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, ArrowRight, Printer, Share2, Target, Users, CheckCircle2, 
  AlertCircle, Calendar, Flag, Zap, Trophy, Lightbulb, MessageSquare,
  ClipboardList, GitBranch, BarChart3, Clock, Shield, Star, Heart,
  Brain, Rocket, Package, UserCheck, Building2, Briefcase, Award,
  TrendingUp, DollarSign, UserPlus, Shuffle, Settings, PiggyBank,
  Layers, RefreshCw, Activity, CircleDot, AlertTriangle, Timer, X, Plus,
  ArrowUpDown, Edit
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
  focusArea?: string  // Track which focus area this outcome belongs to
}

interface FocusItem {
  item: string
  reason: string
  notes?: string[]
  supportPeople?: SupportPerson[]
}

interface SupportPerson {
  name: string
  how: string
}

// Example outcomes for each area
const outcomeExamples: Record<string, string[]> = {
  'revenue': [
    'Close 3 deals from pipeline',
    'Hit $500K monthly target', 
    'Schedule 10 sales demos',
    'Launch referral program',
    'Sign 2 expansion contracts'
  ],
  'customer': [
    'Resolve 5 support escalations',
    'Ship self-service feature',
    'Call 10 at-risk customers',
    'Update help documentation',
    'Run customer feedback session'
  ],
  'product': [
    'Ship user dashboard update',
    'Fix top 3 bug reports',
    'Complete design review',
    'Launch A/B test',
    'Release mobile app update'
  ],
  'team': [
    'Complete 1-on-1s with everyone',
    'Post 2 job openings',
    'Finish performance reviews',
    'Plan team lunch',
    'Onboard new team member'
  ],
  'collaboration': [
    'Align with marketing on launch',
    'Review project timeline',
    'Schedule stakeholder update',
    'Resolve blocker with IT',
    'Share weekly progress report'
  ],
  'culture': [
    'Recognize 3 team wins',
    'Host all-hands meeting',
    'Send team survey',
    'Plan volunteer day',
    'Update team handbook'
  ],
  'efficiency': [
    'Automate weekly report',
    'Clean up project backlog',
    'Reduce meetings by 2 hours',
    'Document key processes',
    'Upgrade team tools'
  ],
  'budget': [
    'Review monthly spend',
    'Cut unnecessary subscriptions',
    'Approve team expenses',
    'Negotiate vendor renewal',
    'Submit budget forecast'
  ],
  'strategy': [
    'Finish board meeting slides',
    'Update company OKRs',
    'Research competitor moves',
    'Draft partnership proposal',
    'Review market analysis'
  ],
  'change': [
    'Communicate timeline update',
    'Address team concerns',
    'Complete training modules',
    'Update project plan',
    'Gather feedback round'
  ],
  'focus': [
    'Block deep work time',
    'Delegate 3 tasks',
    'Clear inbox to zero',
    'Take strategic planning day',
    'Finish online course'
  ],
  'risk': [
    'Review security policies',
    'Update risk register',
    'Complete compliance training',
    'Test backup systems',
    'Document procedures'
  ]
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

// Focus reasons with icons
const focusReasons = [
  { id: 'deadline', label: 'Deadline', icon: Calendar },
  { id: 'impact', label: 'Impact', icon: Target },
  { id: 'urgency', label: 'Urgency', icon: AlertCircle },
  { id: 'importance', label: 'Importance', icon: Star }
]

// Weekly needs
const weeklyNeeds = [
  { id: 'time', label: 'Time to think', icon: Clock },
  { id: 'priorities', label: 'Clear priorities', icon: Target },
  { id: 'support', label: 'Support from a teammate', icon: Users },
  { id: 'meetings', label: 'Fewer meetings', icon: Calendar },
  { id: 'recognition', label: 'Recognition or motivation', icon: Trophy },
  { id: 'energy', label: 'An energy reset', icon: Zap },
  { id: 'focus', label: 'Better focus time', icon: Brain },
  { id: 'alignment', label: 'Team alignment', icon: GitBranch }
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
  const [currentFocusAreaIndex, setCurrentFocusAreaIndex] = useState(0)
  const [customReasonInput, setCustomReasonInput] = useState('')
  const [showCustomReason, setShowCustomReason] = useState<number | null>(null)
  const [topPriorityIndex, setTopPriorityIndex] = useState<number | null>(null)
  const [editingNoteIndex, setEditingNoteIndex] = useState<{itemIndex: number, noteIndex: number} | null>(null)
  const [editingNoteText, setEditingNoteText] = useState('')
  const [editingStatusIndex, setEditingStatusIndex] = useState<number | null>(null)
  const [editingOutcomeIndex, setEditingOutcomeIndex] = useState<number | null>(null)
  const [editingOutcomeText, setEditingOutcomeText] = useState('')
  
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
    analytics.trackToolStart('Accountability Builder')
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
      await captureEmailForTool(userEmail, 'Accountability Builder', 'accountability-builder')
    }
    setCurrentStage(1)
  }

  const handleNext = () => {
    // Special handling for outcome screens (stage 2)
    if (currentStage === 2) {
      if (currentFocusAreaIndex < data.majorAreas.length - 1) {
        // Move to next focus area
        setCurrentFocusAreaIndex(currentFocusAreaIndex + 1)
        return
      } else {
        // Finished all focus areas, proceed to next stage
        setCurrentFocusAreaIndex(0) // Reset for potential back navigation
      }
    }
    
    if (currentStage < 5) {
      // Mark current stage as completed
      setCompletedStages(prev => new Set([...prev, currentStage]))
      setCurrentStage(currentStage + 1)
      const progress = ((currentStage + 1) / 6) * 100
      analytics.trackToolProgress('Accountability Builder', `Step ${currentStage + 1}`, progress)
    } else if (currentStage === 5) {
      // Mark stage 5 as completed
      setCompletedStages(prev => new Set([...prev, 5]))
      // Going to final stage (6)
      setCurrentStage(6)
      // Track completion
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      analytics.trackToolComplete('Accountability Builder', {
        areas_count: data.majorAreas.length,
        team_members: data.teamMembers.length,
        top_three: data.topThree.length,
        completion_time: timeSpent
      })
    }
  }

  const handleBack = () => {
    // Special handling for outcome screens (stage 2)
    if (currentStage === 2) {
      if (currentFocusAreaIndex > 0) {
        // Go back to previous focus area
        setCurrentFocusAreaIndex(currentFocusAreaIndex - 1)
        return
      }
    }
    
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
      // If going back to stage 2, set to last focus area
      if (currentStage - 1 === 2 && data.majorAreas.length > 0) {
        setCurrentFocusAreaIndex(data.majorAreas.length - 1)
      }
    }
  }

  const handleShare = async () => {
    const shareData = {
      type: 'accountability-builder',
      toolName: 'Accountability Builder',
      data: {
        majorAreas: data.majorAreas,
        // teamMembers: data.teamMembers, // Commented out since Step 2 is disabled
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
    analytics.trackShare('Accountability Builder', 'link', {
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
        totalSteps={5}
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
                <Target className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
              </div>
              <h1 className="text-5xl font-bold mb-6">Focus Finder</h1>
              <h2 className="text-3xl mb-8">A powerful 5-minute focus ritual</h2>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Where should your focus be?</h2>
                  <p className="text-gray-600">Pick up to three areas that need your attention.</p>
                </div>
                
                
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
                          } else if (data.majorAreas.length < 3) {
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
                
                {/* Show selected count or max message */}
                {data.majorAreas.length === 3 && (
                  <p className="text-center text-gray-500 text-sm mb-4">Maximum 3 areas selected</p>
                )}
                
                {/* Custom area input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customArea.trim() && data.majorAreas.length < 3) {
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
                      if (customArea.trim() && data.majorAreas.length < 3) {
                        setData({ ...data, majorAreas: [...data.majorAreas, customArea.trim()] })
                        setCustomArea('')
                      }
                    }}
                    disabled={!customArea.trim() || data.majorAreas.length >= 3}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      customArea.trim() && data.majorAreas.length < 3
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

      // COMMENTED OUT FOR FUTURE USE - Step 2: Who's On Your Mind?
      // Temporarily disabled by making it case 99
      case 99:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(2)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Who's On Your Mind?</h2>
                  <p className="text-gray-600">Add up to 5 people or teams you're thinking about this week</p>
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
                    placeholder={data.teamMembers.length >= 5 ? "Maximum reached" : "Add a person or team..."}
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
                  <p className="text-center text-gray-500 text-sm mb-4">Maximum 5 people or teams selected</p>
                )}
                
                {data.teamMembers.length > 0 && data.teamMembers.length < 5 && (
                  <p className="text-center text-gray-500 text-sm mb-4">You can add {5 - data.teamMembers.length} more</p>
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

      // Step 2 (was Step 3): Which outcomes need you most?
      case 2:
        const currentArea = data.majorAreas[currentFocusAreaIndex]
        const currentAreaConfig = ownershipAreas.find(a => a.label === currentArea)
        const AreaIcon = currentAreaConfig?.icon || Target
        const areaId = currentAreaConfig?.id
        const areaExamples = areaId && outcomeExamples[areaId] ? outcomeExamples[areaId].slice(0, 3) : []
        
        // Get outcomes for the current focus area
        const currentAreaOutcomes = data.outcomes.filter(o => o.focusArea === currentArea)
        
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              {/* Progress Pills */}
              {renderNavigationHeader(2)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="mb-8">
                  {/* Focus area at top level with counter */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900">Focus Area:</h2>
                      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C67AF4]/20 to-[#3E37FF]/20 rounded-full">
                        <AreaIcon className="w-5 h-5 text-[#3E37FF]" />
                        <span className="font-medium text-gray-900">{currentArea}</span>
                      </div>
                    </div>
                    {data.majorAreas.length > 1 && (
                      <p className="text-sm text-gray-500">
                        {currentFocusAreaIndex + 1} of {data.majorAreas.length} areas
                      </p>
                    )}
                  </div>
                  
                  {/* Question */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">What needs to happen next?</h3>
                  
                  {/* Instruction above input */}
                  <p className="text-sm text-gray-600 mb-3">Add outcomes or projects that need your attention right now.</p>
                </div>
                
                {/* Input field */}
                <div className="flex items-center mb-6">
                  <input
                    type="text"
                    value={outcomeInput}
                    onChange={(e) => setOutcomeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && outcomeInput.trim()) {
                        e.preventDefault()
                        setData({ 
                          ...data, 
                          outcomes: [...data.outcomes, { 
                            outcome: outcomeInput.trim(), 
                            status: 'on-track',
                            focusArea: currentArea
                          }] 
                        })
                        setOutcomeInput('')
                      }
                    }}
                    placeholder="Add an outcome or project..."
                    className="flex-1 px-6 py-3 bg-white rounded-xl border-2 border-[#C67AF4]/30 focus:border-[#3E37FF] focus:outline-none text-lg placeholder-gray-400 transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (outcomeInput.trim()) {
                        setData({ 
                          ...data, 
                          outcomes: [...data.outcomes, { 
                            outcome: outcomeInput.trim(), 
                            status: 'on-track',
                            focusArea: currentArea
                          }] 
                        })
                        setOutcomeInput('')
                      }
                    }}
                    disabled={!outcomeInput.trim()}
                    className={`ml-2 h-[52px] w-[52px] rounded-lg flex items-center justify-center transition-colors ${
                      outcomeInput.trim()
                        ? 'bg-[#3E37FF] text-white hover:bg-[#2E27EF]'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Example outcomes for current focus area - show always */}
                {areaExamples.length > 0 && (
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 pl-4">
                      <span className="text-gray-400 mr-2">examples:</span>
                      {areaExamples.join(', ')}
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center">Press Enter to add more outcomes</p>
                  </div>
                )}
                
                {/* Added outcomes for current focus area */}
                {currentAreaOutcomes.length > 0 && (
                  <div className="space-y-3 mb-8">
                    {currentAreaOutcomes.map((outcome) => {
                      const originalIndex = data.outcomes.findIndex(o => o === outcome)
                      return (
                      <div key={originalIndex}>
                        <div className="p-4 bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10 rounded-xl border border-[#3E37FF]/20">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">{outcome.outcome}</span>
                            </div>
                            <button
                              onClick={() => {
                                setData({ 
                                  ...data, 
                                  outcomes: data.outcomes.filter((_, i) => i !== originalIndex) 
                                })
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors ml-2 p-1 flex-shrink-0"
                            >
                              <X className="w-6 h-6" />
                            </button>
                          </div>
                          
                          {/* Status tags */}
                          <div className="flex flex-wrap gap-2">
                            {outcomeStatuses.map((status) => (
                              <button
                                key={status.id}
                                onClick={() => {
                                  const updatedOutcomes = data.outcomes.map((o, i) => 
                                    i === originalIndex 
                                      ? { ...o, status: status.id as any }
                                      : o
                                  )
                                  setData({ ...data, outcomes: updatedOutcomes })
                                }}
                                className={`px-3 py-1.5 rounded-full text-sm transition-all cursor-pointer ${
                                  outcome.status === status.id
                                    ? status.color
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {status.emoji} {status.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                    })}
                  </div>
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
                    {currentFocusAreaIndex < data.majorAreas.length - 1 
                      ? (currentAreaOutcomes.length === 0 ? 'Skip' : 'Next Area')
                      : (data.outcomes.length === 0 ? 'Skip All' : 'Continue')}
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Step 3 (was Step 4): Your Focus Filter
      case 3:
        const allFocusOptions = [
          // Removed teamMembers since Step 2 is commented out
          ...data.outcomes.map(o => ({ type: 'outcome', value: o.outcome, data: o }))
        ]
        
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              {/* Progress Pills */}
              {renderNavigationHeader(3)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Pick your top 3 outcomes</h2>
                  <p className="text-gray-600">If you could only make progress on THREE things this week... what would they be?</p>
                </div>
                
                {/* Completion message and undo button if all 3 are selected */}
                {data.topThree.length === 3 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <p className="text-green-600 font-medium">Great choices! {topPriorityIndex !== null && 'You\'ve even marked your top priority.'}</p>
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => {
                          setData({ ...data, topThree: [] })
                          setTopPriorityIndex(null)
                        }}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Change my picks
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Custom priority input - show when no items or when items exist */}
                {data.topThree.length < 3 && (
                  <div className="mb-6">
                    <div className="flex items-center">
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
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Type a custom priority..."]') as HTMLInputElement
                          if (input && input.value.trim()) {
                            setData({
                              ...data,
                              topThree: [...data.topThree, { item: input.value.trim(), reason: '' }]
                            })
                            input.value = ''
                          }
                        }}
                        className="ml-2 h-[48px] w-[48px] rounded-lg bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-600 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Choose from earlier selections */}
                    {allFocusOptions.length > 0 && (
                      <div className="mt-4">
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
                                  <Flag className="w-4 h-4 text-gray-500" />
                                  <span className="text-gray-700 font-medium">{option.value}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Show numbered priorities only when they exist */}
                {data.topThree.length > 0 && (
                  <div className="mb-6">
                    {data.topThree.map((focusItem, index) => {
                      return (
                        <div key={index}>
                          <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setTopPriorityIndex(topPriorityIndex === index ? null : index)
                              }}
                              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                                topPriorityIndex === index
                                  ? 'bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] text-white shadow-lg scale-110'
                                  : 'bg-[#3E37FF] text-white hover:scale-105'
                              }`}
                              title={topPriorityIndex === index ? 'Top priority!' : 'Click to mark as top priority'}
                            >
                              {topPriorityIndex === index ? '⭐' : index + 1}
                            </button>
                            <div className="flex-1">
                              <div className="p-3 bg-gradient-to-r from-[#C67AF4]/10 to-[#3E37FF]/10 rounded-lg">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 flex-1">
                                      <span className="font-medium text-gray-900">{focusItem.item}</span>
                                    </div>
                                    <button
                                      onClick={() => {
                                        setData({
                                          ...data,
                                          topThree: data.topThree.filter((_, i) => i !== index)
                                        })
                                        if (topPriorityIndex === index) {
                                          setTopPriorityIndex(null)
                                        } else if (topPriorityIndex !== null && topPriorityIndex > index) {
                                          setTopPriorityIndex(topPriorityIndex - 1)
                                        }
                                      }}
                                      className="text-gray-400 hover:text-red-500 ml-2 p-1"
                                    >
                                      <X className="w-5 h-5" />
                                    </button>
                                  </div>
                                  
                                  {/* Display notes inside the outcome area in italics */}
                                  {focusItem.notes && focusItem.notes.length > 0 && (
                                    <div className="space-y-0.5 ml-2 mt-2">
                                      {focusItem.notes.map((note, noteIndex) => (
                                        <div key={noteIndex} className="group relative">
                                          {editingNoteIndex?.itemIndex === index && editingNoteIndex?.noteIndex === noteIndex ? (
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="text"
                                                value={editingNoteText}
                                                onChange={(e) => setEditingNoteText(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === 'Enter' && editingNoteText.trim()) {
                                                    const updatedTop = data.topThree.map((t, i) => 
                                                      i === index
                                                        ? { ...t, notes: t.notes?.map((n, ni) => ni === noteIndex ? editingNoteText.trim() : n) }
                                                        : t
                                                    )
                                                    setData({ ...data, topThree: updatedTop })
                                                    setEditingNoteIndex(null)
                                                    setEditingNoteText('')
                                                  }
                                                  if (e.key === 'Escape') {
                                                    setEditingNoteIndex(null)
                                                    setEditingNoteText('')
                                                  }
                                                }}
                                                onBlur={() => {
                                                  if (editingNoteText.trim() && editingNoteText.trim() !== note) {
                                                    const updatedTop = data.topThree.map((t, i) => 
                                                      i === index
                                                        ? { ...t, notes: t.notes?.map((n, ni) => ni === noteIndex ? editingNoteText.trim() : n) }
                                                        : t
                                                    )
                                                    setData({ ...data, topThree: updatedTop })
                                                  }
                                                  setEditingNoteIndex(null)
                                                  setEditingNoteText('')
                                                }}
                                                className="flex-1 px-2 py-0.5 text-sm bg-gray-50 rounded border border-[#3E37FF]/30 focus:outline-none focus:ring-1 focus:ring-[#3E37FF]/50 italic"
                                                autoFocus
                                              />
                                            </div>
                                          ) : (
                                            <div className="flex items-start gap-2">
                                              <p 
                                                className="text-sm text-gray-600 italic flex-1 cursor-pointer"
                                                onClick={() => {
                                                  setEditingNoteIndex({ itemIndex: index, noteIndex })
                                                  setEditingNoteText(note)
                                                }}
                                              >
                                                • {note}
                                              </p>
                                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                <button
                                                  onClick={() => {
                                                    setEditingNoteIndex({ itemIndex: index, noteIndex })
                                                    setEditingNoteText(note)
                                                  }}
                                                  className="text-gray-400 hover:text-[#3E37FF] p-0.5"
                                                  title="Edit note"
                                                >
                                                  <Edit className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    const updatedTop = data.topThree.map((t, i) => 
                                                      i === index
                                                        ? { ...t, notes: t.notes?.filter((_, ni) => ni !== noteIndex) }
                                                        : t
                                                    )
                                                    setData({ ...data, topThree: updatedTop })
                                                  }}
                                                  className="text-gray-400 hover:text-red-500 p-0.5"
                                                  title="Delete note"
                                                >
                                                  <X className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          
                          <div className="ml-11 space-y-3">
                            <div>
                              <p className="text-sm text-gray-600 mb-2">What needs to be done to complete this?</p>
                            </div>
                            
                            {/* Add note button/input - now supports multiple notes */}
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
                                            ? { ...t, notes: [...(t.notes || []), outcomeNote.trim()] }
                                            : t
                                        )
                                        setData({ ...data, topThree: updatedTop })
                                        setOutcomeNote('')
                                        // Always keep input open for more notes
                                      }
                                      if (e.key === 'Escape') {
                                        setOutcomeNote('')
                                        setShowAddNote(null)
                                      }
                                    }}
                                    placeholder="Add as many tasks as you'd like..."
                                    className="flex-1 px-3 py-1 text-sm bg-gray-50 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => {
                                      if (outcomeNote.trim()) {
                                        const updatedTop = data.topThree.map(t => 
                                          t.item === focusItem.item 
                                            ? { ...t, notes: [...(t.notes || []), outcomeNote.trim()] }
                                            : t
                                        )
                                        setData({ ...data, topThree: updatedTop })
                                        setOutcomeNote('')
                                        // Always keep input open for more notes
                                      }
                                    }}
                                    className="px-3 py-1 text-sm bg-[#3E37FF] text-white rounded hover:bg-[#2E27EF]"
                                  >
                                    Add
                                  </button>
                                  <button
                                    onClick={() => {
                                      setOutcomeNote('')
                                      setShowAddNote(null)
                                    }}
                                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                (
                                  <button
                                    onClick={() => {
                                      setShowAddNote(index)
                                      setOutcomeNote('')
                                    }}
                                    className="text-sm text-[#3E37FF] hover:text-[#2E27EF] flex items-center gap-2"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                    <span>Add task{focusItem.notes && focusItem.notes.length > 0 ? ` (${focusItem.notes.length})` : ''}</span>
                                  </button>
                                )
                              )}
                              
                            </div>
                          </div>
                          </div>
                        
                        {/* Swap buttons between items */}
                        {index < data.topThree.length - 1 && (
                          <div className="flex justify-start ml-4 py-2">
                            <button
                              onClick={() => {
                                const newTopThree = [...data.topThree]
                                const temp = newTopThree[index]
                                newTopThree[index] = newTopThree[index + 1]
                                newTopThree[index + 1] = temp
                                setData({ ...data, topThree: newTopThree })
                                // Update top priority index if needed
                                if (topPriorityIndex === index) {
                                  setTopPriorityIndex(index + 1)
                                } else if (topPriorityIndex === index + 1) {
                                  setTopPriorityIndex(index)
                                }
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                              title="Swap priorities"
                            >
                              <ArrowUpDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  </div>
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

      // Step 4 (was Step 5): Reflect + Reset
      case 4:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              {/* Progress Pills */}
              {renderNavigationHeader(4)}
              
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
                    Next
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Step 5 (was Step 6): Get Support
      case 5:
        return (
          <ViewportContainer className="bg-gray-50 min-h-screen p-4">
            <div className="max-w-3xl mx-auto">
              {/* Progress Pills */}
              {renderNavigationHeader(5)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Who can help you succeed?</h2>
                  <p className="text-gray-600">Add people to each outcome.</p>
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
                                      className="text-gray-400 hover:text-[#3E37FF] p-1"
                                      title="Edit"
                                    >
                                      <Edit className="w-4 h-4" />
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
                                      className="text-gray-400 hover:text-red-500 p-1"
                                      title="Remove"
                                    >
                                      <X className="w-5 h-5" />
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
                              + Add Person
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
                    Next
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 6 (was 7): Accountability Snapshot (Final)
      case 6:
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
                        analytics.trackDownload('Print', 'Accountability Builder')
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
                    <Target className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-5xl font-bold bg-gradient-to-r from-[#C67AF4] to-[#3E37FF] bg-clip-text text-transparent mb-4">Focus Finder</h1>
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
                          return (
                            <div key={index} className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100/50 p-4 rounded-xl border border-gray-200 hover:border-[#3E37FF]/30 transition-all hover:shadow-md h-full">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow flex-shrink-0">
                                  <AreaIcon className="w-5 h-5 text-[#3E37FF]" />
                                </div>
                                <span className="font-medium text-gray-800">{area}</span>
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
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {item.reason.split(', ').map((r, idx) => {
                                      const reasonObj = focusReasons.find(fr => fr.label === r)
                                      if (reasonObj) {
                                        const Icon = reasonObj.icon
                                        return (
                                          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                            <Icon className="w-3 h-3" />
                                            {r}
                                          </span>
                                        )
                                      }
                                      return (
                                        <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-xs">
                                          {r}
                                        </span>
                                      )
                                    })}
                                  </div>
                                )}
                                {item.notes && item.notes.length > 0 && (
                                  <div className="space-y-1 mb-3">
                                    {item.notes.map((note, noteIndex) => (
                                      <p key={noteIndex} className="text-gray-600 text-sm italic pl-4 border-l-2 border-gray-200">• {note}</p>
                                    ))}
                                  </div>
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
                  
                  {/* Single Column Layout (was Two Column) */}
                  <div className="grid gap-8">
                    {/* People on My Mind - COMMENTED OUT since Step 2 is disabled */}
                    {/* data.teamMembers.length > 0 && (
                      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#9333EA] to-[#C084FC] rounded-2xl flex items-center justify-center shadow-lg">
                            <Users className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900">People & Teams on My Mind</h3>
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
                    ) */}
                  
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {data.outcomes.map((outcome, index) => {
                            const status = outcomeStatuses.find(s => s.id === outcome.status)
                            const statusColors = {
                              'at-risk': 'from-red-500 to-red-600',
                              'needs-push': 'from-yellow-500 to-yellow-600',
                              'on-track': 'from-green-500 to-green-600',
                              'figuring-out': 'from-purple-500 to-purple-600'
                            }[outcome.status] || 'from-gray-500 to-gray-600'
                            
                            const statusTextColors = {
                              'at-risk': 'text-red-600 bg-red-100 hover:bg-red-200',
                              'needs-push': 'text-yellow-600 bg-yellow-100 hover:bg-yellow-200',
                              'on-track': 'text-green-600 bg-green-100 hover:bg-green-200',
                              'figuring-out': 'text-purple-600 bg-purple-100 hover:bg-purple-200'
                            }[outcome.status] || 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                            
                            return (
                              <div key={index} className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white relative group">
                                {/* Colored header */}
                                <div className={`h-2 bg-gradient-to-r ${statusColors}`} />
                                
                                {/* Delete button */}
                                <button
                                  onClick={() => {
                                    const updatedOutcomes = data.outcomes.filter((_, i) => i !== index)
                                    setData({ ...data, outcomes: updatedOutcomes })
                                  }}
                                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500 p-1"
                                  title="Delete outcome"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                                
                                {/* Card content */}
                                <div className="p-5">
                                  {editingOutcomeIndex === index ? (
                                    <input
                                      type="text"
                                      value={editingOutcomeText}
                                      onChange={(e) => setEditingOutcomeText(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' && editingOutcomeText.trim()) {
                                          const updatedOutcomes = data.outcomes.map((o, i) => 
                                            i === index ? { ...o, outcome: editingOutcomeText.trim() } : o
                                          )
                                          setData({ ...data, outcomes: updatedOutcomes })
                                          setEditingOutcomeIndex(null)
                                          setEditingOutcomeText('')
                                        }
                                        if (e.key === 'Escape') {
                                          setEditingOutcomeIndex(null)
                                          setEditingOutcomeText('')
                                        }
                                      }}
                                      onBlur={() => {
                                        if (editingOutcomeText.trim() && editingOutcomeText.trim() !== outcome.outcome) {
                                          const updatedOutcomes = data.outcomes.map((o, i) => 
                                            i === index ? { ...o, outcome: editingOutcomeText.trim() } : o
                                          )
                                          setData({ ...data, outcomes: updatedOutcomes })
                                        }
                                        setEditingOutcomeIndex(null)
                                        setEditingOutcomeText('')
                                      }}
                                      className="w-full font-medium text-gray-900 mb-3 px-2 py-1 border border-[#3E37FF]/30 rounded focus:outline-none focus:ring-2 focus:ring-[#3E37FF]/50"
                                      autoFocus
                                    />
                                  ) : (
                                    <p 
                                      className="font-medium text-gray-900 mb-3 cursor-pointer hover:text-[#3E37FF]"
                                      onClick={() => {
                                        setEditingOutcomeIndex(index)
                                        setEditingOutcomeText(outcome.outcome)
                                      }}
                                    >
                                      {outcome.outcome}
                                    </p>
                                  )}
                                  
                                  {/* Status selection */}
                                  {status && (
                                    <div className="mb-3">
                                      {editingStatusIndex === index ? (
                                        <div className="flex flex-wrap gap-2">
                                          {outcomeStatuses.map((s) => {
                                            const isSelected = s.id === outcome.status
                                            const pillColors = {
                                              'at-risk': isSelected ? 'bg-red-100 text-red-600 ring-2 ring-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50',
                                              'needs-push': isSelected ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-600' : 'bg-gray-100 text-gray-600 hover:bg-yellow-50',
                                              'on-track': isSelected ? 'bg-green-100 text-green-600 ring-2 ring-green-600' : 'bg-gray-100 text-gray-600 hover:bg-green-50',
                                              'figuring-out': isSelected ? 'bg-purple-100 text-purple-600 ring-2 ring-purple-600' : 'bg-gray-100 text-gray-600 hover:bg-purple-50'
                                            }[s.id]
                                            
                                            return (
                                              <button
                                                key={s.id}
                                                onClick={() => {
                                                  const updatedOutcomes = data.outcomes.map((o, i) => 
                                                    i === index ? { ...o, status: s.id } : o
                                                  )
                                                  setData({ ...data, outcomes: updatedOutcomes })
                                                  setEditingStatusIndex(null)
                                                }}
                                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${pillColors}`}
                                              >
                                                <span>{s.emoji}</span>
                                                <span>{s.label}</span>
                                              </button>
                                            )
                                          })}
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => setEditingStatusIndex(index)}
                                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${statusTextColors}`}
                                        >
                                          <span>{status.emoji}</span>
                                          <span>{status.label}</span>
                                        </button>
                                      )}
                                    </div>
                                  )}
                                  
                                  {outcome.note && (
                                    <p className="text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
                                      "{outcome.note}"
                                    </p>
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