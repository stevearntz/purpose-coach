'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft, ArrowRight, Printer, Share2, RefreshCw, Plus, X, Calendar, Mail, Users,
  Smile, Zap, MessageCircle, BookOpen, Heart, Shield, ListOrdered, Reply,
  Clock, Battery, Activity, ClipboardList, Brain, Play, MessageSquare, Target,
  Sparkles, Sun, Rocket, Zap as Energy, Trophy,
  Frown, HeartCrack, UserX, Home, Lock,
  Flame, AlertCircle, ThumbsDown, Bomb, Coffee,
  Gauge, Cloud, AlertTriangle, HelpCircle, ShieldX,
  ZapOff, Meh, Star, Lightbulb, CircleX,
  XCircle, Ghost, Pause,
  GitBranch, Package, UserCheck, ArrowRightLeft, DollarSign,
  UserCog, Compass, Building2, UserMinus, FileCheck,
  FileText, Users2, Globe2, TrendingUp, CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ViewportContainer from '@/components/ViewportContainer'
import ShareButton from '@/components/ShareButton'
import ToolNavigationWrapper from '@/components/ToolNavigationWrapper'
import ToolProgressIndicator from '@/components/ToolProgressIndicator'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useEmailCapture } from '@/hooks/useEmailCapture'
import { validateEmail, validateEmailRealtime, EmailValidationResult } from '@/utils/emailValidation'

// Types
interface ChangeReflectionData {
  changeTypes: string[]
  changeDescription: string
  currentEmotions: string[]
  negativeChanges: string[]
  positiveChanges: string[]
  staysSame: string
  whatsNew: string
  inControl: string[]
  impactedPeople: string[]
  selectedPerson: string
  anticipatedEmotions: string[]
}

// Change types
const changeTypes = [
  'Re-organization', 'Launch', 'Leadership', 'Migration', 'Budget',
  'Roles', 'Strategic Shift', 'Merger or Acquisition', 'Layoffs',
  'Compliance', 'Policy', 'Culture Shift', 'External Crisis', 'Market'
]

// Top emotions from emotion wheel
const emotionOptions = [
  // Happy
  'Optimistic', 'Hopeful', 'Excited', 'Energized', 'Confident',
  // Sad
  'Disappointed', 'Hurt', 'Vulnerable', 'Lonely', 'Isolated',
  // Angry
  'Frustrated', 'Irritated', 'Resentful', 'Furious', 'Bitter',
  // Fearful
  'Anxious', 'Worried', 'Overwhelmed', 'Insecure', 'Helpless',
  // Surprised
  'Shocked', 'Confused', 'Amazed', 'Startled', 'Dismayed',
  // Disgusted
  'Disapproving', 'Disgusted', 'Awful', 'Repelled', 'Hesitant'
]

// Potential changes
const potentialNegativeChanges = [
  'Loss of autonomy', 'Unclear expectations', 'More workload', 'Less resources',
  'Team disruption', 'Loss of relationships', 'Career uncertainty', 'Reduced influence'
]

const potentialPositiveChanges = [
  'New opportunities', 'Fresh perspectives', 'Skill development', 'Better processes',
  'Stronger team', 'Career growth', 'Increased visibility', 'New connections'
]

// Control options - updated to work with "I can control my..."
const controlOptions = [
  'attitude', 'effort', 'communication', 'learning',
  'relationships', 'boundaries', 'priorities', 'response',
  'time', 'energy', 'reactions', 'preparation',
  'mindset', 'actions', 'words', 'focus'
]

// Icon mapping for control options
const controlIcons: Record<string, any> = {
  'attitude': Smile,
  'effort': Zap,
  'communication': MessageCircle,
  'learning': BookOpen,
  'relationships': Heart,
  'boundaries': Shield,
  'priorities': ListOrdered,
  'response': Reply,
  'time': Clock,
  'energy': Battery,
  'reactions': Activity,
  'preparation': ClipboardList,
  'mindset': Brain,
  'actions': Play,
  'words': MessageSquare,
  'focus': Target
}

// Icon mapping for change types
const changeTypeIcons: Record<string, any> = {
  'Re-organization': GitBranch,
  'Launch': Rocket,
  'Leadership': UserCheck,
  'Migration': ArrowRightLeft,
  'Budget': DollarSign,
  'Roles': UserCog,
  'Strategic Shift': Compass,
  'Merger or Acquisition': Building2,
  'Layoffs': UserMinus,
  'Compliance': FileCheck,
  'Policy': FileText,
  'Culture Shift': Users2,
  'External Crisis': AlertTriangle,
  'Market': TrendingUp
}

// Icon mapping for emotions
const emotionIcons: Record<string, any> = {
  // Happy
  'Optimistic': Sparkles,
  'Hopeful': Sun,
  'Excited': Rocket,
  'Energized': Energy,
  'Confident': Trophy,
  // Sad
  'Disappointed': Frown,
  'Hurt': HeartCrack,
  'Vulnerable': ShieldX,
  'Lonely': UserX,
  'Isolated': Home,
  // Angry
  'Frustrated': Flame,
  'Irritated': AlertCircle,
  'Resentful': ThumbsDown,
  'Furious': Bomb,
  'Bitter': Coffee,
  // Fearful
  'Anxious': Gauge,
  'Worried': Cloud,
  'Overwhelmed': AlertTriangle,
  'Insecure': HelpCircle,
  'Helpless': Lock,
  // Surprised
  'Shocked': ZapOff,
  'Confused': HelpCircle,
  'Amazed': Star,
  'Startled': Lightbulb,
  'Dismayed': CircleX,
  // Disgusted
  'Disapproving': XCircle,
  'Disgusted': Meh,
  'Awful': Ghost,
  'Repelled': CircleX,
  'Hesitant': Pause
}

export default function ChangeReflectionPage() {
  const analytics = useAnalytics()
  const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
  const [currentStage, setCurrentStage] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ isValid: true })
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [startTime] = useState(Date.now())
  
  // Data state
  const [data, setData] = useState<ChangeReflectionData>({
    changeTypes: [],
    changeDescription: '',
    currentEmotions: [],
    negativeChanges: [],
    positiveChanges: [],
    staysSame: '',
    whatsNew: '',
    inControl: [],
    impactedPeople: [],
    selectedPerson: '',
    anticipatedEmotions: []
  })

  // Custom emotion/change/person inputs
  const [customEmotion, setCustomEmotion] = useState('')
  const [customNegative, setCustomNegative] = useState('')
  const [customPositive, setCustomPositive] = useState('')
  const [customControl, setCustomControl] = useState('')
  const [newPersonName, setNewPersonName] = useState('')
  const [customAnticipatedEmotion, setCustomAnticipatedEmotion] = useState('')

  // Track tool start
  useEffect(() => {
    analytics.trackToolStart('Change Reflection')
  }, [analytics])

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
      await captureEmailForTool(userEmail, 'Change Reflection', 'change-reflection')
    }
    setCurrentStage(1)
  }

  const handleNext = () => {
    if (currentStage < 9) {
      setCurrentStage(currentStage + 1)
      const progress = ((currentStage + 1) / 10) * 100
      analytics.trackToolProgress('Change Reflection', `Stage ${currentStage + 1}`, progress)
    } else if (currentStage === 9) {
      // Going to final stage (10)
      setCurrentStage(10)
      // Track completion
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      analytics.trackToolComplete('Change Reflection', {
        change_types: data.changeTypes,
        emotions_count: data.currentEmotions.length,
        completion_time: timeSpent
      })
    }
  }

  const handleBack = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
    }
  }

  const generateConversationGuide = () => {
    const changeTypesText = data.changeTypes.length === 1 
      ? data.changeTypes[0].toLowerCase()
      : data.changeTypes.slice(0, -1).join(', ').toLowerCase() + ' and ' + data.changeTypes[data.changeTypes.length - 1].toLowerCase()
    
    const guide = {
      opening: `I'd like to talk with you about the ${changeTypesText} that's happening.`,
      context: data.changeDescription,
      feelings: `I'm feeling ${data.currentEmotions.slice(0, 3).join(', ')} about this change.`,
      concerns: data.negativeChanges.length > 0 
        ? `Some things I'm concerned about: ${data.negativeChanges.slice(0, 2).join(', ')}.`
        : '',
      opportunities: data.positiveChanges.length > 0
        ? `I also see some opportunities: ${data.positiveChanges.slice(0, 2).join(', ')}.`
        : '',
      control: `I know I can control ${data.inControl.slice(0, 2).join(' and ')}.`,
      ask: 'What are your thoughts? How are you feeling about this?',
      close: 'Thanks for talking this through with me.'
    }
    return guide
  }

  const handleShare = async () => {
    const guide = generateConversationGuide()
    
    const shareData = {
      type: 'change-reflection',
      toolName: 'Change Reflection',
      data: {
        changeTypes: data.changeTypes,
        changeDescription: data.changeDescription,
        currentEmotions: data.currentEmotions,
        concerns: data.negativeChanges,
        positiveChanges: data.positiveChanges,
        copingStrategies: data.inControl,
        supportNeeds: data.whatsNew,
        peopleImpacted: data.impactedPeople,
        selectedPerson: data.selectedPerson,
        anticipatedEmotions: data.anticipatedEmotions
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
    analytics.trackShare('Change Reflection', 'link', {
      change_types: data.changeTypes,
      selected_person: data.selectedPerson
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

  // Helper function to check if a stage has data
  const stageHasData = (stageNum: number): boolean => {
    switch (stageNum) {
      case 1: return data.changeTypes.length > 0
      case 2: return data.changeDescription.trim() !== ''
      case 3: return data.currentEmotions.length > 0
      case 4: return data.negativeChanges.length > 0 || data.positiveChanges.length > 0
      case 5: return data.staysSame.trim() !== ''
      case 6: return data.whatsNew.trim() !== ''
      case 7: return data.inControl.length > 0
      case 8: return data.impactedPeople.length > 0
      case 9: return data.selectedPerson !== ''
      case 10: return data.anticipatedEmotions.length > 0
      default: return false
    }
  }

  // Helper function for consistent navigation header
  const renderNavigationHeader = (stage: number) => (
    <div className="mb-8 flex justify-between items-center">
      <button
        onClick={() => {
          setCurrentStage(0)
          setData({
            changeTypes: [],
            changeDescription: '',
            currentEmotions: [],
            negativeChanges: [],
            positiveChanges: [],
            staysSame: '',
            whatsNew: '',
            inControl: [],
            impactedPeople: [],
            selectedPerson: '',
            anticipatedEmotions: []
          })
        }}
        className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Start Over
      </button>
      
      <ToolProgressIndicator
        currentStep={stage - 1}
        totalSteps={10}
        completedSteps={new Set(
          [...Array(10)].map((_, i) => i + 1)
            .filter(stageNum => stageNum < stage || stageHasData(stageNum))
            .map(stageNum => stageNum - 1)
        )}
        onStepClick={(index) => {
          const stageNum = index + 1
          if (stageNum < stage || (stageNum > stage && stageHasData(stageNum))) {
            setCurrentStage(stageNum)
          }
        }}
        color="#BF4C74"
        stepLabel="Step"
      />
    </div>
  )

  // Render different stages
  const renderStage = () => {
    switch (currentStage) {
      // Stage 0: Intro
      case 0:
        return (
          <ViewportContainer className="bg-gradient-to-br from-[#F595B6] to-[#BF4C74] flex flex-col items-center justify-center p-4">
            <ToolNavigationWrapper />
            
            <div className="w-full max-w-2xl mx-auto text-center text-white">
              <div className="mb-6">
                <div className="inline-flex p-4 bg-white/20 rounded-full mb-4">
                  <RefreshCw className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <h1 className="text-4xl sm:text-5xl font-bold mb-6">
                Change Reflection
              </h1>
              <p className="text-xl sm:text-2xl mb-8 text-white/90">
                A 1:1 Conversation Prep Tool
              </p>
              <p className="text-lg mb-8 text-white/80 max-w-lg mx-auto">
                For managers navigating change with their team
              </p>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-4">
                  <div>
                    <input
                      type="email"
                      value={userEmail}
                      onChange={handleEmailChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && userEmail && emailValidation.isValid) {
                          handleStartAssessment()
                        }
                      }}
                      placeholder="Enter your email to start"
                      className="w-full px-4 py-3 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      autoFocus
                    />
                    {emailValidation.error && (
                      <p className="text-sm text-white mt-2">{emailValidation.error}</p>
                    )}
                    {showSuggestion && emailValidation.suggestion && (
                      <p className="text-sm text-white mt-2">
                        Did you mean{' '}
                        <button
                          onClick={handleSuggestionClick}
                          className="underline hover:no-underline"
                        >
                          {emailValidation.suggestion}
                        </button>
                        ?
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={handleStartAssessment}
                    className="w-full py-4 rounded-lg font-semibold text-lg transition-all bg-white text-[#BF4C74] hover:bg-white/90"
                  >
                    Begin Reflection
                  </button>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 1: Change Type Selection
      case 1:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(1)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  What type of change are you experiencing?
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Select the type of change that best describes your situation
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  {changeTypes.map((change) => {
                    const IconComponent = changeTypeIcons[change]
                    return (
                      <button
                        key={change}
                        onClick={() => {
                          const newTypes = data.changeTypes.includes(change)
                            ? data.changeTypes.filter(t => t !== change)
                            : [...data.changeTypes, change]
                          setData({ ...data, changeTypes: newTypes })
                        }}
                        className={`px-6 py-3 rounded-full border-2 transition-all flex items-center gap-2 ${
                          data.changeTypes.includes(change)
                            ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
                        }`}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        {change}
                      </button>
                    )
                  })}
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    disabled
                    className="px-6 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium transition-colors cursor-not-allowed"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={data.changeTypes.length === 0}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.changeTypes.length > 0
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 2: Change Description
      case 2:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(2)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Tell us more about what's changing
                </h2>
                
                {/* Display selected change types */}
                {data.changeTypes.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">Types of change:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.changeTypes.map((change, index) => {
                        const IconComponent = changeTypeIcons[change]
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#BF4C74]/10 text-[#BF4C74] rounded-full text-sm font-medium"
                          >
                            {IconComponent && <IconComponent className="w-3.5 h-3.5" />}
                            {change}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
                
                <textarea
                  value={data.changeDescription}
                  onChange={(e) => setData({ ...data, changeDescription: e.target.value })}
                  placeholder="Describe what's happening..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50 min-h-[150px] resize-y"
                  autoFocus
                />
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!data.changeDescription.trim()}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.changeDescription.trim()
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 3: Current Emotions
      case 3:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(3)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  How are you feeling about this change?
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Select all emotions that resonate with you
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  {/* Pre-defined emotions */}
                  {emotionOptions.map((emotion) => {
                    const IconComponent = emotionIcons[emotion]
                    return (
                      <button
                        key={emotion}
                        onClick={() => {
                          const newEmotions = data.currentEmotions.includes(emotion)
                            ? data.currentEmotions.filter(e => e !== emotion)
                            : [...data.currentEmotions, emotion]
                          setData({ ...data, currentEmotions: newEmotions })
                        }}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm flex items-center gap-2 ${
                          data.currentEmotions.includes(emotion)
                            ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
                        }`}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        {emotion}
                      </button>
                    )
                  })}
                  
                  {/* Custom emotions added by user */}
                  {data.currentEmotions
                    .filter(emotion => !emotionOptions.includes(emotion))
                    .map((emotion, index) => (
                      <button
                        key={`custom-${index}`}
                        onClick={() => {
                          setData({
                            ...data,
                            currentEmotions: data.currentEmotions.filter(e => e !== emotion)
                          })
                        }}
                        className="px-4 py-2 rounded-full border-2 bg-[#BF4C74] text-white border-[#BF4C74] transition-all text-sm flex items-center gap-2"
                      >
                        {emotion}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEmotion}
                    onChange={(e) => setCustomEmotion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customEmotion.trim()) {
                        e.preventDefault()
                        setData({ ...data, currentEmotions: [...data.currentEmotions, customEmotion.trim()] })
                        setCustomEmotion('')
                      }
                    }}
                    placeholder="Add your own..."
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50"
                  />
                  <button
                    onClick={() => {
                      if (customEmotion.trim()) {
                        setData({ ...data, currentEmotions: [...data.currentEmotions, customEmotion.trim()] })
                        setCustomEmotion('')
                      }
                    }}
                    disabled={!customEmotion.trim()}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      customEmotion.trim()
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={data.currentEmotions.length === 0}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.currentEmotions.length > 0
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 4: Negative Changes
      case 4:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(4)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  What's the impact of the change?
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Negative</h3>
                    <div className="space-y-2">
                      {potentialNegativeChanges.map((change) => (
                        <label key={change} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.negativeChanges.includes(change)}
                            onChange={(e) => {
                              const newChanges = e.target.checked
                                ? [...data.negativeChanges, change]
                                : data.negativeChanges.filter(c => c !== change)
                              setData({ ...data, negativeChanges: newChanges })
                            }}
                            className="w-5 h-5 text-[#BF4C74] rounded border-gray-300 focus:ring-[#BF4C74]"
                          />
                          <span className="text-gray-700">{change}</span>
                        </label>
                      ))}
                      {/* Custom negative changes */}
                      {data.negativeChanges
                        .filter(change => !potentialNegativeChanges.includes(change))
                        .map((change, index) => (
                          <label key={`custom-neg-${index}`} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => {
                                setData({
                                  ...data,
                                  negativeChanges: data.negativeChanges.filter(c => c !== change)
                                })
                              }}
                              className="w-5 h-5 text-[#BF4C74] rounded border-gray-300 focus:ring-[#BF4C74]"
                            />
                            <span className="text-gray-700">{change}</span>
                          </label>
                        ))}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        value={customNegative}
                        onChange={(e) => setCustomNegative(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customNegative.trim()) {
                            e.preventDefault()
                            setData({ ...data, negativeChanges: [...data.negativeChanges, customNegative.trim()] })
                            setCustomNegative('')
                          }
                        }}
                        placeholder="Add your own..."
                        className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50 text-sm"
                      />
                      <button
                        onClick={() => {
                          if (customNegative.trim()) {
                            setData({ ...data, negativeChanges: [...data.negativeChanges, customNegative.trim()] })
                            setCustomNegative('')
                          }
                        }}
                        disabled={!customNegative.trim()}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          customNegative.trim()
                            ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Positive</h3>
                    <div className="space-y-2">
                      {potentialPositiveChanges.map((change) => (
                        <label key={change} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={data.positiveChanges.includes(change)}
                            onChange={(e) => {
                              const newChanges = e.target.checked
                                ? [...data.positiveChanges, change]
                                : data.positiveChanges.filter(c => c !== change)
                              setData({ ...data, positiveChanges: newChanges })
                            }}
                            className="w-5 h-5 text-[#BF4C74] rounded border-gray-300 focus:ring-[#BF4C74]"
                          />
                          <span className="text-gray-700">{change}</span>
                        </label>
                      ))}
                      {/* Custom positive changes */}
                      {data.positiveChanges
                        .filter(change => !potentialPositiveChanges.includes(change))
                        .map((change, index) => (
                          <label key={`custom-pos-${index}`} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={true}
                              onChange={() => {
                                setData({
                                  ...data,
                                  positiveChanges: data.positiveChanges.filter(c => c !== change)
                                })
                              }}
                              className="w-5 h-5 text-[#BF4C74] rounded border-gray-300 focus:ring-[#BF4C74]"
                            />
                            <span className="text-gray-700">{change}</span>
                          </label>
                        ))}
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        value={customPositive}
                        onChange={(e) => setCustomPositive(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customPositive.trim()) {
                            e.preventDefault()
                            setData({ ...data, positiveChanges: [...data.positiveChanges, customPositive.trim()] })
                            setCustomPositive('')
                          }
                        }}
                        placeholder="Add your own..."
                        className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50 text-sm"
                      />
                      <button
                        onClick={() => {
                          if (customPositive.trim()) {
                            setData({ ...data, positiveChanges: [...data.positiveChanges, customPositive.trim()] })
                            setCustomPositive('')
                          }
                        }}
                        disabled={!customPositive.trim()}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          customPositive.trim()
                            ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={data.negativeChanges.length === 0 && data.positiveChanges.length === 0}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      (data.negativeChanges.length > 0 || data.positiveChanges.length > 0)
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 5: Same vs New
      case 5:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(5)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  What's changing and what's staying the same?
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Same:
                    </label>
                    <textarea
                      value={data.staysSame}
                      onChange={(e) => setData({ ...data, staysSame: e.target.value })}
                      placeholder="What remains constant..."
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50 min-h-[150px] resize-y"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      New:
                    </label>
                    <textarea
                      value={data.whatsNew}
                      onChange={(e) => setData({ ...data, whatsNew: e.target.value })}
                      placeholder="What will be different..."
                      className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50 min-h-[150px] resize-y"
                    />
                  </div>
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!data.staysSame.trim() || !data.whatsNew.trim()}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      (data.staysSame.trim() && data.whatsNew.trim())
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 6: What's in Your Control
      case 6:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(6)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  What can you control?
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  I can control my...
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  {/* Pre-defined control options */}
                  {controlOptions.map((option) => {
                    const IconComponent = controlIcons[option]
                    return (
                      <button
                        key={option}
                        onClick={() => {
                          const newControl = data.inControl.includes(option)
                            ? data.inControl.filter(c => c !== option)
                            : [...data.inControl, option]
                          setData({ ...data, inControl: newControl })
                        }}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm flex items-center gap-2 ${
                          data.inControl.includes(option)
                            ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
                        }`}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        {option}
                      </button>
                    )
                  })}
                  
                  {/* Custom control options */}
                  {data.inControl
                    .filter(option => !controlOptions.includes(option))
                    .map((option, index) => (
                      <button
                        key={`custom-${index}`}
                        onClick={() => {
                          setData({
                            ...data,
                            inControl: data.inControl.filter(c => c !== option)
                          })
                        }}
                        className="px-4 py-2 rounded-full border-2 bg-[#BF4C74] text-white border-[#BF4C74] transition-all text-sm flex items-center gap-2"
                      >
                        <Target className="w-4 h-4" />
                        {option}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customControl}
                    onChange={(e) => setCustomControl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customControl.trim()) {
                        e.preventDefault()
                        setData({ ...data, inControl: [...data.inControl, customControl.trim()] })
                        setCustomControl('')
                      }
                    }}
                    placeholder="Add your own..."
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50"
                  />
                  <button
                    onClick={() => {
                      if (customControl.trim()) {
                        setData({ ...data, inControl: [...data.inControl, customControl.trim()] })
                        setCustomControl('')
                      }
                    }}
                    disabled={!customControl.trim()}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      customControl.trim()
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={data.inControl.length === 0}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.inControl.length > 0
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 7: Impacted People
      case 7:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(7)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Who might this change impact?
                </h2>
                
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPersonName.trim()) {
                        e.preventDefault()
                        setData({ ...data, impactedPeople: [...data.impactedPeople, newPersonName.trim()] })
                        setNewPersonName('')
                      }
                    }}
                    placeholder="Add a name..."
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50"
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (newPersonName.trim()) {
                        setData({ ...data, impactedPeople: [...data.impactedPeople, newPersonName.trim()] })
                        setNewPersonName('')
                      }
                    }}
                    disabled={!newPersonName.trim()}
                    className={`px-4 py-3 rounded-lg transition-colors ${
                      newPersonName.trim()
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {data.impactedPeople.map((person, index) => (
                    <div
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#BF4C74]/10 text-[#BF4C74] rounded-full"
                    >
                      <span>{person}</span>
                      <button
                        onClick={() => {
                          setData({
                            ...data,
                            impactedPeople: data.impactedPeople.filter((_, i) => i !== index)
                          })
                        }}
                        className="hover:text-[#A63D5F]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={data.impactedPeople.length === 0}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.impactedPeople.length > 0
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 8: Select Person to Talk To
      case 8:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(8)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Who would you like to talk to first?
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Select one person to prepare a conversation with
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  {data.impactedPeople.map((person, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setData({ ...data, selectedPerson: person })
                      }}
                      className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all ${
                        data.selectedPerson === person
                          ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{person}</span>
                    </button>
                  ))}
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!data.selectedPerson}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.selectedPerson
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 9: Anticipate Their Feelings
      case 9:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              {renderNavigationHeader(9)}
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  What might they be feeling?
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Consider how {data.selectedPerson} might react to this change
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  {/* Pre-defined emotions */}
                  {emotionOptions.map((emotion) => {
                    const IconComponent = emotionIcons[emotion]
                    return (
                      <button
                        key={emotion}
                        onClick={() => {
                          const newEmotions = data.anticipatedEmotions.includes(emotion)
                            ? data.anticipatedEmotions.filter(e => e !== emotion)
                            : [...data.anticipatedEmotions, emotion]
                          setData({ ...data, anticipatedEmotions: newEmotions })
                        }}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm flex items-center gap-2 ${
                          data.anticipatedEmotions.includes(emotion)
                            ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
                        }`}
                      >
                        {IconComponent && <IconComponent className="w-4 h-4" />}
                        {emotion}
                      </button>
                    )
                  })}
                  
                  {/* Custom emotions added by user */}
                  {data.anticipatedEmotions
                    .filter(emotion => !emotionOptions.includes(emotion))
                    .map((emotion, index) => (
                      <button
                        key={`custom-${index}`}
                        onClick={() => {
                          setData({
                            ...data,
                            anticipatedEmotions: data.anticipatedEmotions.filter(e => e !== emotion)
                          })
                        }}
                        className="px-4 py-2 rounded-full border-2 bg-[#BF4C74] text-white border-[#BF4C74] transition-all text-sm flex items-center gap-2"
                      >
                        {emotion}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAnticipatedEmotion}
                    onChange={(e) => setCustomAnticipatedEmotion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customAnticipatedEmotion.trim()) {
                        e.preventDefault()
                        setData({ ...data, anticipatedEmotions: [...data.anticipatedEmotions, customAnticipatedEmotion.trim()] })
                        setCustomAnticipatedEmotion('')
                      }
                    }}
                    placeholder="Add your own..."
                    className="flex-1 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50"
                  />
                  <button
                    onClick={() => {
                      if (customAnticipatedEmotion.trim()) {
                        setData({ ...data, anticipatedEmotions: [...data.anticipatedEmotions, customAnticipatedEmotion.trim()] })
                        setCustomAnticipatedEmotion('')
                      }
                    }}
                    disabled={!customAnticipatedEmotion.trim()}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      customAnticipatedEmotion.trim()
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={data.anticipatedEmotions.length === 0}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      data.anticipatedEmotions.length > 0
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
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

      // Stage 10: Change Reflection Summary (Final Stage)
      case 10:
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
            `}</style>
            <ViewportContainer className="bg-gradient-to-br from-[#F595B6]/20 to-[#BF4C74]/20 min-h-screen p-4 print-section">
              <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex justify-between items-center no-print">
                <button
                  onClick={() => {
                    setCurrentStage(0)
                    setData({
                      changeTypes: [],
                      changeDescription: '',
                      currentEmotions: [],
                      negativeChanges: [],
                      positiveChanges: [],
                      staysSame: '',
                      whatsNew: '',
                      inControl: [],
                      impactedPeople: [],
                      selectedPerson: '',
                      anticipatedEmotions: []
                    })
                  }}
                  className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Start Over
                </button>
                
                <div className="flex gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      analytics.trackDownload('Print', 'Change Reflection')
                      window.print()
                    }}
                    className="p-2.5 sm:p-3 border-2 border-[#BF4C74]/50 text-[#BF4C74] rounded-lg hover:border-[#BF4C74] hover:bg-[#BF4C74]/10 transition-all"
                    title="Print summary"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <ShareButton
                    onShare={handleShare}
                    className="px-3 sm:px-6 py-2.5 bg-[#BF4C74] hover:bg-[#A63D5F] text-white rounded-lg font-semibold transition-colors"
                  >
                    <Share2 className="w-5 h-5 inline sm:hidden" />
                    <span className="hidden sm:inline uppercase tracking-wider">Share</span>
                  </ShareButton>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">
                Change Reflection Summary
              </h1>
              <p className="text-gray-600 mb-8 text-center">
                Your complete reflection on this change journey
              </p>
              
              <div className="space-y-6">
                {/* Change Types */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Type of Change</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.changeTypes.map((change, index) => {
                      const IconComponent = changeTypeIcons[change]
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#BF4C74]/10 text-[#BF4C74] rounded-full text-sm font-medium"
                        >
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          {change}
                        </span>
                      )
                    })}
                  </div>
                </div>
                
                {/* What's Happening */}
                {data.changeDescription && (
                  <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">What's Happening</h3>
                    </div>
                    <p className="text-gray-700">{data.changeDescription}</p>
                  </div>
                )}
                
                {/* My Emotions */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">How I'm Feeling</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.currentEmotions.map((emotion, index) => {
                      const IconComponent = emotionIcons[emotion]
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#BF4C74]/10 text-[#BF4C74] rounded-full text-sm font-medium"
                        >
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          {emotion}
                        </span>
                      )
                    })}
                  </div>
                </div>
                
                {/* Impact Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Negative Changes */}
                  {data.negativeChanges.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Concerns</h3>
                      </div>
                      <div className="space-y-2">
                        {data.negativeChanges.map((change, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-[#BF4C74] mt-0.5">•</span>
                            <span className="text-gray-700">{change}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Positive Changes */}
                  {data.positiveChanges.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Opportunities</h3>
                      </div>
                      <div className="space-y-2">
                        {data.positiveChanges.map((change, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-[#BF4C74] mt-0.5">•</span>
                            <span className="text-gray-700">{change}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* What Stays & What's New */}
                <div className="grid md:grid-cols-2 gap-6">
                  {data.staysSame && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">What Stays the Same</h3>
                      </div>
                      <p className="text-gray-700">{data.staysSame}</p>
                    </div>
                  )}
                  
                  {data.whatsNew && (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                          <Star className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">What's New</h3>
                      </div>
                      <p className="text-gray-700">{data.whatsNew}</p>
                    </div>
                  )}
                </div>
                
                {/* What I Can Control */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                      <Target className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">I Can Control My...</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.inControl.map((item, index) => {
                      const IconComponent = controlIcons[item]
                      return (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#BF4C74]/10 text-[#BF4C74] rounded-full text-sm font-medium"
                        >
                          {IconComponent && <IconComponent className="w-4 h-4" />}
                          {item}
                        </span>
                      )
                    })}
                  </div>
                </div>
                
                {/* People Impacted */}
                <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">People Impacted</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {data.impactedPeople.map((person, index) => (
                      <div
                        key={index}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          person === data.selectedPerson
                            ? 'bg-[#BF4C74] text-white'
                            : 'bg-[#BF4C74]/10 text-[#BF4C74]'
                        }`}
                      >
                        {person}
                        {person === data.selectedPerson && <span className="ml-2 text-xs">(Selected)</span>}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Their Anticipated Emotions */}
                {data.selectedPerson && data.anticipatedEmotions.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-[#BF4C74]/20 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">How {data.selectedPerson} Might Feel</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.anticipatedEmotions.map((emotion, index) => {
                        const IconComponent = emotionIcons[emotion]
                        return (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#BF4C74]/10 text-[#BF4C74] rounded-full text-sm font-medium"
                          >
                            {IconComponent && <IconComponent className="w-4 h-4" />}
                            {emotion}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center no-print">
                <Link
                  href="/"
                  className="text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                >
                  Explore all Tools
                </Link>
                <button
                  onClick={() => {
                    setCurrentStage(0)
                    setData({
                      changeTypes: [],
                      changeDescription: '',
                      currentEmotions: [],
                      negativeChanges: [],
                      positiveChanges: [],
                      staysSame: '',
                      whatsNew: '',
                      inControl: [],
                      impactedPeople: [],
                      selectedPerson: '',
                      anticipatedEmotions: []
                    })
                  }}
                  className="px-8 py-3 bg-[#BF4C74] text-white rounded-lg font-semibold hover:bg-[#A63D5F] transition-colors"
                >
                  NEW REFLECTION
                </button>
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
      {currentStage === 10 && <Footer />}
    </>
  )
}