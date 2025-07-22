'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer, Share2, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import ViewportContainer from '@/components/ViewportContainer'
import ShareButton from '@/components/ShareButton'
import ToolNavigation from '@/components/ToolNavigation'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useEmailCapture } from '@/hooks/useEmailCapture'
import { validateEmail, validateEmailRealtime, EmailValidationResult } from '@/utils/emailValidation'

interface Question {
  id: number
  text: string
}

interface Answer {
  questionId: number
  value: number
}

interface PersonaScore {
  name: string
  code: string
  score: number
}

interface PersonaReadout {
  label: string
  title: string
  description: string
  watch_out_for: string
  superpower: string
  try_this: string
}

const questions: Question[] = [
  { id: 1, text: "I like to take charge and help others stay focused during change." },
  { id: 2, text: "I often find myself emotionally reacting to change before I understand it." },
  { id: 3, text: "I usually try to make others feel safe and heard during transitions." },
  { id: 4, text: "I don't trust that I'm hearing the full story when big changes are announced." },
  { id: 5, text: "I ask for data and logic before fully committing to a new direction." },
  { id: 6, text: "I get anxious when plans change or things feel uncertain." },
  { id: 7, text: "I tend to go quiet and pull back when change is happening." },
  { id: 8, text: "I'm skeptical of change that comes from leadership without explanation." },
  { id: 9, text: "I like to get my team excited about what's possible when things shift." },
  { id: 10, text: "I need to know exactly what's changing and how it affects my role." },
  { id: 11, text: "I'm usually the one to complain when something new is rolled out." },
  { id: 12, text: "I prefer to wait and see before reacting to change." },
  { id: 13, text: "I adjust quickly and don't get too worked up about changes." },
  { id: 14, text: "I feel responsible for helping others emotionally process change." },
  { id: 15, text: "I see change as an opportunity to grow or take on more responsibility." },
  { id: 16, text: "I feel most comfortable when expectations and routines are consistent." },
  { id: 17, text: "I tend to focus more on how the change impacts my immediate team than the whole organization." },
  { id: 18, text: "I don't show much emotion about change, but I quietly go along with it." },
  { id: 19, text: "I try to protect others from the chaos or confusion that change brings." },
  { id: 20, text: "When something changes, I often assume the worst." },
  { id: 21, text: "I often say what others are thinking but won't say out loud." },
  { id: 22, text: "I can stay calm in the face of change and help others do the same." },
  { id: 23, text: "I often encourage others to take action even when things are uncertain." },
  { id: 24, text: "I think most change is temporary—nothing to get too stressed about." },
  { id: 25, text: "I'm quick to critique new changes if I think they're unrealistic." },
  { id: 26, text: "I often offer emotional support to others who are feeling unsettled." },
  { id: 27, text: "I quietly do things my own way when I disagree with a change." },
  { id: 28, text: "I ask a lot of clarifying questions when something new is introduced." },
  { id: 29, text: "I don't mind change as long as I understand the logic behind it." },
  { id: 30, text: "I often help others translate change into small, manageable actions." }
]

const likertOptions = [
  { value: 1, label: 'Not at all true' },
  { value: 2, label: 'Slightly true' },
  { value: 3, label: 'Somewhat true' },
  { value: 4, label: 'Mostly true' },
  { value: 5, label: 'Very true' },
]

const personas = [
  { name: "The Champion", code: "champion", questions: [1, 15, 23] },
  { name: "The Reactor", code: "reactor", questions: [2, 6, 20] },
  { name: "The Therapist", code: "therapist", questions: [3, 14, 26] },
  { name: "The Skeptic", code: "skeptic", questions: [4, 8, 25] },
  { name: "The Analyzer", code: "analyzer", questions: [5, 28, 29] },
  { name: "The Ghost", code: "ghost", questions: [7, 18, 27] },
  { name: "The Energizer", code: "energizer", questions: [9, 22, 30] },
  { name: "The Stabilizer", code: "stabilizer", questions: [10, 16, 13] },
  { name: "The Whiner", code: "whiner", questions: [11, 21, 19] },
  { name: "The Adapter", code: "adapter", questions: [12, 24, 18] },
  { name: "The Protector", code: "protector", questions: [17, 19, 22] },
  { name: "The Navigator", code: "navigator", questions: [26, 28, 30] }
]

const personaReadouts: Record<string, PersonaReadout> = {
  champion: {
    label: "🏆 The Champion",
    title: "Leads the charge with energy and vision",
    description: "You see change as opportunity. You're quick to step up, motivate others, and build momentum. You're often the first to say, 'Let's do this.'",
    watch_out_for: "Overextending yourself or steamrolling others' concerns",
    superpower: "Inspiring others to believe in a better future",
    try_this: "Pause to check how others are feeling before moving forward"
  },
  reactor: {
    label: "🐥 The Reactor",
    title: "Feels it first, processes later",
    description: "You respond emotionally and instinctively to change. You may voice fears early—and often say what others are feeling but won't say aloud.",
    watch_out_for: "Getting stuck in fear or unintentionally spreading panic",
    superpower: "Surfacing early warning signals others miss",
    try_this: "Name your emotions, then ask what's truly within your control"
  },
  therapist: {
    label: "🛋 The Therapist",
    title: "Tends to the emotional impact of change",
    description: "You create space for others to share how they're doing. You help people feel seen, heard, and supported during uncertainty.",
    watch_out_for: "Taking on too much of others' emotions as your own",
    superpower: "Deep empathy and emotional intelligence",
    try_this: "Support others—while also setting boundaries for yourself"
  },
  skeptic: {
    label: "🕵️ The Skeptic",
    title: "Questions the motives behind change",
    description: "You challenge assumptions and ask hard questions. You want to make sure change is real, relevant, and not just corporate spin.",
    watch_out_for: "Becoming dismissive before hearing the full picture",
    superpower: "Seeing what others might overlook",
    try_this: "Pair your questions with curiosity, not cynicism"
  },
  analyzer: {
    label: "🧮 The Analyzer",
    title: "Needs clarity, logic, and rationale",
    description: "You want the facts. Before getting on board, you look for evidence, risk analysis, and a sound plan. You're the team's sense-checker.",
    watch_out_for: "Overanalyzing and slowing progress",
    superpower: "Bringing structure and clear thinking to messy change",
    try_this: "Act even when things aren't 100% certain"
  },
  ghost: {
    label: "🔌 The Ghost",
    title: "Disengages during disruption",
    description: "You tend to retreat when things get uncertain. You prefer to fly under the radar until the dust settles.",
    watch_out_for: "Missing your chance to influence outcomes",
    superpower: "Observing calmly before jumping in",
    try_this: "Speak up about what you need to stay engaged"
  },
  energizer: {
    label: "💃 The Energizer",
    title: "Lifts the team's spirits through change",
    description: "You bring contagious enthusiasm and optimism. When others feel unsure, you're the voice saying, 'We've got this!'",
    watch_out_for: "Glossing over real concerns in favor of positivity",
    superpower: "Motivating teams with energy and belief",
    try_this: "Pair your hype with listening to real fears"
  },
  stabilizer: {
    label: "🧊 The Stabilizer",
    title: "Grounds others with consistency and calm",
    description: "You value clear plans, steady expectations, and defined roles. In times of change, you bring needed stability and structure.",
    watch_out_for: "Resisting change simply because it's new",
    superpower: "Helping teams feel anchored and focused",
    try_this: "Flex your comfort zone—practice adapting in small steps"
  },
  whiner: {
    label: "😩 The Whiner",
    title: "Voices discomfort... loudly",
    description: "You have no trouble expressing what's not working. You often represent the unspoken frustrations of the team.",
    watch_out_for: "Turning critique into constant complaining",
    superpower: "Identifying friction points others ignore",
    try_this: "Match every complaint with a constructive idea"
  },
  adapter: {
    label: "😐 The Adapter",
    title: "Goes with the flow, no drama",
    description: "You don't love change or hate it—you just move forward. You're flexible and steady, and others often follow your lead.",
    watch_out_for: "Becoming too passive or disengaged",
    superpower: "Keeping things moving without emotional whiplash",
    try_this: "Name how the change actually impacts you—it helps others too"
  },
  protector: {
    label: "🧱 The Protector",
    title: "Defends their people from disruption",
    description: "You think first about your team's safety and stability. You try to filter noise and prevent chaos from hitting your circle.",
    watch_out_for: "Becoming too territorial or resistant to collaboration",
    superpower: "Providing security and loyalty during uncertain times",
    try_this: "Bring your team into the change conversation early"
  },
  navigator: {
    label: "🧭 The Navigator",
    title: "Helps others make meaning out of change",
    description: "You're a thoughtful, intuitive guide who sees both the emotional and strategic sides of change. You help others reframe uncertainty.",
    watch_out_for: "Getting stuck in reflection instead of action",
    superpower: "Bringing clarity and wisdom in the fog",
    try_this: "Once you understand it—help others navigate it too"
  }
}

export default function ChangeStylePage() {
  const analytics = useAnalytics()
  const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
  const [showIntro, setShowIntro] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showResults, setShowResults] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ isValid: true })
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [startTime] = useState(Date.now())
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set())
  
  // Track tool start
  useEffect(() => {
    analytics.trackToolStart('Change Style Assessment')
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
      await captureEmailForTool(userEmail, 'Change Style Assessment', 'change-style')
    }
    setShowIntro(false)
  }

  const handleAnswer = (value: number, autoAdvance: boolean = false) => {
    const currentQuestion = questions[currentQuestionIndex]
    const existingAnswerIndex = answers.findIndex(a => a.questionId === currentQuestion.id)
    
    const newAnswers = [...answers]
    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex] = { questionId: currentQuestion.id, value }
    } else {
      newAnswers.push({ questionId: currentQuestion.id, value })
    }
    
    setAnswers(newAnswers)
    setCompletedQuestions(prev => new Set([...prev, currentQuestionIndex]))
    
    // Auto-advance only on keyboard selection
    if (autoAdvance) {
      setTimeout(() => {
        handleNext()
      }, 200)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      const progress = ((currentQuestionIndex + 1) / questions.length) * 100
      analytics.trackToolProgress('Change Style Assessment', `Question ${currentQuestionIndex + 1}`, progress)
    } else {
      calculateResults()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const getCurrentAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex]
    const answer = answers.find(a => a.questionId === currentQuestion.id)
    return answer?.value || null
  }

  const calculateResults = () => {
    // Calculate scores for each persona
    const personaScores: PersonaScore[] = personas.map(persona => {
      const score = persona.questions.reduce((sum, questionId) => {
        const answer = answers.find(a => a.questionId === questionId)
        return sum + (answer?.value || 0)
      }, 0)
      
      return {
        name: persona.name,
        code: persona.code,
        score
      }
    })

    // Sort by score
    personaScores.sort((a, b) => b.score - a.score)

    // Find primary and secondary personas
    const primaryPersona = personaScores[0]
    const secondaryPersonas = personaScores.filter(
      p => p.code !== primaryPersona.code && p.score >= primaryPersona.score - 2
    )

    // Store results in state or analytics
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    analytics.trackToolComplete('Change Style Assessment', {
      primary_persona: primaryPersona.code,
      secondary_personas: secondaryPersonas.map(p => p.code),
      completion_time: timeSpent
    })

    setShowResults(true)
  }

  const getPersonaScores = (): { primary: PersonaScore; secondary: PersonaScore[]; all: PersonaScore[] } => {
    const personaScores: PersonaScore[] = personas.map(persona => {
      const score = persona.questions.reduce((sum, questionId) => {
        const answer = answers.find(a => a.questionId === questionId)
        return sum + (answer?.value || 0)
      }, 0)
      
      return {
        name: persona.name,
        code: persona.code,
        score
      }
    })

    personaScores.sort((a, b) => b.score - a.score)
    
    const primary = personaScores[0]
    const secondary = personaScores.filter(
      p => p.code !== primary.code && p.score >= primary.score - 2
    )

    return { primary, secondary, all: personaScores }
  }

  const handleShare = async () => {
    const { primary, secondary } = getPersonaScores()
    const shareData = {
      primaryPersona: primary.code,
      secondaryPersonas: secondary.map(p => p.code),
      timestamp: Date.now()
    }
    
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'change-style',
          data: shareData,
          toolId: 'change-style'
        })
      })
      
      const { id } = await response.json()
      const shareUrl = `${window.location.origin}/change-style/share/${id}`
      
      analytics.trackShare('Change Style Assessment')
      
      return shareUrl
    } catch (error) {
      console.error('Error sharing:', error)
      return ''
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Enter key for starting the assessment on intro
      if (e.key === 'Enter' && showIntro && emailValidation.isValid && userEmail) {
        handleStartAssessment()
        return
      }
      
      if (showIntro || showResults) return
      
      const key = parseInt(e.key)
      if (key >= 1 && key <= 5) {
        handleAnswer(key, true) // Pass true for auto-advance
      } else if (e.key === 'Enter' && getCurrentAnswer()) {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrevious()
      } else if (e.key === 'ArrowRight' && getCurrentAnswer()) {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showIntro, showResults, currentQuestionIndex, getCurrentAnswer, handleAnswer, handleNext, handlePrevious, emailValidation.isValid, userEmail])

  if (showIntro) {
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
            Change Style Assessment
          </h1>
          <p className="text-xl sm:text-2xl mb-8 text-white/90">
            Discover how you naturally respond to change at work
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
            <ul className="text-left space-y-3 mb-8 max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">•</span>
                <span>Your primary change persona and what it means</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">•</span>
                <span>Your unique strengths during transitions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">•</span>
                <span>Potential blind spots to watch out for</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-white/80 mt-1">•</span>
                <span>Practical tips for navigating change more effectively</span>
              </li>
            </ul>
            
            <p className="text-sm mb-6 text-white/80">
              30 questions • About 10 minutes
            </p>
            
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
                Begin Assessment
              </button>
            </div>
          </div>
          
          <p className="mt-6 text-sm text-white/70">
            We'll email your results for future reference
          </p>
        </div>
      </ViewportContainer>
    )
  }

  if (showResults) {
    const { primary, secondary, all } = getPersonaScores()
    const primaryReadout = personaReadouts[primary.code]
    
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
              background: white;
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
          <div className="max-w-3xl mx-auto px-4">
            <div className="mb-8 no-print">
              <button
                onClick={() => window.location.reload()}
                className="text-[#BF4C74] hover:text-[#A63D5F] flex items-center gap-2 font-medium text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="uppercase tracking-wider">Start Over</span>
              </button>
            </div>

            <div className="mb-8 no-print flex justify-between items-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Your Change Style Results
              </h1>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="hidden sm:block p-2.5 sm:p-3 border-2 border-[#BF4C74]/50 text-[#BF4C74] rounded-lg hover:border-[#BF4C74] hover:bg-[#BF4C74]/10 transition-all"
                  title="Print results"
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

            {/* Primary Persona */}
            <div className="bg-gradient-to-br from-[#F595B6] to-[#BF4C74] rounded-2xl p-8 text-white mb-8">
              <div className="text-center mb-6">
                <p className="text-5xl mb-4">{primaryReadout.label.split(' ')[0]}</p>
                <h2 className="text-3xl font-bold mb-2">{primaryReadout.label}</h2>
                <p className="text-xl text-white/90">{primaryReadout.title}</p>
              </div>
              
              <div className="space-y-6 max-w-2xl mx-auto">
                <div>
                  <p className="text-lg leading-relaxed">{primaryReadout.description}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="font-semibold mb-2 text-white/90">Your Superpower</h3>
                    <p className="text-white/90">{primaryReadout.superpower}</p>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h3 className="font-semibold mb-2 text-white/90">Watch Out For</h3>
                    <p className="text-white/90">{primaryReadout.watch_out_for}</p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="font-semibold mb-2 text-white/90">Try This</h3>
                  <p className="text-lg">{primaryReadout.try_this}</p>
                </div>
              </div>
            </div>

            {/* Secondary Personas */}
            {secondary.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Your Secondary Style{secondary.length > 1 ? 's' : ''}
                </h3>
                <p className="text-gray-600 mb-6">
                  These styles also show up strongly in how you navigate change:
                </p>
                <div className="space-y-4">
                  {secondary.map(persona => {
                    const readout = personaReadouts[persona.code]
                    return (
                      <div key={persona.code} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                          <span className="text-3xl">{readout.label.split(' ')[0]}</span>
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                              {readout.label}
                            </h4>
                            <p className="text-gray-600 mb-3">{readout.title}</p>
                            <p className="text-gray-700 text-sm">{readout.description}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* All Scores */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Complete Profile</h3>
              <div className="space-y-3">
                {all.map(persona => {
                  const percentage = (persona.score / 15) * 100
                  const isPrimary = persona.code === primary.code
                  const isSecondary = secondary.some(s => s.code === persona.code)
                  
                  return (
                    <div key={persona.code} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-gray-700">
                        {persona.name}
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-4">
                          <div
                            className={`h-4 rounded-full transition-all duration-500 ${
                              isPrimary 
                                ? 'bg-gradient-to-r from-[#F595B6] to-[#BF4C74]' 
                                : isSecondary
                                ? 'bg-[#E37A75]'
                                : 'bg-gray-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-12 text-right text-sm font-medium text-gray-700">
                        {persona.score}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Steps */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Put This Into Practice</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="text-[#BF4C74] font-bold">1.</span>
                  <p className="text-gray-700">Share your change style with your team and manager</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#BF4C74] font-bold">2.</span>
                  <p className="text-gray-700">Notice when your style shows up during the next change</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#BF4C74] font-bold">3.</span>
                  <p className="text-gray-700">Practice the "Try This" suggestion for your primary style</p>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#BF4C74] font-bold">4.</span>
                  <p className="text-gray-700">Learn about your teammates' change styles to work better together</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link 
                href="/"
                className="inline-flex items-center text-[#BF4C74] hover:text-[#A63D5F] transition-colors font-medium"
              >
                Explore More Tools
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </ViewportContainer>
        <Footer />
      </>
    )
  }

  // Assessment Questions
  const currentQuestion = questions[currentQuestionIndex]
  const currentAnswer = getCurrentAnswer()

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
                {questions.map((_, index) => (
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
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {/* Determine which section we're in */}
              {currentQuestionIndex === 0 ? 'Change Style' : ''}
            </h2>
            {currentQuestionIndex === 0 && (
              <p className="text-gray-600">
                Thinking about: recent changes at work
              </p>
            )}
          </div>

          <h3 className="text-xl font-semibold text-gray-900 mb-8 text-center">
            {currentQuestion.text}
          </h3>

          <div className="space-y-3">
            {likertOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleAnswer(option.value, false)} // No auto-advance on click
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                  currentAnswer === option.value
                    ? 'bg-gradient-to-r from-[#F595B6] to-[#BF4C74] text-white border-[#BF4C74] shadow-lg'
                    : 'bg-white text-nightfall border-gray-200 hover:border-[#F595B6]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      currentAnswer === option.value
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {option.value}
                    </span>
                    <span className="font-medium">{option.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    currentAnswer === option.value
                      ? 'border-white bg-white'
                      : 'border-gray-400'
                  }`} />
                </div>
              </button>
            ))}
          </div>
          
          {/* Navigation Buttons - INSIDE the card */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentQuestionIndex === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!currentAnswer}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentAnswer
                  ? 'bg-[#BF4C74] text-white hover:bg-[#A63D5F]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
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