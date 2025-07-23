'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer, Share2 } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ViewportContainer from '@/components/ViewportContainer'
import { toolConfigs } from '@/lib/toolConfigs'
import { Question, Answer, questions, dimensionInfo, getChangeReadinessLevel, getChangeRecommendations } from '@/lib/changeReadinessHelpers'
import ShareButton from '@/components/ShareButton'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useEmailCapture } from '@/hooks/useEmailCapture'
import { validateEmail, validateEmailRealtime, EmailValidationResult } from '@/utils/emailValidation'
import ToolNavigation from '@/components/ToolNavigation'

const likertOptions = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither Agree nor Disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
]


export default function ChangeReadinessPage() {
  const analytics = useAnalytics()
  const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
  const [showIntro, setShowIntro] = useState(true)
  const [showChangeContext, setShowChangeContext] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [changeContext, setChangeContext] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ isValid: true })
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [startTime] = useState(Date.now())
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set())
  
  const config = toolConfigs.changeReadiness

  // Track tool start
  useEffect(() => {
    analytics.trackToolStart('Change Readiness')
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

  const handleStartChangeReadiness = async () => {
    const finalValidation = validateEmail(userEmail)
    setEmailValidation(finalValidation)
    
    if (!finalValidation.isValid) {
      setShowSuggestion(!!finalValidation.suggestion)
      return
    }
    
    if (userEmail) {
      await captureEmailForTool(userEmail, 'Change Readiness', 'cr')
    }
    setShowIntro(false)
    setShowChangeContext(true)
  }
  
  const currentQuestion = questions[currentQuestionIndex]
  const currentDimension = currentQuestion?.dimension
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  // Track progress
  useEffect(() => {
    if (!showIntro && !showResults) {
      analytics.trackToolProgress('Change Readiness', `Question ${currentQuestionIndex + 1}`, progress)
    }
  }, [currentQuestionIndex, showIntro, showResults])
  
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
      const readinessLevel = getChangeReadinessLevel(scores.total)
      analytics.trackToolComplete('Change Readiness', {
        changeContext: changeContext.slice(0, 50),
        completionTime: timeSpent,
        total_score: scores.total,
        readiness_level: readinessLevel.level
      })
      setShowResults(true)
    }
  }
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentQuestionIndex === 0) {
      // Go back to change context input
      setShowChangeContext(true)
    }
  }
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-5 for selecting options
      if (e.key >= '1' && e.key <= '5' && !showIntro && !showChangeContext && !showResults) {
        const value = parseInt(e.key)
        handleAnswer(value, true) // Pass true for auto-advance
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && !showIntro && !showChangeContext && !showResults && currentQuestionIndex > 0) {
        handlePrevious()
      }
      
      if (e.key === 'ArrowRight' && !showIntro && !showChangeContext && !showResults && getCurrentAnswer()) {
        handleNext()
      }
      
      // Enter key for starting the assessment on intro
      if (e.key === 'Enter' && showIntro && emailValidation.isValid && userEmail) {
        handleStartChangeReadiness()
      }
      
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showIntro, showChangeContext, showResults, currentQuestionIndex, changeContext])
  
  const calculateScores = () => {
    const dimensions = ['people', 'purpose', 'principles'] as const
    const scores = dimensions.map(dimension => {
      const dimensionQuestions = questions.filter(q => q.dimension === dimension)
      const dimensionAnswers = answers.filter(a => 
        dimensionQuestions.some(q => q.id === a.questionId)
      )
      const total = dimensionAnswers.reduce((sum, a) => sum + a.value, 0)
      return { dimension, score: total, count: dimensionAnswers.length }
    })
    
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
    return { dimensions: scores, total: totalScore }
  }
  

  // Intro Screen (Full vibrant gradient)
  if (showIntro) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-[#F595B6] to-[#BF4C74] flex flex-col items-center justify-center p-4">
        <ToolNavigation />
        
        <div className="text-center text-white mb-12 max-w-3xl">
          <div className="inline-flex p-4 sm:p-6 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <ArrowRight className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">{config.title}</h1>
          <h2 className="text-3xl mb-8">{config.subtitle}</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            {config.description}
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
            onClick={handleStartChangeReadiness}
            disabled={!emailValidation.isValid || !userEmail}
            className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
              emailValidation.isValid && userEmail
                ? 'bg-white text-[#BF4C74] hover:bg-white/90'
                : 'bg-white/50 text-[#BF4C74]/50 cursor-not-allowed'
            }`}
          >
            <span className="sm:hidden">Start Assessment</span>
            <span className="hidden sm:inline">Start Change Readiness Assessment</span>
          </button>
          
          <p className="text-white/70 text-sm text-center">
            This will take about 5-7 minutes to complete
          </p>
        </div>
      </ViewportContainer>
    )
  }

  // Change Context Screen
  if (showChangeContext) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-[#F595B6] via-[#E37A75] to-[#BF4C74] flex items-center justify-center p-4">
        <ToolNavigation />
        
        <div className="max-w-2xl w-full">
          <button
            onClick={() => {
              setShowChangeContext(false);
              setShowIntro(true);
            }}
            className="text-white/80 hover:text-white flex items-center gap-2 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white text-center mb-6">What change are you facing?</h3>
            
            <div className="space-y-6">
              <p className="text-xl text-white/90 text-center">
                Briefly describe the change you're navigating.
              </p>
              
              <textarea
                value={changeContext}
                onChange={(e) => setChangeContext(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey && changeContext.trim()) {
                    setShowChangeContext(false);
                  }
                }}
                placeholder="e.g., Team restructuring, new technology implementation, role transition..."
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg min-h-[100px] resize-y"
                autoFocus
              />
              
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                <p className="text-sm text-white/90 text-center">
                  💡 Tip: Press Ctrl+Enter to continue
                </p>
              </div>
              
              <button
                onClick={() => setShowChangeContext(false)}
                disabled={!changeContext.trim()}
                className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
                  changeContext.trim()
                    ? 'bg-white text-[#BF4C74] hover:bg-white/90'
                    : 'bg-white/50 text-[#BF4C74]/50 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </ViewportContainer>
    )
  }

  // Results Screen
  if (showResults) {
    const { dimensions, total } = calculateScores()
    const overallReadiness = getChangeReadinessLevel(total)
    
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
        <ViewportContainer className="bg-white sm:bg-gradient-to-br sm:from-[#F595B6]/10 sm:via-[#E37A75]/10 sm:to-[#BF4C74]/10 py-16 print-section">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 no-print">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setCurrentQuestionIndex(questions.length - 1)
                  }}
                  className="text-[#BF4C74] hover:text-[#A63D5F] flex items-center gap-2 font-medium text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Back</span>
                </button>
                <div className="flex gap-2 sm:gap-4">
                  <button
                    onClick={() => window.print()}
                    className="hidden sm:block p-2.5 sm:p-3 border-2 border-[#BF4C74]/50 text-[#BF4C74] rounded-lg hover:border-[#BF4C74] hover:bg-[#BF4C74]/10 transition-all"
                    title="Print results"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <ShareButton
                    onShare={async () => {
                      const { dimensions, total } = calculateScores()
                      const overallReadiness = getChangeReadinessLevel(total)
                      
                      const shareData = {
                        type: 'change-readiness-assessment',
                        toolName: 'Change Readiness Assessment',
                        results: {
                          changeContext,
                          dimensions,
                          total,
                          overallReadiness,
                          answers,
                          questions
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
                      
                      return fullUrl
                    }}
                    className="px-3 sm:px-6 py-2.5 bg-[#BF4C74] hover:bg-[#A63D5F] text-white rounded-lg font-semibold transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline uppercase tracking-wider">Share</span>
                  </ShareButton>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-nightfall mb-2 text-center">Change Readiness Results</h1>
              <p className="text-gray-600 mb-8 text-center">
                Change context: <span className="font-medium">{changeContext}</span>
              </p>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
                <h2 className="text-2xl font-semibold text-nightfall mb-2 text-center">
                  Overall Readiness: <span className={overallReadiness.color}>{overallReadiness.level}</span>
                </h2>
                <p className="text-gray-600 text-center mb-4">{overallReadiness.description}</p>
                <div className="text-3xl font-bold text-[#BF4C74] text-center">
                  {total} / 75 points
                </div>
              </div>
            
            <div className="space-y-6 mb-8">
              {dimensions.map(({ dimension, score }) => {
                const info = dimensionInfo[dimension as keyof typeof dimensionInfo]
                const percentage = (score / 25) * 100
                const readiness = getChangeReadinessLevel(score)
                
                return (
                  <div key={dimension} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-nightfall">{info.title}</h3>
                        <p className="text-sm text-gray-600">{info.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#BF4C74]">
                          {score} / 25
                        </div>
                        <div className={`text-sm font-medium ${readiness.color}`}>
                          {readiness.level} Readiness
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-[#F595B6] to-[#BF4C74] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Next steps:</h4>
                      {getChangeRecommendations(dimension, score).map((rec, index) => (
                        <p key={index} className="text-gray-600 text-sm pl-4">
                          • {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-200">
              <h3 className="text-lg font-semibold text-nightfall mb-3">Reflection Questions</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Which area (People, Purpose, Principles) was your strongest?</li>
                <li>• Which area had the lowest score? What would help increase it?</li>
                <li>• Who could you talk to for clarity or support?</li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 no-print">
              <Link
                href="/"
                className="text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
              >
                Explore all Tools
              </Link>
              <button
                onClick={() => {
                  setShowResults(false)
                  setCurrentQuestionIndex(0)
                  setAnswers([])
                  setShowIntro(true)
                  setChangeContext('')
                }}
                className="px-8 py-3 bg-[#BF4C74] text-white rounded-lg font-semibold hover:bg-[#A63D5F] transition-colors shadow-lg"
              >
                ASSESS ANOTHER CHANGE
              </button>
            </div>
          </div>
        </div>
      </ViewportContainer>
      <Footer />
      </>
    )
  }

  // Main Assessment Screen
  if (!showIntro && !showChangeContext && !showResults) {
    return (
    <ViewportContainer className="bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
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
                    ? 'w-8 bg-[#BF4C74]'
                    : completedQuestions.has(index) || index < currentQuestionIndex
                    ? 'w-2 bg-[#BF4C74]/50 hover:bg-[#BF4C74]/70 cursor-pointer'
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
            {changeContext && (
              <p className="text-center text-gray-600 mb-4">
                Thinking about: <span className="font-semibold text-[#BF4C74]">
                  {changeContext}
                </span>
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
                      ? 'bg-gradient-to-r from-[#F595B6] to-[#BF4C74] text-white border-[#BF4C74] shadow-lg'
                      : 'bg-white text-nightfall border-gray-200 hover:border-[#F595B6]/50'
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
                  : 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </ViewportContainer>
  )
  }
  
  // Fallback return
  return null
}