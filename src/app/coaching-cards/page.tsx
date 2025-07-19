'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Download, Share2, X, Lightbulb, Users, Building2, Heart, Brain, TrendingUp, Sparkles, ShieldCheck, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ShareButton from '@/components/ShareButton'

interface ReflectionData {
  category: string
  focusArea: string
  questions: Array<{
    text: string
    reflection: string
  }>
  challengeSolution: string
  nextStep: string
}

const stages = [
  { id: 'intro', title: 'Introduction' },
  { id: 'category', title: 'Choose Category' },
  { id: 'focus-area', title: 'Focus Area' },
  { id: 'questions', title: 'Questions' },
  { id: 'reflection', title: 'Reflection' },
  { id: 'solution', title: 'Solution' },
  { id: 'next-steps', title: 'Next Steps' },
  { id: 'results', title: 'Summary' }
]

const categories = [
  { 
    id: 'self', 
    name: 'Self', 
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgLight: 'bg-purple-50',
    description: 'Connect with yourself and explore your personal growth',
    icon: Heart
  },
  { 
    id: 'team', 
    name: 'Team', 
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgLight: 'bg-blue-50',
    description: 'Build stronger connections and trust within your team',
    icon: Users
  },
  { 
    id: 'company', 
    name: 'Company', 
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgLight: 'bg-orange-50',
    description: 'Align with organizational purpose and drive results',
    icon: Building2
  }
]

const focusAreas = {
  self: [
    { id: 'wellness', name: 'Wellness', icon: Heart, description: 'Explore your physical and mental well-being' },
    { id: 'awareness', name: 'Awareness', icon: Brain, description: 'Deepen self-understanding and mindfulness' },
    { id: 'progress', name: 'Progress', icon: TrendingUp, description: 'Track your growth and celebrate wins' }
  ],
  team: [
    { id: 'trust', name: 'Trust', icon: ShieldCheck, description: 'Build psychological safety and trust' },
    { id: 'coaching', name: 'Coaching', icon: Sparkles, description: 'Develop and empower team members' },
    { id: 'outcomes', name: 'Outcomes', icon: Target, description: 'Align on goals and deliver results' }
  ],
  company: [
    { id: 'purpose', name: 'Purpose', icon: Lightbulb, description: 'Connect with organizational mission' },
    { id: 'culture', name: 'Culture', icon: Heart, description: 'Shape and strengthen company culture' },
    { id: 'results', name: 'Results', icon: TrendingUp, description: 'Drive meaningful business outcomes' }
  ]
}

// Question data extracted from the cards
const questionData: Record<string, Record<string, string[]>> = {
  self: {
    wellness: [
      "What could I do to better take care of myself?",
      "What habits are helping or hindering my well-being?",
      "How am I showing up physically and mentally?",
      "What boundaries do I need to set to protect my energy?",
      "When do I feel most energized and alive?",
      "What small change could make a big difference in my wellness?"
    ],
    awareness: [
      "What patterns do I notice in my thoughts and behaviors?",
      "What triggers cause me to react rather than respond?",
      "How well do I understand my strengths and blind spots?",
      "What feedback have I been avoiding or dismissing?",
      "When am I most authentic and when do I wear a mask?",
      "What stories am I telling myself that may not be true?"
    ],
    progress: [
      "What progress have I made that I haven't celebrated?",
      "What skills have I developed in the last year?",
      "How have I grown from recent challenges?",
      "What would success look like for me right now?",
      "What's one area where I want to see growth?",
      "How can I measure my progress in meaningful ways?"
    ]
  },
  team: {
    trust: [
      "When it comes to trust on our team, what is missing?",
      "How safe do people feel to speak up and be vulnerable?",
      "What behaviors are building or breaking trust?",
      "How do we handle conflict and disagreement?",
      "What would it take to deepen trust by 10%?",
      "How do we repair trust when it's been damaged?"
    ],
    coaching: [
      "How am I helping others grow and develop?",
      "What questions could unlock someone's potential?",
      "When do I tell versus ask in conversations?",
      "How well do I listen to understand vs. respond?",
      "What assumptions am I making about others' capabilities?",
      "How can I create more learning moments for my team?"
    ],
    outcomes: [
      "Are we clear on what success looks like?",
      "How aligned are our individual goals with team goals?",
      "What's getting in the way of achieving our outcomes?",
      "How do we celebrate wins and learn from misses?",
      "What would need to change to exceed our goals?",
      "How are we measuring what truly matters?"
    ]
  },
  company: {
    purpose: [
      "Why does the company exist?",
      "How does my work connect to our larger purpose?",
      "What impact are we trying to make in the world?",
      "When do I feel most aligned with our mission?",
      "How could we better live our purpose daily?",
      "What would our customers say our purpose is?"
    ],
    culture: [
      "What behaviors do we reward vs. what we say we value?",
      "How inclusive and welcoming is our culture?",
      "What unwritten rules shape how we work?",
      "Where are the gaps between our stated and lived values?",
      "What cultural strengths should we protect and amplify?",
      "How is our culture evolving and where should it go?"
    ],
    results: [
      "What results are we achieving and at what cost?",
      "How do we balance short-term wins with long-term success?",
      "What metrics might be driving the wrong behaviors?",
      "Where are we over-optimizing and under-delivering?",
      "How could we achieve more with less effort?",
      "What bold bets should we be making?"
    ]
  }
}

export default function CoachingCardsTool() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedFocusArea, setSelectedFocusArea] = useState('')
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [reflections, setReflections] = useState<Record<number, string>>({})
  const [challengeSolution, setChallengeSolution] = useState('')
  const [nextStep, setNextStep] = useState('')

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

  const toggleQuestion = (index: number) => {
    if (selectedQuestions.includes(index)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== index))
    } else if (selectedQuestions.length < 2) {
      setSelectedQuestions([...selectedQuestions, index])
    }
  }

  const getQuestions = () => {
    if (selectedCategory && selectedFocusArea) {
      return questionData[selectedCategory]?.[selectedFocusArea] || []
    }
    return []
  }

  const handleShare = async () => {
    const shareData = {
      type: 'coaching-reflection',
      data: {
        category: selectedCategory,
        focusArea: selectedFocusArea,
        questions: selectedQuestions.map(idx => ({
          text: getQuestions()[idx],
          reflection: reflections[idx] || ''
        })),
        challengeSolution,
        nextStep
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
    
    return fullUrl
  }

  const renderStage = () => {
    const stage = stages[currentStage]

    switch (stage.id) {
      case 'intro':
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#FACD65] to-[#8AB307] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <Link 
                href="/?screen=4" 
                className="absolute top-8 left-8 inline-flex items-center text-white/70 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Plan
              </Link>

              <div className="text-center space-y-8">
                <div className="inline-flex p-6 bg-white/20 backdrop-blur-sm rounded-full">
                  <Lightbulb className="w-20 h-20 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-white">Coaching Cards</h1>
                  <p className="text-xl text-white/90 max-w-xl mx-auto">
                    Powerful questions to spark meaningful conversations and drive personal and team growth.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-3">How to use this tool:</h3>
                  <ol className="space-y-2 text-white/80">
                    <li>1. Choose a category that resonates with your current needs</li>
                    <li>2. Select a focus area within that category</li>
                    <li>3. Pick 2 questions that spark your curiosity</li>
                    <li>4. Reflect deeply on each question</li>
                    <li>5. Identify solutions and commit to next steps</li>
                  </ol>
                </div>

                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-white text-[#8AB307] rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-200"
                >
                  Get Started
                </button>

                <p className="text-white/70 text-sm">
                  This will take about 10-15 minutes to complete
                </p>
              </div>
            </div>
          </div>
        )

      case 'category':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Category</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#8AB307]'
                            : index < currentStage
                            ? 'w-2 bg-[#8AB307]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <p className="text-gray-600 mb-8 text-center">
                  Select the area where you'd like to focus your reflection and growth
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {categories.map((category) => {
                    const Icon = category.icon
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`relative p-6 rounded-xl border-2 transition-all ${
                          selectedCategory === category.id
                            ? `border-2 ${category.color} ${category.bgLight}`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`inline-flex p-3 rounded-lg mb-4 ${category.bgLight}`}>
                          <Icon className={`w-8 h-8 ${category.textColor}`} />
                        </div>
                        <h3 className={`text-xl font-semibold mb-2 ${
                          selectedCategory === category.id ? category.textColor : 'text-gray-900'
                        }`}>
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    Each category contains focus areas designed to help you explore different aspects of {selectedCategory || 'your chosen area'}
                  </p>
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
                    disabled={!selectedCategory}
                    className="px-6 py-3 bg-[#8AB307] text-white rounded-lg font-medium hover:bg-[#7A9F06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'focus-area':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Choose Your Focus Area</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#8AB307]'
                            : index < currentStage
                            ? 'w-2 bg-[#8AB307]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <p className="text-gray-600 mb-8 text-center">
                  Choose an area where you need help as it relates to <span className="font-semibold">{selectedCategory}</span>
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {(focusAreas[selectedCategory as keyof typeof focusAreas] || []).map((area) => {
                    const Icon = area.icon
                    const category = categories.find(c => c.id === selectedCategory)
                    
                    return (
                      <button
                        key={area.id}
                        onClick={() => setSelectedFocusArea(area.id)}
                        className={`relative p-6 rounded-xl border-2 transition-all ${
                          selectedFocusArea === area.id
                            ? `border-2 ${category?.color} ${category?.bgLight}`
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`inline-flex p-3 rounded-lg mb-4 ${category?.bgLight}`}>
                          <Icon className={`w-8 h-8 ${category?.textColor}`} />
                        </div>
                        <h3 className={`text-xl font-semibold mb-2 ${
                          selectedFocusArea === area.id ? category?.textColor : 'text-gray-900'
                        }`}>
                          {area.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {area.description}
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
                    disabled={!selectedFocusArea}
                    className="px-6 py-3 bg-[#8AB307] text-white rounded-lg font-medium hover:bg-[#7A9F06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'questions':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Select Your Questions</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#8AB307]'
                            : index < currentStage
                            ? 'w-2 bg-[#8AB307]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <p className="text-gray-600 mb-8 text-center">
                  Choose 2 questions to help you reflect on your challenge ({selectedQuestions.length}/2 selected)
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getQuestions().map((question, index) => {
                    const isSelected = selectedQuestions.includes(index)
                    const cardNumber = index + 1
                    const imageName = `${selectedFocusArea.charAt(0).toUpperCase() + selectedFocusArea.slice(1)} ${cardNumber}.png`
                    
                    return (
                      <button
                        key={index}
                        onClick={() => toggleQuestion(index)}
                        disabled={!isSelected && selectedQuestions.length >= 2}
                        className={`relative transition-all ${
                          isSelected 
                            ? 'scale-105 shadow-lg' 
                            : selectedQuestions.length >= 2 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:scale-102 hover:shadow-md'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute -top-3 -right-3 w-10 h-10 bg-[#8AB307] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md z-10">
                            {selectedQuestions.indexOf(index) + 1}
                          </div>
                        )}
                        <div className="relative h-[300px] w-full">
                          <Image
                            src={`/coaching-cards/${imageName}`}
                            alt={question}
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
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
                    disabled={selectedQuestions.length !== 2}
                    className="px-6 py-3 bg-[#8AB307] text-white rounded-lg font-medium hover:bg-[#7A9F06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'reflection':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Reflect on Your Questions</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#8AB307]'
                            : index < currentStage
                            ? 'w-2 bg-[#8AB307]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <p className="text-gray-600 mb-8 text-center">
                  Take a moment to reflect deeply on each question
                </p>

                <div className="space-y-8">
                  {selectedQuestions.map((questionIndex, idx) => {
                    const question = getQuestions()[questionIndex]
                    const cardNumber = questionIndex + 1
                    const imageName = `${selectedFocusArea.charAt(0).toUpperCase() + selectedFocusArea.slice(1)} ${cardNumber}.png`
                    
                    return (
                      <div key={idx} className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="relative h-32 w-24 flex-shrink-0">
                            <Image
                              src={`/coaching-cards/${imageName}`}
                              alt={question}
                              fill
                              className="object-contain rounded"
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              Question {idx + 1}: {question}
                            </h3>
                            <textarea
                              value={reflections[questionIndex] || ''}
                              onChange={(e) => setReflections({
                                ...reflections,
                                [questionIndex]: e.target.value
                              })}
                              placeholder="Write your thoughts here..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8AB307] min-h-[120px] resize-none"
                            />
                          </div>
                        </div>
                      </div>
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
                    disabled={selectedQuestions.some(idx => !reflections[idx])}
                    className="px-6 py-3 bg-[#8AB307] text-white rounded-lg font-medium hover:bg-[#7A9F06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'solution':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Identify Your Solution</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#8AB307]'
                            : index < currentStage
                            ? 'w-2 bg-[#8AB307]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Reflections:</h3>
                    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                      {selectedQuestions.map((questionIndex, idx) => (
                        <div key={idx}>
                          <p className="text-sm font-medium text-gray-700">
                            {idx + 1}. {getQuestions()[questionIndex]}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 italic">
                            "{reflections[questionIndex]}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      Based on your reflections, what solution or approach could address your challenge?
                    </label>
                    <textarea
                      value={challengeSolution}
                      onChange={(e) => setChallengeSolution(e.target.value)}
                      placeholder="Describe your solution or approach..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8AB307] min-h-[150px] resize-none"
                    />
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
                    disabled={!challengeSolution}
                    className="px-6 py-3 bg-[#8AB307] text-white rounded-lg font-medium hover:bg-[#7A9F06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'next-steps':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Define Your Next Step</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#8AB307]'
                            : index < currentStage
                            ? 'w-2 bg-[#8AB307]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="p-4 bg-[#FACD65]/20 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Your Solution:</h3>
                    <p className="text-gray-700 italic">"{challengeSolution}"</p>
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-3">
                      What's one specific action you'll take in the next 7 days?
                    </label>
                    <textarea
                      value={nextStep}
                      onChange={(e) => setNextStep(e.target.value)}
                      placeholder="Be specific: What will you do? When? How will you know it's complete?"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8AB307] min-h-[120px] resize-none"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Pro tip:</strong> Make your next step SMART - Specific, Measurable, Achievable, Relevant, and Time-bound.
                    </p>
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
                    disabled={!nextStep}
                    className="px-6 py-3 bg-[#8AB307] text-white rounded-lg font-medium hover:bg-[#7A9F06] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'results':
        const category = categories.find(c => c.id === selectedCategory)
        const area = focusAreas[selectedCategory as keyof typeof focusAreas]?.find(a => a.id === selectedFocusArea)
        
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Coaching Reflection Summary</h2>
                  <div className="flex gap-3">
                    <ShareButton
                      onShare={handleShare}
                      variant="secondary"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-8">
                  <div className="text-center">
                    <div className={`inline-flex p-4 rounded-full mb-4 ${category?.bgLight}`}>
                      <Lightbulb className={`w-12 h-12 ${category?.textColor}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {category?.name} - {area?.name}
                    </h3>
                    <p className="text-gray-600">Your reflection journey and commitments</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Questions & Reflections:</h4>
                      <div className="space-y-4">
                        {selectedQuestions.map((questionIndex, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-700 mb-2">
                              {getQuestions()[questionIndex]}
                            </p>
                            <p className="text-gray-600 italic">
                              "{reflections[questionIndex]}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-[#FACD65]/20 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Your Solution:</h4>
                      <p className="text-gray-700">{challengeSolution}</p>
                    </div>

                    <div className="p-4 bg-[#8AB307]/20 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Your Next Step:</h4>
                      <p className="text-gray-700">{nextStep}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Ready to continue your growth journey?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Explore More Tools
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#8AB307] text-white rounded-lg hover:bg-[#7A9F06] transition-colors"
                  >
                    Start New Reflection
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