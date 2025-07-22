'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer, Share2, RefreshCw, Plus, X, Calendar, Mail, Users } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ViewportContainer from '@/components/ViewportContainer'
import ShareButton from '@/components/ShareButton'
import ToolNavigation from '@/components/ToolNavigation'
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
  'Re-organization', 'Launch', 'Leadership Change', 'Migration', 'Budget Cuts',
  'Role Changes', 'Strategic Shift', 'Merger or Acquisition', 'Layoffs',
  'Compliance Change', 'Policy Change', 'Culture Shift', 'External Crisis', 'Market Change'
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
  'Disapproving', 'Disappointed', 'Awful', 'Repelled', 'Hesitant'
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

// Control options
const controlOptions = [
  'My attitude', 'My effort', 'My communication', 'My learning',
  'My relationships', 'My boundaries', 'My priorities', 'My response'
]

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
    if (currentStage < 11) {
      setCurrentStage(currentStage + 1)
      const progress = ((currentStage + 1) / 11) * 100
      analytics.trackToolProgress('Change Reflection', `Stage ${currentStage + 1}`, progress)
    } else {
      // Complete
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
      results: {
        data,
        guide,
        selectedPerson: data.selectedPerson
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
        className="text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
      >
        ← Start Over
      </button>
      
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Step {stage} of 11
        </div>
        <div className="flex items-center gap-1">
          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === stage - 1
                  ? 'w-8 bg-[#BF4C74]'
                  : i < stage - 1
                  ? 'w-2 bg-[#BF4C74]'
                  : 'w-2 bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )

  // Render different stages
  const renderStage = () => {
    switch (currentStage) {
      // Stage 0: Intro
      case 0:
        return (
          <ViewportContainer className="bg-gradient-to-br from-[#F595B6] to-[#BF4C74] flex flex-col items-center justify-center p-4">
            <ToolNavigation />
            
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
                    disabled={!userEmail || !emailValidation.isValid}
                    className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                      userEmail && emailValidation.isValid
                        ? 'bg-white text-[#BF4C74] hover:bg-white/90'
                        : 'bg-white/50 text-[#BF4C74]/50 cursor-not-allowed'
                    }`}
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
                  Select the change that best describes your situation
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  {changeTypes.map((change) => (
                    <button
                      key={change}
                      onClick={() => {
                        const newTypes = data.changeTypes.includes(change)
                          ? data.changeTypes.filter(t => t !== change)
                          : [...data.changeTypes, change]
                        setData({ ...data, changeTypes: newTypes })
                      }}
                      className={`px-6 py-3 rounded-full border-2 transition-all ${
                        data.changeTypes.includes(change)
                          ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
                      }`}
                    >
                      {change}
                    </button>
                  ))}
                </div>
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
                
                <textarea
                  value={data.changeDescription}
                  onChange={(e) => setData({ ...data, changeDescription: e.target.value })}
                  placeholder="Explain..."
                  className="w-full px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50 min-h-[150px] resize-y"
                  autoFocus
                />
                
                {/* Buttons inside the white box */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 3 of 11
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  How are you feeling about this change?
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Select all emotions that resonate with you
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  {emotionOptions.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => {
                        const newEmotions = data.currentEmotions.includes(emotion)
                          ? data.currentEmotions.filter(e => e !== emotion)
                          : [...data.currentEmotions, emotion]
                        setData({ ...data, currentEmotions: newEmotions })
                      }}
                      className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
                        data.currentEmotions.includes(emotion)
                          ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={customEmotion}
                    onChange={(e) => setCustomEmotion(e.target.value)}
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
                
                <button
                  onClick={handleNext}
                  disabled={data.currentEmotions.length === 0}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    data.currentEmotions.length > 0
                      ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 4: Negative Changes
      case 4:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 4 of 11
                  </div>
                </div>
              </div>
              
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
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        value={customNegative}
                        onChange={(e) => setCustomNegative(e.target.value)}
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
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <input
                        type="text"
                        value={customPositive}
                        onChange={(e) => setCustomPositive(e.target.value)}
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
                
                <button
                  onClick={handleNext}
                  disabled={data.negativeChanges.length === 0 && data.positiveChanges.length === 0}
                  className={`w-full mt-8 py-3 rounded-lg font-medium transition-colors ${
                    (data.negativeChanges.length > 0 || data.positiveChanges.length > 0)
                      ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 5: Same vs New
      case 5:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 5 of 11
                  </div>
                </div>
              </div>
              
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
                
                <button
                  onClick={handleNext}
                  disabled={!data.staysSame.trim() || !data.whatsNew.trim()}
                  className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                    (data.staysSame.trim() && data.whatsNew.trim())
                      ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 6: What's in Your Control
      case 6:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 6 of 11
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  What can you control?
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Focus on what's within your influence
                </p>
                
                <div className="space-y-3">
                  {controlOptions.map((option) => (
                    <label key={option} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.inControl.includes(option)}
                        onChange={(e) => {
                          const newControl = e.target.checked
                            ? [...data.inControl, option]
                            : data.inControl.filter(c => c !== option)
                          setData({ ...data, inControl: newControl })
                        }}
                        className="w-5 h-5 text-[#BF4C74] rounded border-gray-300 focus:ring-[#BF4C74]"
                      />
                      <span className="text-gray-700">{option}</span>
                    </label>
                  ))}
                </div>
                
                <div className="flex gap-2 mt-6">
                  <input
                    type="text"
                    value={customControl}
                    onChange={(e) => setCustomControl(e.target.value)}
                    placeholder="Add your own..."
                    className="flex-1 px-4 py-3 bg-gray-50 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#BF4C74]/50"
                  />
                  <button
                    onClick={() => {
                      if (customControl.trim()) {
                        setData({ ...data, inControl: [...data.inControl, customControl.trim()] })
                        setCustomControl('')
                      }
                    }}
                    disabled={!customControl.trim()}
                    className={`px-4 py-3 rounded-lg transition-colors ${
                      customControl.trim()
                        ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={data.inControl.length === 0}
                  className={`w-full mt-6 py-3 rounded-lg font-medium transition-colors ${
                    data.inControl.length > 0
                      ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 7: Impacted People
      case 7:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 7 of 11
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Who might this change impact?
                </h2>
                
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
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
                
                <button
                  onClick={handleNext}
                  disabled={data.impactedPeople.length === 0}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    data.impactedPeople.length > 0
                      ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 8: Select Person to Talk To
      case 8:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 8 of 11
                  </div>
                </div>
              </div>
              
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
                        handleNext()
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
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 9: Anticipate Their Feelings
      case 9:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 9 of 11
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  What might they be feeling?
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  Consider how {data.selectedPerson} might react to this change
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  {emotionOptions.map((emotion) => (
                    <button
                      key={emotion}
                      onClick={() => {
                        const newEmotions = data.anticipatedEmotions.includes(emotion)
                          ? data.anticipatedEmotions.filter(e => e !== emotion)
                          : [...data.anticipatedEmotions, emotion]
                        setData({ ...data, anticipatedEmotions: newEmotions })
                      }}
                      className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
                        data.anticipatedEmotions.includes(emotion)
                          ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
                      }`}
                    >
                      {emotion}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={data.anticipatedEmotions.length === 0}
                  className={`w-full mt-8 py-3 rounded-lg font-medium transition-colors ${
                    data.anticipatedEmotions.length > 0
                      ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 10: Review Conversation Guide
      case 10:
        const guide = generateConversationGuide()
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 10 of 11
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Review Your Conversation Guide
                </h2>
                
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="text-sm text-gray-500 mb-4">
                    SHARE: Overview of the change what's changing vs. not.
                    Impact this might have.
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-gray-700">{guide.opening}</p>
                    {guide.context && <p className="text-gray-700">{guide.context}</p>}
                    <p className="text-gray-700">{guide.feelings}</p>
                    {guide.concerns && <p className="text-gray-700">{guide.concerns}</p>}
                    {guide.opportunities && <p className="text-gray-700">{guide.opportunities}</p>}
                    <p className="text-gray-700">{guide.control}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-2">
                      LISTEN: What are you feeling?
                      What questions do you have?
                      What can you control?
                      What would make this better/easier?
                    </div>
                    <p className="text-gray-700">{guide.ask}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500 mb-2">
                      PLAN: Commit to a few things to improve the situation.
                      Plan a check-in.
                    </div>
                    <p className="text-gray-700">{guide.close}</p>
                  </div>
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-3 bg-white border-2 border-[#BF4C74] text-[#BF4C74] rounded-lg font-medium hover:bg-[#BF4C74]/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Printer className="w-5 h-5" />
                    Print Guide
                  </button>
                  <ShareButton
                    onShare={handleShare}
                    className="flex-1 py-3 bg-white border-2 border-[#BF4C74] text-[#BF4C74] rounded-lg font-medium hover:bg-[#BF4C74]/5 transition-colors"
                  >
                    <Share2 className="w-5 h-5 inline mr-2" />
                    Share Guide
                  </ShareButton>
                </div>
                
                <button
                  onClick={handleNext}
                  className="w-full mt-4 py-3 bg-[#BF4C74] text-white rounded-lg font-medium hover:bg-[#A63D5F] transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          </ViewportContainer>
        )

      // Stage 11: Schedule Conversation
      case 11:
        return (
          <ViewportContainer className="bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={handleBack}
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <div className="text-sm text-gray-600">
                    Step 11 of 11
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Take the next steps:
                </h2>
                
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      // TODO: Implement calendar integration
                      alert('Calendar integration coming soon!')
                    }}
                    className="w-full py-4 bg-white border-2 border-[#BF4C74] text-[#BF4C74] rounded-lg font-medium hover:bg-[#BF4C74]/5 transition-colors flex items-center justify-center gap-3"
                  >
                    <Calendar className="w-5 h-5" />
                    Schedule your conversation
                  </button>
                  
                  <button
                    onClick={() => {
                      const changeTypesText = data.changeTypes.length === 1 
                        ? data.changeTypes[0]
                        : data.changeTypes.slice(0, -1).join(', ') + ' and ' + data.changeTypes[data.changeTypes.length - 1]
                      const subject = `Let's talk about the ${changeTypesText}`
                      const body = `Hi ${data.selectedPerson},\n\nI'd like to schedule some time to talk with you about the ${changeTypesText.toLowerCase()} that's happening. When would be a good time for you?\n\nBest,\n[Your name]`
                      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                    }}
                    className="w-full py-4 bg-white border-2 border-[#BF4C74] text-[#BF4C74] rounded-lg font-medium hover:bg-[#BF4C74]/5 transition-colors flex items-center justify-center gap-3"
                  >
                    <Mail className="w-5 h-5" />
                    Send invite: Invite Email
                  </button>
                </div>
                
                <div className="mt-8 text-center">
                  <Link
                    href="/"
                    className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
                  >
                    Back to Home
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </div>
              </div>
            </div>
          </ViewportContainer>
        )

      default:
        return null
    }
  }

  return (
    <>
      {renderStage()}
      {currentStage === 11 && <Footer />}
    </>
  )
}