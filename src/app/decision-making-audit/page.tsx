'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { toolConfigs } from '@/lib/toolConfigs'

interface Question {
  id: string
  text: string
  dimension: 'people' | 'purpose' | 'principles' | 'outcomes'
}

interface Answer {
  questionId: string
  value: number
}

const questions: Question[] = [
  // People
  { id: 'p1', text: 'I have identified all stakeholders who will be affected', dimension: 'people' },
  { id: 'p2', text: 'I understand each stakeholder\'s perspective', dimension: 'people' },
  { id: 'p3', text: 'I have considered how to communicate the decision', dimension: 'people' },
  { id: 'p4', text: 'I know who needs to be involved in making this decision', dimension: 'people' },
  { id: 'p5', text: 'I have thought about the human impact of each option', dimension: 'people' },
  
  // Purpose
  { id: 'pu1', text: 'The decision aligns with our mission and values', dimension: 'purpose' },
  { id: 'pu2', text: 'I am clear on what problem we\'re trying to solve', dimension: 'purpose' },
  { id: 'pu3', text: 'This decision moves us toward our long-term goals', dimension: 'purpose' },
  { id: 'pu4', text: 'I understand why this decision matters now', dimension: 'purpose' },
  { id: 'pu5', text: 'The "why" behind this decision is compelling', dimension: 'purpose' },
  
  // Principles
  { id: 'pr1', text: 'I have clear criteria for evaluating options', dimension: 'principles' },
  { id: 'pr2', text: 'I\'m using a consistent decision-making framework', dimension: 'principles' },
  { id: 'pr3', text: 'I have gathered sufficient data and evidence', dimension: 'principles' },
  { id: 'pr4', text: 'I\'ve considered multiple alternatives', dimension: 'principles' },
  { id: 'pr5', text: 'My biases and assumptions have been examined', dimension: 'principles' },
  
  // Outcomes
  { id: 'o1', text: 'I have defined what success looks like', dimension: 'outcomes' },
  { id: 'o2', text: 'The risks and trade-offs are clear to me', dimension: 'outcomes' },
  { id: 'o3', text: 'I know how we\'ll measure the results', dimension: 'outcomes' },
  { id: 'o4', text: 'I\'ve considered both short and long-term impacts', dimension: 'outcomes' },
  { id: 'o5', text: 'There\'s a plan to monitor and adjust if needed', dimension: 'outcomes' },
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
    description: 'Stakeholder consideration and communication'
  },
  purpose: {
    title: 'Purpose',
    description: 'Alignment with mission and goals'
  },
  principles: {
    title: 'Principles',
    description: 'Framework and process quality'
  },
  outcomes: {
    title: 'Outcomes',
    description: 'Results and measurement planning'
  }
}

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
  
  const getRecommendations = (dimension: string, score: number) => {
    const recommendations = {
      people: [
        'Create a stakeholder map to visualize all affected parties',
        'Schedule 1:1 conversations with key stakeholders',
        'Develop a clear communication plan',
        'Consider forming a decision-making committee'
      ],
      purpose: [
        'Revisit your organization\'s mission statement',
        'Write a clear problem statement',
        'Connect this decision to strategic objectives',
        'Articulate the "why" in one compelling sentence'
      ],
      principles: [
        'Choose a decision-making framework (e.g., RAPID, DACI)',
        'List your evaluation criteria explicitly',
        'Gather more data in areas of uncertainty',
        'Facilitate a structured brainstorming session'
      ],
      outcomes: [
        'Define specific, measurable success metrics',
        'Conduct a risk assessment workshop',
        'Create a decision scorecard',
        'Build a monitoring dashboard'
      ]
    }
    
    if (score < 2.5) {
      return recommendations[dimension as keyof typeof recommendations] || []
    } else if (score < 3.8) {
      return recommendations[dimension as keyof typeof recommendations]?.slice(0, 2) || []
    } else {
      return [recommendations[dimension as keyof typeof recommendations]?.[0] || 'Keep refining your approach!']
    }
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
        
        <div className="text-center text-white mb-12 max-w-3xl">
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
              className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-base min-h-[100px] resize-y"
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
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}/decision-making-audit/share/${Date.now()}`
                      navigator.clipboard.writeText(shareUrl)
                      alert('Share link copied to clipboard!')
                    }}
                    className="px-6 py-3 bg-[#3C36FF] text-white rounded-lg hover:bg-[#302CC6] transition-colors shadow-lg font-medium"
                  >
                    SHARE
                  </button>
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
    <div className="min-h-screen bg-gradient-to-br from-[#6DC7FF]/10 via-[#5581FF]/10 to-[#3C36FF]/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
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
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#6DC7FF] to-[#3C36FF] transition-all duration-300"
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
          
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${
                currentQuestionIndex === 0
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50'
                  : 'border-[#3C36FF] text-[#3C36FF] hover:bg-[#3C36FF]/10'
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
                  : 'bg-[#3C36FF] text-white hover:bg-[#302CC6] shadow-lg'
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