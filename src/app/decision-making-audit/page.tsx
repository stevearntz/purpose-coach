'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer, Brain } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { toolConfigs } from '@/lib/toolConfigs'
import { Question, Answer, questions, dimensionInfo, getDecisionRecommendations } from '@/lib/decisionMakingHelpers'
import ShareButton from '@/components/ShareButton'

const likertOptions = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither Agree nor Disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
]


export default function DecisionMakingAuditPage() {
  const [showIntro, setShowIntro] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [decisionContext, setDecisionContext] = useState('')
  
  const config = toolConfigs.decisionMakingAudit

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
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      setShowResults(true)
    }
  }
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-5 for selecting options
      if (e.key >= '1' && e.key <= '5' && !showIntro && !showResults) {
        const value = parseInt(e.key)
        handleAnswer(value, true) // Pass true for auto-advance
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && !showIntro && !showResults && currentQuestionIndex > 0) {
        handlePrevious()
      }
      
      if (e.key === 'ArrowRight' && !showIntro && !showResults && getCurrentAnswer()) {
        handleNext()
      }
      
      // Enter key for starting the assessment on intro
      if (e.key === 'Enter' && showIntro && decisionContext.trim()) {
        setShowIntro(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showIntro, showResults, currentQuestionIndex, decisionContext])
  
  const calculateScores = () => {
    const dimensions = ['people', 'purpose', 'principles', 'outcomes'] as const
    const scores = dimensions.map(dimension => {
      const dimensionQuestions = questions.filter(q => q.dimension === dimension)
      const dimensionAnswers = answers.filter(a => 
        dimensionQuestions.some(q => q.id === a.questionId)
      )
      const total = dimensionAnswers.reduce((sum, a) => sum + a.value, 0)
      const average = dimensionAnswers.length > 0 ? total / dimensionAnswers.length : 0
      return { dimension, score: average, count: dimensionAnswers.length }
    })
    
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
    return { dimensions: scores, total: totalScore }
  }
  

  // Intro Screen (Full vibrant gradient)
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#6DC7FF] to-[#3C36FF] flex flex-col items-center justify-center p-4">
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
          <div className="inline-flex p-6 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <Brain className="w-20 h-20 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">{config.title}</h1>
          <h2 className="text-3xl mb-8">{config.subtitle}</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            {config.description}
          </p>
        </div>
        
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
          <h3 className="text-3xl font-bold text-white text-center mb-6">What decision are you facing?</h3>
          
          <div className="space-y-6">
            <p className="text-xl text-white/90 text-center">
              Briefly describe the decision you need to make.
            </p>
            
            <textarea
              value={decisionContext}
              onChange={(e) => setDecisionContext(e.target.value)}
              placeholder="e.g., Should we expand into a new market? Which vendor should we choose?"
              className="w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg min-h-[100px] resize-y"
              required
            />
            
            <button
              onClick={() => setShowIntro(false)}
              disabled={!decisionContext.trim()}
              className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
                decisionContext.trim()
                  ? 'bg-white text-[#3C36FF] hover:bg-white/90'
                  : 'bg-white/50 text-[#3C36FF]/50 cursor-not-allowed'
              }`}
            >
              Start Decision Making Audit
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    const { dimensions, total } = calculateScores()
    const readinessLevel = total >= 16 ? 'Well Prepared' : total >= 10 ? 'Moderately Prepared' : 'Needs More Work'
    
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
        <div className="min-h-screen bg-gradient-to-br from-[#6DC7FF]/10 via-[#5581FF]/10 to-[#3C36FF]/10 py-16 print-section">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 no-print">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setCurrentQuestionIndex(questions.length - 1)
                  }}
                  className="text-[#3C36FF] hover:text-[#302CC6] flex items-center gap-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={() => window.print()}
                    className="p-3 border-2 border-[#3C36FF]/50 text-[#3C36FF] rounded-lg hover:border-[#3C36FF] hover:bg-[#3C36FF]/10 transition-all"
                    title="Print results"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <ShareButton
                    onShare={async () => {
                      const { dimensions, total } = calculateScores()
                      const readinessLevel = total >= 16 ? 'Well Prepared' : total >= 10 ? 'Moderately Prepared' : 'Needs More Work'
                      
                      const shareData = {
                        type: 'decision-making-audit',
                        toolName: 'Decision Making Audit',
                        results: {
                          decisionContext,
                          dimensions,
                          total,
                          readinessLevel,
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
                    className="bg-[#3C36FF] hover:bg-[#302CC6]"
                  >
                    SHARE
                  </ShareButton>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-nightfall mb-2 text-center">Decision Audit Results</h1>
              <p className="text-gray-600 mb-8 text-center">
                Decision: <span className="font-medium">{decisionContext}</span>
              </p>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
                <h2 className="text-2xl font-semibold text-nightfall mb-4 text-center">
                  Decision Readiness: {readinessLevel}
                </h2>
                <div className="text-3xl font-bold text-[#3C36FF] text-center">
                  {total.toFixed(1)} / 20
                </div>
              </div>
            
            <div className="space-y-6 mb-8">
              {dimensions.map(({ dimension, score }) => {
                const info = dimensionInfo[dimension as keyof typeof dimensionInfo]
                const percentage = (score / 5) * 100
                
                return (
                  <div key={dimension} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-nightfall">{info.title}</h3>
                      <div className="text-2xl font-bold text-[#3C36FF]">
                        {score.toFixed(1)} / 5
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-[#6DC7FF] to-[#3C36FF] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Recommendations:</h4>
                      {getDecisionRecommendations(dimension, score).map((rec, index) => (
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
                  setDecisionContext('')
                }}
                className="px-8 py-3 bg-[#3C36FF] text-white rounded-lg font-semibold hover:bg-[#302CC6] transition-colors shadow-lg"
              >
                AUDIT ANOTHER DECISION
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
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center text-[#3C36FF] hover:text-[#302CC6] transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <span className="text-gray-600 text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          
          <div className="flex items-center gap-2 justify-center">
            {Array.from({ length: questions.length }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index < currentQuestionIndex) {
                    setCurrentQuestionIndex(index)
                  }
                }}
                disabled={index > currentQuestionIndex}
                className={`h-2 rounded-full transition-all ${
                  index === currentQuestionIndex
                    ? 'w-8 bg-[#3C36FF]'
                    : index < currentQuestionIndex
                    ? 'w-2 bg-[#3C36FF]/50 hover:bg-[#3C36FF]/70 cursor-pointer'
                    : 'w-2 bg-gray-300 cursor-not-allowed'
                }`}
                aria-label={`Go to question ${index + 1}`}
              />
            ))}
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
            {decisionContext && (
              <p className="text-center text-gray-600 mb-4">
                Thinking about: <span className="font-semibold text-[#3C36FF]">
                  {decisionContext}
                </span>
              </p>
            )}
            <h3 className="text-xl font-medium text-nightfall mb-6 text-center">
              {currentQuestion.text}
            </h3>
            
            <div className="space-y-3">
              {likertOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value, false)} // No auto-advance on click
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                    getCurrentAnswer() === option.value
                      ? 'bg-gradient-to-r from-[#6DC7FF] to-[#3C36FF] text-white border-[#3C36FF] shadow-lg'
                      : 'bg-white text-nightfall border-gray-200 hover:border-[#6DC7FF]/50'
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
          
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 font-medium transition-colors ${
                currentQuestionIndex === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-600 hover:text-gray-800'
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
                  : 'bg-[#3C36FF] text-white hover:bg-[#302CC6]'
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