'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer, Heart, Share2 } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ViewportContainer from '@/components/ViewportContainer'
import { toolConfigs } from '@/lib/toolConfigs'
import { useAnalytics } from '@/hooks/useAnalytics'
import ShareButton from '@/components/ShareButton'
import { useEmailCapture } from '@/hooks/useEmailCapture'
import { validateEmail, validateEmailRealtime, EmailValidationResult } from '@/utils/emailValidation'

interface Question {
  id: string
  text: string
  dimension: 'exhaustion' | 'cynicism' | 'inefficacy' | 'neglect' | 'workload' | 'values'
}

interface Answer {
  questionId: string
  value: number
}

const questions: Question[] = [
  // Exhaustion
  { id: 'e1', text: 'I feel emotionally drained from my work', dimension: 'exhaustion' },
  { id: 'e2', text: 'I feel tired when I wake up and have to face another day on the job', dimension: 'exhaustion' },
  { id: 'e3', text: 'Working all day is really a strain for me', dimension: 'exhaustion' },
  
  // Cynicism
  { id: 'c1', text: 'I have become less interested in my work', dimension: 'cynicism' },
  { id: 'c2', text: 'I have become less enthusiastic about my work', dimension: 'cynicism' },
  { id: 'c3', text: 'I have become more cynical about whether my work contributes anything', dimension: 'cynicism' },
  
  // Inefficacy (reverse scored)
  { id: 'i1', text: 'I can effectively solve the problems that arise in my work', dimension: 'inefficacy' },
  { id: 'i2', text: 'I feel I am making an effective contribution to what this organization does', dimension: 'inefficacy' },
  { id: 'i3', text: 'In my opinion, I am good at my job', dimension: 'inefficacy' },
  
  // Neglect of personal needs
  { id: 'n1', text: 'I skip meals or eat at irregular times due to work', dimension: 'neglect' },
  { id: 'n2', text: 'I sacrifice sleep to get more work done', dimension: 'neglect' },
  { id: 'n3', text: 'I postpone personal activities or hobbies because of work', dimension: 'neglect' },
  
  // Workload
  { id: 'w1', text: 'I have too much work to do', dimension: 'workload' },
  { id: 'w2', text: 'I have unrealistic deadlines', dimension: 'workload' },
  { id: 'w3', text: 'I work under time pressure', dimension: 'workload' },
  
  // Values conflict (reverse scored)
  { id: 'v1', text: 'My values and the organization\'s values are aligned', dimension: 'values' },
  { id: 'v2', text: 'The work I do is meaningful to me', dimension: 'values' },
  { id: 'v3', text: 'I believe in the mission of my organization', dimension: 'values' },
]

const likertOptions = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
]

const dimensionInfo = {
  exhaustion: {
    title: 'Emotional Exhaustion',
    description: 'Feeling emotionally drained and depleted'
  },
  cynicism: {
    title: 'Cynicism',
    description: 'Detachment and negative attitudes toward work'
  },
  inefficacy: {
    title: 'Professional Efficacy',
    description: 'Feelings of competence and achievement'
  },
  neglect: {
    title: 'Self-Care Neglect',
    description: 'Sacrificing personal needs for work'
  },
  workload: {
    title: 'Workload',
    description: 'Amount and pace of work demands'
  },
  values: {
    title: 'Values Alignment',
    description: 'Alignment between personal and organizational values'
  }
}

export default function BurnoutAssessmentPage() {
  const analytics = useAnalytics()
  const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
  const [showIntro, setShowIntro] = useState(true)
  const [showNameInput, setShowNameInput] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [userName, setUserName] = useState('')
  const [startTime] = useState(Date.now())
  const [userEmail, setUserEmail] = useState('')
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ isValid: true })
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set())
  
  const config = toolConfigs.burnoutAssessment

  // Track tool start
  useEffect(() => {
    analytics.trackToolStart('Burnout Assessment')
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
    
    // Real-time validation
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
    // Final validation before starting
    const finalValidation = validateEmail(userEmail)
    setEmailValidation(finalValidation)
    
    if (!finalValidation.isValid) {
      setShowSuggestion(!!finalValidation.suggestion)
      return
    }
    
    if (userEmail) {
      await captureEmailForTool(userEmail, 'Burnout Assessment', 'ba')
    }
    setShowIntro(false)
    setShowNameInput(true)
  }

  // Track progress
  useEffect(() => {
    if (!showIntro && !showNameInput && !showResults) {
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100
      analytics.trackToolProgress('Burnout Assessment', `Question ${currentQuestionIndex + 1}`, progress)
    }
  }, [currentQuestionIndex, showIntro, showNameInput, showResults])
  
  // Helper function to format name as sentence case
  const formatName = (name: string) => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }
  
  const currentQuestion = questions[currentQuestionIndex]
  const currentDimension = currentQuestion?.dimension
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  
  const handleAnswer = (value: number, autoAdvance: boolean = false) => {
    const newAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id)]
    newAnswers.push({ questionId: currentQuestion.id, value })
    setAnswers(newAnswers)
    
    // Auto-advance only on keyboard selection
    if (autoAdvance) {
      setTimeout(() => {
        handleNext()
      }, 200)
    }
  }
  
  const getCurrentAnswer = () => {
    return answers.find(a => a.questionId === currentQuestion.id)?.value
  }
  
  const handleNext = () => {
    // Mark current question as completed
    setCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]))
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Track completion
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      const scores = calculateScores()
      analytics.trackToolComplete('Burnout Assessment', {
        userName: userName,
        completionTime: timeSpent,
        total_score: scores.total,
        risk_level: scores.riskLevel,
        highest_risk: scores.dimensions[0]?.dimension || 'none'
      })
      setShowResults(true)
    }
  }
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentQuestionIndex === 0) {
      // Go back to name input
      setShowNameInput(true)
    }
  }
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-5 for selecting options
      if (e.key >= '1' && e.key <= '5' && !showIntro && !showNameInput && !showResults) {
        const value = parseInt(e.key)
        handleAnswer(value, true) // Pass true for auto-advance
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && !showIntro && !showNameInput && !showResults && currentQuestionIndex > 0) {
        handlePrevious()
      }
      
      if (e.key === 'ArrowRight' && !showIntro && !showNameInput && !showResults && getCurrentAnswer()) {
        handleNext()
      }
      
      // Enter key for starting the assessment on intro
      if (e.key === 'Enter' && showIntro && emailValidation.isValid && userEmail) {
        handleStartAssessment()
      }
      
      // Enter key for continuing from name input
      if (e.key === 'Enter' && showNameInput && userName.trim()) {
        setShowNameInput(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showIntro, showNameInput, showResults, currentQuestionIndex, userName])
  
  const calculateScores = () => {
    const dimensions = ['exhaustion', 'cynicism', 'inefficacy', 'neglect', 'workload', 'values'] as const
    const scores = dimensions.map(dimension => {
      const dimensionQuestions = questions.filter(q => q.dimension === dimension)
      const dimensionAnswers = answers.filter(a => 
        dimensionQuestions.some(q => q.id === a.questionId)
      )
      const total = dimensionAnswers.reduce((sum, a) => sum + a.value, 0)
      const average = dimensionAnswers.length > 0 ? total / dimensionAnswers.length : 0
      
      // Reverse score for positive dimensions (inefficacy and values)
      const finalScore = (dimension === 'inefficacy' || dimension === 'values') 
        ? 6 - average 
        : average
        
      return { dimension, score: finalScore, count: dimensionAnswers.length }
    })
    
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length
    const riskLevel = getBurnoutLevel(totalScore).level
    return { dimensions: scores.sort((a, b) => b.score - a.score), overall: totalScore, total: totalScore, riskLevel }
  }
  
  const getBurnoutLevel = (score: number) => {
    if (score >= 4) return { level: 'High Risk', color: 'text-red-600' }
    if (score >= 3) return { level: 'Moderate Risk', color: 'text-orange-600' }
    if (score >= 2) return { level: 'Low Risk', color: 'text-yellow-600' }
    return { level: 'Minimal Risk', color: 'text-green-600' }
  }
  
  const getRecommendations = (dimension: string, score: number) => {
    const recommendations = {
      exhaustion: [
        'Schedule regular breaks throughout your workday',
        'Practice energy management techniques like the Pomodoro method',
        'Establish clear work-life boundaries',
        'Prioritize sleep and maintain a consistent sleep schedule'
      ],
      cynicism: [
        'Reconnect with the purpose and impact of your work',
        'Seek opportunities for meaningful projects',
        'Build positive relationships with colleagues',
        'Celebrate small wins and accomplishments'
      ],
      inefficacy: [
        'Set achievable goals and track your progress',
        'Seek feedback and mentorship',
        'Invest in skill development and learning',
        'Document and reflect on your accomplishments'
      ],
      neglect: [
        'Schedule personal activities like you would meetings',
        'Set non-negotiable self-care routines',
        'Use calendar blocking for meals and breaks',
        'Practice saying no to protect personal time'
      ],
      workload: [
        'Communicate workload concerns with your manager',
        'Prioritize tasks using urgency/importance matrix',
        'Delegate when possible',
        'Negotiate realistic deadlines'
      ],
      values: [
        'Identify aspects of work that align with your values',
        'Seek projects that feel meaningful',
        'Connect your daily tasks to larger impact',
        'Consider discussing concerns with leadership'
      ]
    }
    
    if (score >= 3.5) {
      return recommendations[dimension as keyof typeof recommendations] || []
    } else if (score >= 2.5) {
      return recommendations[dimension as keyof typeof recommendations]?.slice(0, 2) || []
    } else {
      return [recommendations[dimension as keyof typeof recommendations]?.[0] || 'Keep up your current practices!']
    }
  }

  // Intro Screen (Full vibrant gradient)
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#74DEDE] to-[#30B859] flex flex-col items-center justify-center p-4">
        <Link 
          href="/?screen=4" 
          className="absolute top-8 left-8 inline-flex items-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Plan
        </Link>
        
        <Link 
          href="/toolkit" 
          className="absolute top-8 right-8 inline-flex items-center text-white/70 hover:text-white transition-colors"
        >
          All Tools
          <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
        </Link>
        
        <div className="text-center text-white mb-12 max-w-3xl">
          <div className="inline-flex p-4 sm:p-6 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <Heart className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">{config.title}</h1>
          <h2 className="text-3xl mb-8">{config.subtitle}</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            {config.description}
          </p>
        </div>
        
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
          <div className="space-y-6">
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
                    emailValidation.isValid 
                      ? 'border-white/30' 
                      : 'border-red-300/50'
                  }`}
                  autoComplete="email"
                />
              </div>
              
              {/* Validation feedback */}
              {!emailValidation.isValid && emailValidation.error && (
                <div className="text-sm text-red-200 mt-1">
                  {emailValidation.error}
                </div>
              )}
              
              {/* Suggestion button */}
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
              className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
                emailValidation.isValid && userEmail
                  ? 'bg-white text-[#30B859] hover:bg-white/90'
                  : 'bg-white/50 text-[#30B859]/50 cursor-not-allowed'
              }`}
            >
              <span className="sm:hidden">Start Assessment</span>
              <span className="hidden sm:inline">Start Burnout Assessment</span>
            </button>
            
            <p className="text-white/70 text-sm text-center">
              This will take about 5-7 minutes to complete
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Name Input Screen
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#74DEDE] via-[#52C7C7] to-[#30B859] flex flex-col items-center justify-center p-4">
        <Link 
          href="/?screen=4" 
          className="absolute top-8 left-8 inline-flex items-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Plan
        </Link>
        
        <Link 
          href="/toolkit" 
          className="absolute top-8 right-8 inline-flex items-center text-white/70 hover:text-white transition-colors"
        >
          All Tools
          <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
        </Link>
        
        <div className="max-w-2xl w-full">
          <button
            onClick={() => {
              setShowNameInput(false);
              setShowIntro(true);
            }}
            className="text-white/80 hover:text-white flex items-center gap-2 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white text-center mb-6">Ready to check in?</h3>
            
            <div className="space-y-6">
              <div className="text-xl text-white/90 text-center">
                <p>This assessment is just for you.</p>
                <p>What should we call you?</p>
              </div>
              
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userName.trim()) {
                    setShowNameInput(false);
                  }
                }}
                placeholder="Enter your first name..."
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                autoFocus
              />
              
              <button
                onClick={() => setShowNameInput(false)}
                disabled={!userName.trim()}
                className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
                  userName.trim()
                    ? 'bg-white text-[#30B859] hover:bg-white/90'
                    : 'bg-white/50 text-[#30B859]/50 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    const { dimensions, overall } = calculateScores()
    const burnoutLevel = getBurnoutLevel(overall)
    
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
        <div className="min-h-screen bg-white sm:bg-gradient-to-br sm:from-[#74DEDE]/10 sm:via-[#52C696]/10 sm:to-[#30B859]/10 py-16 print-section">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 no-print">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setCurrentQuestionIndex(questions.length - 1)
                  }}
                  className="text-[#30B859] hover:text-[#289A4D] flex items-center gap-2 font-medium text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Back</span>
                </button>
                <div className="flex gap-2 sm:gap-4">
                  <button
                    onClick={() => {
                      analytics.trackDownload('Print', 'Burnout Assessment')
                      window.print()
                    }}
                    className="hidden sm:block p-2.5 sm:p-3 border-2 border-[#30B859]/50 text-[#30B859] rounded-lg hover:border-[#30B859] hover:bg-[#30B859]/10 transition-all"
                    title="Print results"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <ShareButton
                    onShare={async () => {
                      const shareData = {
                        type: 'burnout-assessment',
                        toolName: 'Burnout Assessment',
                        userName: formatName(userName),
                        results: {
                          dimensions,
                          overall,
                          overallReadiness: getBurnoutLevel(overall)
                        }
                      }
                      
                      const response = await fetch('/api/share', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(shareData)
                      })
                      
                      if (!response.ok) {
                        throw new Error('Failed to create share link')
                      }
                      
                      const { id } = await response.json()
                      const shareUrl = `${window.location.origin}/burnout-assessment/share/${id}`
                      
                      // Track share event
                      analytics.trackShare('Burnout Assessment', 'link', {
                        userName: userName,
                        risk_level: getBurnoutLevel(overall).level,
                        total_score: overall
                      })
                      
                      return shareUrl
                    }}
                    className="px-3 sm:px-6 py-2.5 bg-[#30B859] hover:bg-[#289A4D] text-white rounded-lg font-semibold transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline uppercase tracking-wider">Share</span>
                  </ShareButton>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-nightfall mb-2 text-center">Burnout Assessment Results</h1>
              <p className="text-gray-600 mb-8 text-center">
                Check-in for {formatName(userName)}
              </p>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
                <h2 className="text-2xl font-semibold text-nightfall mb-4 text-center">
                  Overall Burnout Risk: <span className={burnoutLevel.color}>{burnoutLevel.level}</span>
                </h2>
                <div className="text-3xl font-bold text-[#30B859] text-center">
                  {overall.toFixed(1)} / 5.0
                </div>
              </div>
            
            <div className="space-y-6 mb-8">
              {dimensions.map(({ dimension, score }) => {
                const info = dimensionInfo[dimension as keyof typeof dimensionInfo]
                const percentage = (score / 5) * 100
                const riskLevel = getBurnoutLevel(score)
                
                return (
                  <div key={dimension} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-nightfall">{info.title}</h3>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#30B859]">
                          {score.toFixed(1)} / 5.0
                        </div>
                        <div className={`text-sm font-medium ${riskLevel.color}`}>
                          {riskLevel.level}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-[#74DEDE] to-[#30B859] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Strategies:</h4>
                      {getRecommendations(dimension, score).map((rec, index) => (
                        <p key={index} className="text-gray-600 text-sm pl-4">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="flex justify-center mt-8 no-print">
              <button
                onClick={() => {
                  setShowResults(false)
                  setCurrentQuestionIndex(0)
                  setAnswers([])
                  setShowIntro(true)
                }}
                className="px-8 py-3 bg-[#30B859] text-white rounded-lg font-semibold hover:bg-[#289A4D] transition-colors shadow-lg"
              >
                RETAKE ASSESSMENT
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </>
    )
  }

  // Main Assessment Screen
  if (!showIntro && !showNameInput && !showResults) {
    return (
    <div className="min-h-screen bg-gray-50 p-4" data-bg style={{WebkitBackgroundClip: 'border-box'}}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center text-[#30B859] hover:text-[#289A4D] transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Start Over
            </button>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <div className="flex items-center gap-2">
                {Array.from({ length: questions.length }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index <= currentQuestionIndex || completedQuestions.has(index)) {
                    setCurrentQuestionIndex(index)
                  }
                }}
                disabled={!completedQuestions.has(index) && index > currentQuestionIndex}
                className={`h-2 rounded-full transition-all ${
                  index === currentQuestionIndex
                    ? 'w-8 bg-[#30B859]'
                    : completedQuestions.has(index) || index < currentQuestionIndex
                    ? 'w-2 bg-[#30B859]/50 hover:bg-[#30B859]/70 cursor-pointer'
                    : 'w-2 bg-gray-300 cursor-not-allowed'
                }`}
                aria-label={`Go to question ${index + 1}`}
              />
            ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {currentDimension && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-nightfall">
                {dimensionInfo[currentDimension].title}
              </h2>
            </div>
          )}
          
          <div className="mb-8">
            {userName && (
              <p className="text-center text-gray-600 mb-4">
                How often does this apply to you, <span className="font-semibold text-[#30B859]">{formatName(userName)}</span>?
              </p>
            )}
            <h3 className="text-xl font-medium text-nightfall mb-6 text-center">
              {currentQuestion.text}
            </h3>
            
            <div className="space-y-3">
              {likertOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value, false)} // No auto-advance on click
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                    getCurrentAnswer() === option.value
                      ? 'bg-gradient-to-r from-[#74DEDE] to-[#30B859] text-white border-[#30B859] shadow-lg'
                      : 'bg-white text-nightfall border-gray-200 hover:border-[#74DEDE]/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        getCurrentAnswer() === option.value
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.value}
                      </span>
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 ${
                      getCurrentAnswer() === option.value
                        ? 'border-white bg-white'
                        : 'border-gray-400'
                    }`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!getCurrentAnswer()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !getCurrentAnswer()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#30B859] text-white hover:bg-[#289A4D]'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
  }
  
  // Fallback return
  // Fallback return
  return null
}