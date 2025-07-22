'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer, Shield } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ToolLayout from '@/components/ToolLayout'
import ToolIntroCard from '@/components/ToolIntroCard'
import { toolConfigs, toolStyles } from '@/lib/toolConfigs'
import { useAnalytics } from '@/hooks/useAnalytics'
import ShareButton from '@/components/ShareButton'
import { useEmailCapture } from '@/hooks/useEmailCapture'

interface Question {
  id: string
  text: string
  section: 'integrity' | 'competence' | 'empathy'
}

interface Answer {
  questionId: string
  value: number
}

const questions: Question[] = [
  // Integrity Questions
  { id: 'i1', text: 'I keep the commitments that I make to this person', section: 'integrity' },
  { id: 'i2', text: 'I am consistent in my feedback and support to them', section: 'integrity' },
  { id: 'i3', text: 'I own up to the mistakes that I make with this person', section: 'integrity' },
  { id: 'i4', text: 'I keep things confidential when this person asks me to', section: 'integrity' },
  { id: 'i5', text: 'I always speak openly and honestly with this person', section: 'integrity' },
  
  // Competence Questions
  { id: 'c1', text: 'I am capable of providing this person the support they need', section: 'competence' },
  { id: 'c2', text: 'I express confidence in their ability to do their job', section: 'competence' },
  { id: 'c3', text: 'I support this person in finding their own solutions', section: 'competence' },
  { id: 'c4', text: 'I address conflict directly & support this person through it', section: 'competence' },
  { id: 'c5', text: 'We can work through any problems that come up', section: 'competence' },
  
  // Empathy Questions
  { id: 'e1', text: 'I genuinely care about this person as a human being', section: 'empathy' },
  { id: 'e2', text: 'I respond with curiosity when they have a hard time', section: 'empathy' },
  { id: 'e3', text: 'I communicate in ways that respect their preferences', section: 'empathy' },
  { id: 'e4', text: 'I listen intently when they speak to me', section: 'empathy' },
  { id: 'e5', text: 'I regularly check in on their workload & stress levels', section: 'empathy' },
]

const likertOptions = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither Agree nor Disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
]

const sectionInfo = {
  integrity: {
    title: 'Integrity',
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-gradient-to-br from-amber-500/20 to-orange-600/20',
    description: 'Consistency, reliability, and honesty'
  },
  competence: {
    title: 'Competence',
    color: 'from-rose-400 to-pink-500',
    bgColor: 'bg-gradient-to-br from-rose-400/20 to-pink-500/20',
    description: 'Capability and growth support'
  },
  empathy: {
    title: 'Empathy',
    color: 'from-red-500 to-rose-600',
    bgColor: 'bg-gradient-to-br from-red-500/20 to-rose-600/20',
    description: 'Care and understanding'
  }
}

export default function TrustAuditPage() {
  const analytics = useAnalytics()
  const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [relationshipName, setRelationshipName] = useState('')
  const [showIntro, setShowIntro] = useState(true)
  const [showRelationshipInput, setShowRelationshipInput] = useState(false)
  const [startTime] = useState(Date.now())
  const [userEmail, setUserEmail] = useState('')
  const [isEmailValid, setIsEmailValid] = useState(false)

  // Track tool start
  useEffect(() => {
    analytics.trackToolStart('Trust Audit')
  }, [])

  // Pre-populate email if available
  useEffect(() => {
    if (hasStoredEmail && email) {
      setUserEmail(email)
      setIsEmailValid(true)
    }
  }, [email, hasStoredEmail])

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setUserEmail(newEmail)
    setIsEmailValid(validateEmail(newEmail))
  }

  // Track progress
  useEffect(() => {
    if (!showIntro && !showRelationshipInput && !showResults) {
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100
      analytics.trackToolProgress('Trust Audit', `Question ${currentQuestionIndex + 1}`, progress)
    }
  }, [currentQuestionIndex, showIntro, showRelationshipInput, showResults])

  // Helper function to format name as sentence case
  const formatName = (name: string) => {
    if (!name) return ''
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const currentQuestion = questions[currentQuestionIndex]
  const currentSection = currentQuestion?.section
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
      // Track completion
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      const sectionScores = calculateSectionScores()
      analytics.trackToolComplete('Trust Audit', {
        relationshipName: relationshipName,
        completionTime: timeSpent,
        integrity_score: sectionScores.integrity.average,
        competence_score: sectionScores.competence.average,
        empathy_score: sectionScores.empathy.average,
        total_score: sectionScores.total
      })
      setShowResults(true)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentQuestionIndex === 0) {
      // Go back to relationship input
      setShowRelationshipInput(true)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Number keys 1-5 for selecting options
      if (e.key >= '1' && e.key <= '5' && !showIntro && !showRelationshipInput && !showResults) {
        const value = parseInt(e.key)
        handleAnswer(value, true) // Pass true for auto-advance
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && !showIntro && !showRelationshipInput && !showResults && currentQuestionIndex > 0) {
        handlePrevious()
      }
      
      if (e.key === 'ArrowRight' && !showIntro && !showRelationshipInput && !showResults && getCurrentAnswer()) {
        handleNext()
      }
      
      // Enter key for starting the assessment on intro
      if (e.key === 'Enter' && showIntro && isEmailValid) {
        if (isEmailValid && userEmail) {
          captureEmailForTool(userEmail, 'Trust Audit', 'ta');
        }
        setShowIntro(false)
        setShowRelationshipInput(true)
      }
      
      // Enter key for continuing from relationship input
      if (e.key === 'Enter' && showRelationshipInput && relationshipName.trim()) {
        setShowRelationshipInput(false)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showIntro, showRelationshipInput, showResults, currentQuestionIndex, relationshipName, isEmailValid, userEmail, captureEmailForTool])

  const calculateScores = () => {
    const sections = ['integrity', 'competence', 'empathy'] as const
    const scores = sections.map(section => {
      const sectionQuestions = questions.filter(q => q.section === section)
      const sectionAnswers = answers.filter(a => 
        sectionQuestions.some(q => q.id === a.questionId)
      )
      const total = sectionAnswers.reduce((sum, a) => sum + a.value, 0)
      const average = sectionAnswers.length > 0 ? total / sectionAnswers.length : 0
      return { section, score: average, count: sectionAnswers.length }
    })
    
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0)
    return { sections: scores, total: totalScore }
  }

  const calculateSectionScores = () => {
    const result = calculateScores()
    const sectionMap: any = {}
    result.sections.forEach(s => {
      sectionMap[s.section] = { average: s.score }
    })
    return { ...sectionMap, total: result.total }
  }

  const getRecommendations = (section: string, score: number) => {
    const recommendations = {
      integrity: [
        'Track open requests (even informal ones) and close the loop on them visibly',
        "Don't cancel meetings. If you say you're attending, be there",
        'Be honest, even when it\'s difficult',
        'Take ownership when you don\'t follow through on something, and make sure your team knows what you\'ll do differently next time'
      ],
      competence: [
        'Find a mentor or a senior team member to coach you',
        'If things get tense, take a beat before reacting—and name what\'s happening calmly',
        'Talk through your decision making process and thoughts. Ask for their input',
        'Provide thoughtful support and remove roadblocks that make their job harder'
      ],
      empathy: [
        'Spend time shadowing them in their role. What challenges are they facing?',
        'Learn how they like to be recognized and do it intentionally',
        'Discover what they\'re interested in: hobbies, passions, interests, etc. Ask questions about them',
        'Instead of jumping into tasks, begin 1:1s with a simple check-in'
      ]
    }

    if (score < 2.5) {
      return recommendations[section as keyof typeof recommendations] || []
    } else if (score < 3.8) {
      return recommendations[section as keyof typeof recommendations]?.slice(0, 2) || []
    } else {
      return [recommendations[section as keyof typeof recommendations]?.[0] || 'Keep up the great work!']
    }
  }


  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFA62A] to-[#DB4839] flex flex-col items-center justify-center p-4">
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
            <Shield className="w-20 h-20 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">{toolConfigs.trustAudit.title}</h1>
          <h2 className="text-3xl mb-8">{toolConfigs.trustAudit.subtitle}</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            {toolConfigs.trustAudit.description}
          </p>
        </div>
        
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-lg font-medium text-white/90">
                What's your email?
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={handleEmailChange}
                placeholder="you@company.com"
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                autoComplete="email"
              />
              {hasStoredEmail && (
                <p className="text-white/70 text-sm text-center">
                  Welcome back! We've pre-filled your email.
                </p>
              )}
            </div>
            
            <button
              onClick={async () => {
                if (isEmailValid && userEmail) {
                  await captureEmailForTool(userEmail, 'Trust Audit', 'ta');
                }
                setShowIntro(false);
                setShowRelationshipInput(true);
              }}
              disabled={!isEmailValid}
              className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
                isEmailValid
                  ? 'bg-white text-[#DB4839] hover:bg-white/90'
                  : 'bg-white/50 text-[#DB4839]/50 cursor-not-allowed'
              }`}
            >
              Start Trust Audit
            </button>
            
            <p className="text-white/70 text-sm text-center">
              This will take about 5-7 minutes to complete
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Relationship Input Screen
  if (showRelationshipInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFA62A] via-[#FF7B47] to-[#DB4839] flex flex-col items-center justify-center p-4">
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
        
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
          <h3 className="text-3xl font-bold text-white text-center mb-6">Pick a relationship</h3>
          
          <div className="space-y-6">
            <div className="text-xl text-white/90 text-center">
              <p>This audit focuses on your relationship with one person.</p>
              <p>Who would you like to build trust with?</p>
            </div>
            
            <input
              type="text"
              value={relationshipName}
              onChange={(e) => setRelationshipName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && relationshipName.trim()) {
                  setShowRelationshipInput(false);
                }
              }}
              placeholder="Enter their first name..."
              className="w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
              autoFocus
            />
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowRelationshipInput(false);
                  setShowIntro(true);
                }}
                className="px-6 py-4 text-white/80 hover:text-white font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setShowRelationshipInput(false)}
                disabled={!relationshipName.trim()}
                className={`flex-1 py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
                  relationshipName.trim()
                    ? 'bg-white text-[#DB4839] hover:bg-white/90'
                    : 'bg-white/50 text-[#DB4839]/50 cursor-not-allowed'
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

  if (showResults) {
    const { sections, total } = calculateScores()
    const trustLevel = total >= 12 ? 'Strong' : total >= 7.5 ? 'Moderate' : 'Needs Attention'
    
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
        <div className="min-h-screen bg-gradient-to-br from-[#FFA62A]/10 via-[#FF7B47]/10 to-[#DB4839]/10 py-16 print-section">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 no-print">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setCurrentQuestionIndex(questions.length - 1)
                  }}
                  className="text-[#DB4839] hover:text-[#B93A2F] flex items-center gap-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  BACK
                </button>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      analytics.trackDownload('Print', 'Trust Audit')
                      window.print()
                    }}
                    className="p-3 border-2 border-[#DB4839]/50 text-[#DB4839] rounded-lg hover:border-[#DB4839] hover:bg-[#DB4839]/10 transition-all"
                    title="Print results"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <ShareButton
                    onShare={async () => {
                      const shareData = {
                        type: 'trust-audit',
                        toolName: 'Trust Audit',
                        userName: formatName(relationshipName),
                        results: {
                          sections,
                          total,
                          trustLevel
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
                      const shareUrl = `${window.location.origin}/trust-audit/share/${id}`
                      
                      // Track share event
                      analytics.trackShare('Trust Audit', 'link', {
                        relationshipName: relationshipName,
                        trustLevel: trustLevel,
                        total_score: total
                      })
                      
                      return shareUrl
                    }}
                    className="bg-[#DB4839] hover:bg-[#C73229]"
                  >
                    SHARE
                  </ShareButton>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-nightfall mb-2 text-center">Trust Audit Results</h1>
              <p className="text-gray-600 mb-8 text-center">
                Building trust with {formatName(relationshipName)}
              </p>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/80 shadow-md">
                <h2 className="text-2xl font-semibold text-nightfall mb-4 text-center">
                  Overall Trust Level: {trustLevel}
                </h2>
                <div className="text-3xl font-bold text-[#DB4839] text-center">
                  {total.toFixed(1)} / 15
                </div>
              </div>
            
            <div className="space-y-6 mb-8">
              {sections.map(({ section, score }) => {
                const info = sectionInfo[section as keyof typeof sectionInfo]
                const percentage = (score / 5) * 100
                
                return (
                  <div key={section} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-nightfall">{info.title}</h3>
                      <div className="text-2xl font-bold text-[#DB4839]">
                        {score.toFixed(1)} / 5
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">Recommendations:</h4>
                      {getRecommendations(section, score).map((rec, index) => (
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
                className="px-8 py-3 bg-[#DB4839] text-white rounded-lg font-semibold hover:bg-[#C73229] transition-colors shadow-lg"
              >
                RETAKE AUDIT
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
  if (!showIntro && !showRelationshipInput && !showResults) {
    return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={() => setShowIntro(true)}
              className="inline-flex items-center text-[#DB4839] hover:text-[#B93A2F] transition-colors font-medium"
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
                    ? 'w-8 bg-[#DB4839]'
                    : index < currentQuestionIndex
                    ? 'w-2 bg-[#DB4839]/50 hover:bg-[#DB4839]/70 cursor-pointer'
                    : 'w-2 bg-gray-300 cursor-not-allowed'
                }`}
                aria-label={`Go to question ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {currentSection && (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-nightfall">
                {sectionInfo[currentSection].title}
              </h2>
            </div>
          )}
          
          <div className="mb-8">
            {relationshipName && (
              <p className="text-center text-gray-600 mb-4">
                Thinking about your relationship with <span className="font-semibold text-[#DB4839]">
                  {formatName(relationshipName)}
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
                  autoFocus={index === 0}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                    getCurrentAnswer() === option.value
                      ? 'bg-gradient-to-r from-[#FFA62A] to-[#DB4839] text-white border-[#DB4839] shadow-lg'
                      : 'bg-white text-nightfall border-gray-200 hover:border-[#FFA62A]/50'
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
              className="px-6 py-3 font-medium transition-colors text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={!getCurrentAnswer()}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                !getCurrentAnswer()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#DB4839] text-white hover:bg-[#C73229]'
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
  return null
}