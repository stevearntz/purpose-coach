'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { toolConfigs } from '@/lib/toolConfigs'

interface Question {
  id: string
  text: string
  dimension: 'people' | 'purpose' | 'principles'
}

interface Answer {
  questionId: string
  value: number
}

const questions: Question[] = [
  // People
  { id: 'pe1', text: 'I understand how this change will impact the people I work with', dimension: 'people' },
  { id: 'pe2', text: 'I trust the leaders who are guiding us through this change', dimension: 'people' },
  { id: 'pe3', text: 'I believe my team can adapt to what\'s coming', dimension: 'people' },
  { id: 'pe4', text: 'I feel supported by others as I navigate this change', dimension: 'people' },
  { id: 'pe5', text: 'I\'m confident this change will strengthen relationships on my team', dimension: 'people' },
  
  // Purpose
  { id: 'pu1', text: 'I understand why this change is happening', dimension: 'purpose' },
  { id: 'pu2', text: 'I believe this change supports our broader goals and mission', dimension: 'purpose' },
  { id: 'pu3', text: 'I can clearly see how this change connects to what my role is meant to accomplish', dimension: 'purpose' },
  { id: 'pu4', text: 'I believe this change will move us in the right direction as an organization', dimension: 'purpose' },
  { id: 'pu5', text: 'I feel more motivated when I see how this change supports our purpose', dimension: 'purpose' },
  
  // Principles
  { id: 'pr1', text: 'I know what principles will guide my decisions during this change', dimension: 'principles' },
  { id: 'pr2', text: 'I feel empowered to make decisions that reflect my values', dimension: 'principles' },
  { id: 'pr3', text: 'I trust myself to respond thoughtfully and flexibly as things shift', dimension: 'principles' },
  { id: 'pr4', text: 'I believe this change is aligned with the core values of our team or company', dimension: 'principles' },
  { id: 'pr5', text: 'I am confident I can stay grounded in what matters most, even as things change', dimension: 'principles' },
]

const likertOptions = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither Agree nor Disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
]

const dimensionInfo = {
  people: {
    title: 'People',
    description: 'Trust in relationships, team dynamics, leadership support, and impact on others'
  },
  purpose: {
    title: 'Purpose',
    description: 'Clarity of vision, connection to role, alignment with company direction'
  },
  principles: {
    title: 'Principles',
    description: 'Values alignment, confidence in navigating decisions, adaptability'
  }
}

export default function ChangeReadinessPage() {
  const [showIntro, setShowIntro] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [changeContext, setChangeContext] = useState('')
  
  const config = toolConfigs.changeReadiness
  
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
      if (e.key === 'Enter' && showIntro && changeContext.trim()) {
        setShowIntro(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showIntro, showResults, currentQuestionIndex, changeContext])
  
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
  
  const getReadinessLevel = (score: number) => {
    if (score >= 21) return { level: 'High', description: 'You feel confident and supported', color: 'text-green-600' }
    if (score >= 16) return { level: 'Moderate', description: 'You\'re mostly on board, but have questions', color: 'text-yellow-600' }
    if (score >= 11) return { level: 'Low', description: 'You may feel unsure or disconnected', color: 'text-orange-600' }
    return { level: 'Very Low', description: 'You may feel anxious or unprepared', color: 'text-red-600' }
  }
  
  const getRecommendations = (dimension: string, score: number) => {
    const recommendations = {
      people: {
        high: ['Continue building on strong relationships', 'Share your confidence with others who may be struggling'],
        moderate: ['Schedule 1:1s with key stakeholders', 'Join or create a change support group'],
        low: ['Identify trusted colleagues to talk with', 'Request clearer communication from leadership', 'Map out who will be affected and how']
      },
      purpose: {
        high: ['Help others connect to the vision', 'Document how the change aligns with your goals'],
        moderate: ['Ask clarifying questions about the "why"', 'Connect change goals to your role explicitly'],
        low: ['Request a town hall or Q&A session', 'Write down what\'s unclear and seek answers', 'Find the story behind the change']
      },
      principles: {
        high: ['Model values-based decision making', 'Mentor others in staying grounded'],
        moderate: ['Create a personal values checklist', 'Practice scenario planning with your principles'],
        low: ['Define your core values explicitly', 'Seek guidance on decision frameworks', 'Build daily grounding practices']
      }
    }
    
    const level = score >= 21 ? 'high' : score >= 16 ? 'moderate' : 'low'
    return recommendations[dimension as keyof typeof recommendations]?.[level] || []
  }

  // Intro Screen (Full vibrant gradient)
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FCA376] to-[#BF4C74] flex flex-col items-center justify-center p-4">
        <Link 
          href="/?screen=4" 
          className="absolute top-8 left-8 inline-flex items-center text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Plan
        </Link>
        
        <div className="text-center text-white mb-12 max-w-3xl">
          <h1 className="text-5xl font-bold mb-6">{config.title}</h1>
          <h2 className="text-3xl mb-8">{config.subtitle}</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            {config.description}
          </p>
        </div>
        
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
          <h3 className="text-3xl font-bold text-white text-center mb-6">What change are you facing?</h3>
          
          <div className="space-y-6">
            <p className="text-xl text-white/90 text-center">
              Briefly describe the change you're navigating.
            </p>
            
            <textarea
              value={changeContext}
              onChange={(e) => setChangeContext(e.target.value)}
              placeholder="e.g., Team restructuring, new technology implementation, role transition..."
              className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-base min-h-[100px] resize-y"
              required
            />
            
            <button
              onClick={() => setShowIntro(false)}
              disabled={!changeContext.trim()}
              className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
                changeContext.trim()
                  ? 'bg-white text-[#BF4C74] hover:bg-white/90'
                  : 'bg-white/50 text-[#BF4C74]/50 cursor-not-allowed'
              }`}
            >
              Start Change Readiness Assessment
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Results Screen
  if (showResults) {
    const { dimensions, total } = calculateScores()
    const overallReadiness = getReadinessLevel(total)
    
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
        <div className="min-h-screen bg-gradient-to-br from-[#FCA376]/10 via-[#E37A75]/10 to-[#BF4C74]/10 py-16 print-section">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 no-print">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setCurrentQuestionIndex(questions.length - 1)
                  }}
                  className="text-[#BF4C74] hover:text-[#A63D5F] flex items-center gap-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={() => window.print()}
                    className="p-3 border-2 border-[#BF4C74]/50 text-[#BF4C74] rounded-lg hover:border-[#BF4C74] hover:bg-[#BF4C74]/10 transition-all"
                    title="Print results"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/change-readiness/share/${Date.now()}`
                      navigator.clipboard.writeText(shareUrl)
                      alert('Share link copied to clipboard!')
                    }}
                    className="px-6 py-3 bg-[#BF4C74] text-white rounded-lg hover:bg-[#A63D5F] transition-colors shadow-lg font-medium"
                  >
                    SHARE
                  </button>
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
                const readiness = getReadinessLevel(score)
                
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
                        className="h-3 rounded-full bg-gradient-to-r from-[#FCA376] to-[#BF4C74] transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Next steps:</h4>
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
            
            <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-200">
              <h3 className="text-lg font-semibold text-nightfall mb-3">Reflection Questions</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Which area (People, Purpose, Principles) was your strongest?</li>
                <li>• Which area had the lowest score? What would help increase it?</li>
                <li>• Who could you talk to for clarity or support?</li>
              </ul>
            </div>
            
            <div className="flex justify-center mt-8 no-print">
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
      </div>
      <Footer />
      </>
    )
  }

  // Main Assessment Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FCA376]/10 via-[#E37A75]/10 to-[#BF4C74]/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            <span className="text-gray-600 text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#FCA376] to-[#BF4C74] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/80 shadow-lg">
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
              {likertOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value, false)} // No auto-advance on click
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                    getCurrentAnswer() === option.value
                      ? 'bg-gradient-to-r from-[#FCA376] to-[#BF4C74] text-white border-[#BF4C74] shadow-lg'
                      : 'bg-white text-nightfall border-gray-200 hover:border-[#FCA376]/50'
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
          
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
                currentQuestionIndex === 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'border-[#BF4C74] text-[#BF4C74] hover:bg-[#BF4C74]/10'
              }`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span>PREVIOUS</span>
            </button>
            
            <button
              onClick={handleNext}
              disabled={!getCurrentAnswer()}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                !getCurrentAnswer()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#BF4C74] text-white hover:bg-[#A63D5F] shadow-lg'
              }`}
            >
              <span>{currentQuestionIndex === questions.length - 1 ? 'SEE RESULTS' : 'NEXT'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-600">
          <span className="inline-block bg-white/60 backdrop-blur-sm px-4 py-2 rounded-lg">
            Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">1</kbd> - <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">5</kbd> to select • 
            <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">←</kbd> <kbd className="px-2 py-1 bg-gray-200 rounded text-xs font-mono">→</kbd> to navigate
          </span>
        </div>
      </div>
    </div>
  )
}