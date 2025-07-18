'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Download, Share2, X, Sparkles, Heart, AlertCircle, Target, Briefcase, Users, Rocket, Calendar, Lightbulb, MessageSquare, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import jsPDF from 'jspdf'

interface HopesFears {
  context: string
  hopes: string[]
  fears: string[]
  expectations: string[]
}

const stages = [
  { id: 'intro', title: 'Introduction', icon: Sparkles },
  { id: 'context', title: 'Choose Context', icon: Target },
  { id: 'hopes', title: 'Define Hopes', icon: Heart },
  { id: 'fears', title: 'Identify Fears', icon: AlertCircle },
  { id: 'expectations', title: 'Set Expectations', icon: CheckCircle },
  { id: 'results', title: 'Conversation Guide', icon: MessageSquare }
]

const contexts = [
  {
    id: 'new-role',
    name: 'New Job/Role',
    icon: Briefcase,
    description: 'Starting a new position or transitioning to a new role',
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-700'
  },
  {
    id: 'new-project',
    name: 'New Project',
    icon: Rocket,
    description: 'Kicking off a new project or initiative',
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700'
  },
  {
    id: 'new-team',
    name: 'New Team',
    icon: Users,
    description: 'Joining or forming a new team',
    color: 'bg-purple-500',
    lightColor: 'bg-purple-50',
    textColor: 'text-purple-700'
  },
  {
    id: 'new-partnership',
    name: 'New Partnership',
    icon: Heart,
    description: 'Starting a collaboration or partnership',
    color: 'bg-pink-500',
    lightColor: 'bg-pink-50',
    textColor: 'text-pink-700'
  },
  {
    id: 'major-change',
    name: 'Major Change',
    icon: Calendar,
    description: 'Life events, parental leave, or significant transitions',
    color: 'bg-orange-500',
    lightColor: 'bg-orange-50',
    textColor: 'text-orange-700'
  },
  {
    id: 'new-strategy',
    name: 'New Strategy',
    icon: Lightbulb,
    description: 'Implementing a new approach or direction',
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    textColor: 'text-yellow-700'
  }
]

const hopePrompts = {
  'new-role': [
    'What excites you most about this new role?',
    'What impact do you hope to make in this position?',
    'What skills are you looking forward to developing?',
    'What kind of relationships do you hope to build?',
    'What would make you feel successful in 90 days?',
    'What opportunities do you see in this role?'
  ],
  'new-project': [
    'What excites you about this project?',
    'What outcomes would make you proud?',
    'What new things might you learn?',
    'How do you hope the team will work together?',
    'What impact could this project have?',
    'What would wild success look like?'
  ],
  'new-team': [
    'What kind of team culture do you hope to create?',
    'What strengths do you hope to contribute?',
    'How do you hope the team will collaborate?',
    'What would make this team exceptional?',
    'What kind of relationships do you hope to build?',
    'What achievements would you celebrate together?'
  ],
  'new-partnership': [
    'What value do you hope this partnership creates?',
    'What strengths will each party bring?',
    'How do you hope to communicate and collaborate?',
    'What would make this partnership thrive?',
    'What mutual benefits do you envision?',
    'What legacy could this partnership leave?'
  ],
  'major-change': [
    'What positive outcomes do you hope for during this transition?',
    'How do you hope this change will affect your life/work balance?',
    'What new perspectives might you gain?',
    'What relationships do you hope to maintain or strengthen?',
    'What personal growth could come from this?',
    'How do you hope to be supported through this change?'
  ],
  'new-strategy': [
    'What positive change could this bring?',
    'What problems might this solve?',
    'How might this improve current ways of working?',
    'What new possibilities does this open up?',
    'What would successful implementation look like?',
    'What benefits do you see for stakeholders?'
  ]
}

const fearPrompts = {
  'new-role': [
    'What concerns you about taking on this role?',
    'What challenges might you face?',
    'What knowledge gaps worry you?',
    'What past experiences make you cautious?',
    'What would be signs things aren\'t working?',
    'What support might you need but not get?'
  ],
  'new-project': [
    'What could derail this project?',
    'What resource constraints concern you?',
    'What technical challenges worry you?',
    'What team dynamics might be difficult?',
    'What external factors could impact success?',
    'What would failure look like?'
  ],
  'new-team': [
    'What team dynamics concern you?',
    'What communication challenges might arise?',
    'What conflicts could emerge?',
    'What might prevent effective collaboration?',
    'What cultural differences might cause friction?',
    'What could cause the team to fail?'
  ],
  'new-partnership': [
    'What misalignments might emerge?',
    'What communication breakdowns could occur?',
    'What conflicting priorities worry you?',
    'What could damage trust?',
    'What external pressures might strain the partnership?',
    'What would make you want to exit?'
  ],
  'major-change': [
    'What might you lose or miss during this transition?',
    'What uncertainties worry you most?',
    'How might relationships be affected?',
    'What financial or practical concerns do you have?',
    'What if the change doesn\'t go as planned?',
    'What support might be lacking?'
  ],
  'new-strategy': [
    'What resistance might you face?',
    'What implementation challenges worry you?',
    'What unintended consequences concern you?',
    'What resource gaps might emerge?',
    'What cultural barriers exist?',
    'What would indicate the strategy is failing?'
  ]
}

const expectationPrompts = {
  'new-role': [
    'What support do you need from your manager?',
    'What resources are essential for success?',
    'What meeting rhythm would work best?',
    'What decision-making authority do you need?',
    'What feedback frequency would help you grow?',
    'What work-life boundaries are important?'
  ],
  'new-project': [
    'What project governance do you need?',
    'What communication cadence would work?',
    'What decision rights need clarifying?',
    'What resource commitments are required?',
    'What escalation paths should exist?',
    'What success metrics matter most?'
  ],
  'new-team': [
    'What team norms should we establish?',
    'What meeting structures do we need?',
    'What communication channels work best?',
    'What decision-making process should we use?',
    'What conflict resolution approach fits?',
    'What work styles need accommodating?'
  ],
  'new-partnership': [
    'What communication rhythm works for both?',
    'What decisions need joint approval?',
    'What information should be shared?',
    'What boundaries need respecting?',
    'What success metrics align us?',
    'What review process keeps us on track?'
  ],
  'major-change': [
    'What communication do you need from work/others?',
    'What flexibility would help you navigate this?',
    'What boundaries need to be respected?',
    'What practical support would make a difference?',
    'What understanding do you need from colleagues?',
    'What transition plan would work best?'
  ],
  'new-strategy': [
    'What implementation timeline is realistic?',
    'What change management support is needed?',
    'What communication plan reaches everyone?',
    'What training requirements exist?',
    'What success measures track progress?',
    'What feedback loops enable adjustment?'
  ]
}

export default function HopesFearsTool() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(0)
  const [selectedContext, setSelectedContext] = useState('')
  const [hopes, setHopes] = useState<string[]>(['', '', ''])
  const [fears, setFears] = useState<string[]>(['', '', ''])
  const [expectations, setExpectations] = useState<string[]>(['', '', ''])
  const [isSharing, setIsSharing] = useState(false)

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1)
    }
  }

  const handleBack = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
    }
  }

  const handleShare = async () => {
    if (isSharing) return
    
    setIsSharing(true)
    try {
      const shareData = {
        type: 'hopes-fears-expectations',
        data: {
          context: selectedContext,
          hopes,
          fears,
          expectations
        },
        createdAt: new Date().toISOString()
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
      
      await navigator.clipboard.writeText(fullUrl)
      alert('Share link copied to clipboard!')
    } catch (error) {
      console.error('Error sharing:', error)
      alert('Sorry, couldn\'t create a share link. Please try again.')
    } finally {
      setIsSharing(false)
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF()
    const context = contexts.find(c => c.id === selectedContext)
    
    // Title
    doc.setFontSize(24)
    doc.text('Hopes, Fears & Expectations', 20, 30)
    
    doc.setFontSize(14)
    doc.text(`Context: ${context?.name}`, 20, 45)
    
    // Hopes
    doc.setFontSize(18)
    doc.text('HOPES', 20, 65)
    doc.setFontSize(12)
    hopes.filter(h => h).forEach((hope, index) => {
      const lines = doc.splitTextToSize(`• ${hope}`, 170)
      doc.text(lines, 25, 75 + (index * 15))
    })
    
    // Fears
    doc.setFontSize(18)
    doc.text('FEARS', 20, 120)
    doc.setFontSize(12)
    fears.filter(f => f).forEach((fear, index) => {
      const lines = doc.splitTextToSize(`• ${fear}`, 170)
      doc.text(lines, 25, 130 + (index * 15))
    })
    
    // Expectations
    doc.setFontSize(18)
    doc.text('EXPECTATIONS', 20, 175)
    doc.setFontSize(12)
    expectations.filter(e => e).forEach((expectation, index) => {
      const lines = doc.splitTextToSize(`• ${expectation}`, 170)
      doc.text(lines, 25, 185 + (index * 15))
    })
    
    doc.save('hopes-fears-expectations.pdf')
  }

  const renderStage = () => {
    const stage = stages[currentStage]

    switch (stage.id) {
      case 'intro':
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#FFA62A] to-[#DB4839] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <button
                onClick={() => router.push('/')}
                className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center space-y-8">
                <div className="inline-flex p-6 bg-white/20 backdrop-blur-sm rounded-full">
                  <Sparkles className="w-20 h-20 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-white">Hopes, Fears & Expectations</h1>
                  <p className="text-xl text-white/90 max-w-xl mx-auto">
                    Prepare for meaningful conversations by clarifying what you hope for, what concerns you, and what you need to succeed.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-3">How it works:</h3>
                  <ol className="space-y-2 text-white/80">
                    <li>1. Choose your context (new role, project, etc.)</li>
                    <li>2. Reflect on your hopes - what excites you?</li>
                    <li>3. Identify your fears - what concerns you?</li>
                    <li>4. Set clear expectations - what do you need?</li>
                    <li>5. Get a conversation guide to share</li>
                  </ol>
                </div>

                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-white text-[#DB4839] rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-200"
                >
                  Start Preparing
                </button>

                <p className="text-white/70 text-sm">
                  This will take about 10-15 minutes to complete
                </p>
              </div>
            </div>
          </div>
        )

      case 'context':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">What's Your Context?</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#DB4839]'
                            : index < currentStage
                            ? 'w-2 bg-[#DB4839]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <p className="text-gray-600 mb-8 text-center text-lg">
                  Select the situation you're preparing for
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {contexts.map((context) => {
                    const Icon = context.icon
                    return (
                      <button
                        key={context.id}
                        onClick={() => setSelectedContext(context.id)}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          selectedContext === context.id
                            ? `${context.color} text-white border-transparent`
                            : 'bg-white hover:border-gray-300 border-gray-200'
                        }`}
                      >
                        <div className={`inline-flex p-3 rounded-lg mb-3 ${
                          selectedContext === context.id ? 'bg-white/20' : context.lightColor
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            selectedContext === context.id ? 'text-white' : context.textColor
                          }`} />
                        </div>
                        <h3 className={`font-semibold text-lg mb-1 ${
                          selectedContext === context.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {context.name}
                        </h3>
                        <p className={`text-sm ${
                          selectedContext === context.id ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          {context.description}
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!selectedContext}
                    className="px-6 py-3 bg-[#DB4839] text-white rounded-lg font-medium hover:bg-[#C43830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'hopes':
        const contextInfo = contexts.find(c => c.id === selectedContext)
        const hopeQuestions = hopePrompts[selectedContext as keyof typeof hopePrompts] || []
        
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">What Are Your Hopes?</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#DB4839]'
                            : index < currentStage
                            ? 'w-2 bg-[#DB4839]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex p-3 bg-yellow-100 rounded-full mb-4">
                    <Heart className="w-8 h-8 text-yellow-600" />
                  </div>
                  <p className="text-gray-600">
                    For your <span className="font-semibold">{contextInfo?.name}</span>, what are you looking forward to?
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-2">Consider these questions:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {hopeQuestions.slice(0, 3).map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hope #{index + 1}
                        </label>
                        <textarea
                          value={hopes[index]}
                          onChange={(e) => {
                            const newHopes = [...hopes]
                            newHopes[index] = e.target.value
                            setHopes(newHopes)
                          }}
                          placeholder={hopeQuestions[index]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4839] min-h-[80px] resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!hopes.some(h => h.trim())}
                    className="px-6 py-3 bg-[#DB4839] text-white rounded-lg font-medium hover:bg-[#C43830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'fears':
        const fearQuestions = fearPrompts[selectedContext as keyof typeof fearPrompts] || []
        
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">What Are Your Fears?</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#DB4839]'
                            : index < currentStage
                            ? 'w-2 bg-[#DB4839]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex p-3 bg-red-100 rounded-full mb-4">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-gray-600">
                    What concerns or worries do you have?
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800 font-medium mb-2">Consider these questions:</p>
                    <ul className="text-sm text-red-700 space-y-1">
                      {fearQuestions.slice(0, 3).map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fear #{index + 1}
                        </label>
                        <textarea
                          value={fears[index]}
                          onChange={(e) => {
                            const newFears = [...fears]
                            newFears[index] = e.target.value
                            setFears(newFears)
                          }}
                          placeholder={fearQuestions[index]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4839] min-h-[80px] resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!fears.some(f => f.trim())}
                    className="px-6 py-3 bg-[#DB4839] text-white rounded-lg font-medium hover:bg-[#C43830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'expectations':
        const expectationQuestions = expectationPrompts[selectedContext as keyof typeof expectationPrompts] || []
        
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">What Are Your Expectations?</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#DB4839]'
                            : index < currentStage
                            ? 'w-2 bg-[#DB4839]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex p-3 bg-green-100 rounded-full mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">
                    What do you need to be successful?
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium mb-2">Consider these questions:</p>
                    <ul className="text-sm text-green-700 space-y-1">
                      {expectationQuestions.slice(0, 3).map((q, i) => (
                        <li key={i}>• {q}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index}>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expectation #{index + 1}
                        </label>
                        <textarea
                          value={expectations[index]}
                          onChange={(e) => {
                            const newExpectations = [...expectations]
                            newExpectations[index] = e.target.value
                            setExpectations(newExpectations)
                          }}
                          placeholder={expectationQuestions[index]}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DB4839] min-h-[80px] resize-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!expectations.some(e => e.trim())}
                    className="px-6 py-3 bg-[#DB4839] text-white rounded-lg font-medium hover:bg-[#C43830] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View Conversation Guide
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'results':
        const selectedContextInfo = contexts.find(c => c.id === selectedContext)
        
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Conversation Guide</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={generatePDF}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                    <button
                      onClick={handleShare}
                      disabled={isSharing}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <Share2 className="w-4 h-4" />
                      {isSharing ? 'Sharing...' : 'Share'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Context Header */}
                <div className="bg-gradient-to-br from-[#FFA62A] to-[#DB4839] rounded-2xl p-8 text-white">
                  <div className="flex items-center gap-4">
                    <div className="inline-flex p-3 bg-white/20 rounded-full">
                      {selectedContextInfo && <selectedContextInfo.icon className="w-8 h-8 text-white" />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {selectedContextInfo?.name} Conversation
                      </h3>
                      <p className="text-white/90">
                        Use this guide to have a meaningful conversation about hopes, fears, and expectations
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hopes Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex p-2 bg-yellow-100 rounded-lg">
                      <Heart className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">HOPES</h3>
                    <span className="text-sm text-gray-500">What I'm looking forward to</span>
                  </div>
                  <div className="space-y-3">
                    {hopes.filter(h => h.trim()).map((hope, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-yellow-600">{index + 1}</span>
                        </div>
                        <p className="text-gray-700">{hope}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fears Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex p-2 bg-red-100 rounded-lg">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">FEARS</h3>
                    <span className="text-sm text-gray-500">What concerns me</span>
                  </div>
                  <div className="space-y-3">
                    {fears.filter(f => f.trim()).map((fear, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-red-600">{index + 1}</span>
                        </div>
                        <p className="text-gray-700">{fear}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expectations Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">EXPECTATIONS</h3>
                    <span className="text-sm text-gray-500">What I need to succeed</span>
                  </div>
                  <div className="space-y-3">
                    {expectations.filter(e => e.trim()).map((expectation, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-green-600">{index + 1}</span>
                        </div>
                        <p className="text-gray-700">{expectation}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversation Tips */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex p-2 bg-purple-100 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Conversation Tips</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Before the Conversation:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex gap-2">
                          <span className="text-purple-600">•</span>
                          Schedule dedicated time without distractions
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-600">•</span>
                          Share this guide in advance if appropriate
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-600">•</span>
                          Come with an open mind and heart
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">During the Conversation:</h4>
                      <ul className="space-y-2 text-gray-600">
                        <li className="flex gap-2">
                          <span className="text-purple-600">•</span>
                          Listen actively and ask clarifying questions
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-600">•</span>
                          Share your own hopes, fears, and expectations
                        </li>
                        <li className="flex gap-2">
                          <span className="text-purple-600">•</span>
                          Work together to align on mutual expectations
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-[#FFA62A]/10 to-[#DB4839]/10 rounded-2xl p-6 border border-[#DB4839]/20">
                  <h4 className="font-semibold text-gray-900 mb-3">Suggested Next Steps:</h4>
                  <ol className="space-y-2 text-gray-700">
                    <li>1. Schedule a conversation to discuss these topics</li>
                    <li>2. Document any agreements or action items</li>
                    <li>3. Set a follow-up date to check in on progress</li>
                    <li>4. Revisit and update as circumstances change</li>
                  </ol>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Ready for more tools?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Explore More Tools
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#DB4839] text-white rounded-lg hover:bg-[#C43830] transition-colors"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return renderStage()
}