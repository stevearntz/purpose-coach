'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, Download, Share2, X, TrendingUp, Sparkles, Target, Heart, Shield, Globe, Lightbulb, Users, Zap, Palette, Trophy, Brain, Briefcase, Star, Gift, MessageCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import jsPDF from 'jspdf'

interface DriverSelection {
  section: number
  drivers: string[]
}

interface TopDriverAnalysis {
  driver: string
  ranking: number
  meaning: string
  why: string
}

const stages = [
  { id: 'intro', title: 'Introduction', icon: TrendingUp },
  { id: 'section1', title: 'Creativity & Freedom', icon: Palette },
  { id: 'section2', title: 'Growth & Challenge', icon: Target },
  { id: 'section3', title: 'Leadership & Impact', icon: Trophy },
  { id: 'section4', title: 'Stability & Recognition', icon: Shield },
  { id: 'section5', title: 'Connection & Support', icon: Heart },
  { id: 'section6', title: 'Environment & Values', icon: Globe },
  { id: 'ranking', title: 'Rank Your Drivers', icon: Star },
  { id: 'analysis', title: 'Deep Dive', icon: Brain },
  { id: 'results', title: 'Your Career Map', icon: TrendingUp }
]

const driverSections = [
  {
    id: 1,
    title: 'Creativity & Freedom',
    icon: Palette,
    color: 'bg-yellow-500',
    lightColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    description: 'Express yourself and work independently',
    drivers: [
      { name: 'CREATIVITY', description: 'Generating new ideas and innovative solutions' },
      { name: 'AUTONOMY', description: 'Having control over your work and decisions' },
      { name: 'FUN', description: 'Enjoying what you do and having a good time' },
      { name: 'VARIETY', description: 'Working on diverse tasks and projects' },
      { name: 'RISK TAKING', description: 'Embracing uncertainty and new challenges' },
      { name: 'FREEDOM', description: 'Flexibility in how and when you work' }
    ]
  },
  {
    id: 2,
    title: 'Growth & Challenge',
    icon: Target,
    color: 'bg-lime-500',
    lightColor: 'bg-lime-50',
    textColor: 'text-lime-700',
    description: 'Push yourself to learn and achieve more',
    drivers: [
      { name: 'OPPORTUNITY', description: 'Access to advancement and new possibilities' },
      { name: 'CHALLENGE', description: 'Tackling difficult problems and stretching yourself' },
      { name: 'BUILDING SKILLS', description: 'Continuously developing new capabilities' },
      { name: 'INNOVATION', description: 'Creating novel solutions and approaches' },
      { name: 'ACHIEVEMENT', description: 'Accomplishing meaningful goals' },
      { name: 'LEARNING', description: 'Gaining knowledge and expertise' }
    ]
  },
  {
    id: 3,
    title: 'Leadership & Impact',
    icon: Trophy,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-700',
    description: 'Make a difference and guide others',
    drivers: [
      { name: 'LEADERSHIP', description: 'Guiding and inspiring others' },
      { name: 'IMPACT', description: 'Making a meaningful difference' },
      { name: 'GETTING RESULTS', description: 'Achieving tangible outcomes' },
      { name: 'INFLUENCE', description: 'Shaping decisions and directions' },
      { name: 'PURPOSE', description: 'Working toward something meaningful' },
      { name: 'PROBLEM SOLVING', description: 'Finding solutions to complex issues' }
    ]
  },
  {
    id: 4,
    title: 'Stability & Recognition',
    icon: Shield,
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    description: 'Find security and appreciation',
    drivers: [
      { name: 'RESPECT', description: 'Being valued for your contributions' },
      { name: 'STRUCTURE', description: 'Clear expectations and processes' },
      { name: 'FEELING VALUED', description: 'Recognition of your worth' },
      { name: 'BALANCE', description: 'Harmony between work and life' },
      { name: 'APPRECIATION', description: 'Acknowledgment of your efforts' },
      { name: 'COMPENSATION', description: 'Fair financial rewards' }
    ]
  },
  {
    id: 5,
    title: 'Connection & Support',
    icon: Heart,
    color: 'bg-teal-500',
    lightColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    description: 'Build relationships and help others',
    drivers: [
      { name: 'EMPATHY', description: 'Understanding and supporting others' },
      { name: 'MENTORSHIP', description: 'Guiding others in their growth' },
      { name: 'INCLUSION', description: 'Creating belonging for everyone' },
      { name: 'TRUST', description: 'Building reliable relationships' },
      { name: 'HELPING OTHERS', description: 'Making others\' lives better' },
      { name: 'COLLABORATION', description: 'Working together toward goals' }
    ]
  },
  {
    id: 6,
    title: 'Environment & Values',
    icon: Globe,
    color: 'bg-cyan-500',
    lightColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    description: 'Align with culture and mission',
    drivers: [
      { name: 'PERSONAL BRAND', description: 'Building your professional identity' },
      { name: 'CULTURE', description: 'Working in the right environment' },
      { name: 'INDUSTRY', description: 'Being in a field you care about' },
      { name: 'FLEXIBILITY', description: 'Adapting to changing needs' },
      { name: 'DIVERSITY', description: 'Variety of perspectives and people' },
      { name: 'VISION & MISSION', description: 'Alignment with organizational goals' }
    ]
  }
]

export default function CareerDriversTool() {
  const router = useRouter()
  const [currentStage, setCurrentStage] = useState(0)
  const [selectedDrivers, setSelectedDrivers] = useState<DriverSelection[]>([])
  const [rankedDrivers, setRankedDrivers] = useState<string[]>([])
  const [focusDriver, setFocusDriver] = useState<TopDriverAnalysis>({
    driver: '',
    ranking: 1,
    meaning: '',
    why: ''
  })
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

  const handleDriverSelect = (sectionId: number, driver: string) => {
    setSelectedDrivers(prev => {
      const sectionIndex = prev.findIndex(s => s.section === sectionId)
      
      if (sectionIndex === -1) {
        // No drivers selected for this section yet
        return [...prev, { section: sectionId, drivers: [driver] }]
      }
      
      const section = prev[sectionIndex]
      const driverIndex = section.drivers.indexOf(driver)
      
      if (driverIndex === -1 && section.drivers.length < 2) {
        // Add driver (max 2 per section)
        return prev.map(s => 
          s.section === sectionId 
            ? { ...s, drivers: [...s.drivers, driver] }
            : s
        )
      } else if (driverIndex !== -1) {
        // Remove driver
        const newDrivers = section.drivers.filter(d => d !== driver)
        if (newDrivers.length === 0) {
          // Remove section if no drivers left
          return prev.filter(s => s.section !== sectionId)
        }
        return prev.map(s => 
          s.section === sectionId 
            ? { ...s, drivers: newDrivers }
            : s
        )
      }
      
      return prev
    })
  }

  const getSectionDrivers = (sectionId: number): string[] => {
    const section = selectedDrivers.find(s => s.section === sectionId)
    return section?.drivers || []
  }

  const getAllSelectedDrivers = (): string[] => {
    return selectedDrivers.flatMap(s => s.drivers)
  }

  const moveDriverUp = (index: number) => {
    if (index === 0) return
    setRankedDrivers(prev => {
      const newRanked = [...prev]
      ;[newRanked[index - 1], newRanked[index]] = [newRanked[index], newRanked[index - 1]]
      return newRanked
    })
  }

  const moveDriverDown = (index: number) => {
    if (index === rankedDrivers.length - 1) return
    setRankedDrivers(prev => {
      const newRanked = [...prev]
      ;[newRanked[index], newRanked[index + 1]] = [newRanked[index + 1], newRanked[index]]
      return newRanked
    })
  }

  const handleShare = async () => {
    if (isSharing) return
    
    setIsSharing(true)
    try {
      const shareData = {
        type: 'career-drivers',
        data: {
          selectedDrivers,
          rankedDrivers,
          focusDriver
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
    
    // Title
    doc.setFontSize(24)
    doc.text('Your Career Drivers Map', 20, 30)
    
    // Top 6 Drivers
    doc.setFontSize(16)
    doc.text('Your Top 6 Career Drivers:', 20, 50)
    
    doc.setFontSize(12)
    rankedDrivers.forEach((driver, index) => {
      doc.text(`${index + 1}. ${driver}`, 30, 65 + (index * 10))
    })
    
    // Focus Driver
    if (focusDriver.driver) {
      doc.setFontSize(16)
      doc.text('Your Primary Focus Driver:', 20, 140)
      
      doc.setFontSize(14)
      doc.text(focusDriver.driver, 30, 155)
      
      doc.setFontSize(12)
      doc.text('What it means to you:', 30, 170)
      const meaningLines = doc.splitTextToSize(focusDriver.meaning, 150)
      doc.text(meaningLines, 30, 180)
      
      doc.text('Why it matters:', 30, 200 + (meaningLines.length * 5))
      const whyLines = doc.splitTextToSize(focusDriver.why, 150)
      doc.text(whyLines, 30, 210 + (meaningLines.length * 5))
    }
    
    doc.save('career-drivers-map.pdf')
  }

  const renderStage = () => {
    const stage = stages[currentStage]

    switch (stage.id) {
      case 'intro':
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#BADA54] to-[#30B859] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <button
                onClick={() => router.push('/')}
                className="absolute top-4 left-4 p-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center space-y-8">
                <div className="inline-flex p-6 bg-white/20 backdrop-blur-sm rounded-full">
                  <TrendingUp className="w-20 h-20 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-white">Career Drivers</h1>
                  <p className="text-xl text-white/90 max-w-xl mx-auto">
                    Discover what truly motivates you and create a personalized career map aligned with your core drivers.
                  </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-left max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-white mb-3">What you'll do:</h3>
                  <ol className="space-y-2 text-white/80">
                    <li>1. Select 2 drivers from each of 6 categories</li>
                    <li>2. Rank your top 6 drivers by importance</li>
                    <li>3. Deep dive into your #1 career driver</li>
                    <li>4. Get your personalized career map</li>
                  </ol>
                </div>

                <button
                  onClick={handleNext}
                  className="px-8 py-4 bg-white text-[#30B859] rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-200"
                >
                  Start Discovering
                </button>

                <p className="text-white/70 text-sm">
                  This will take about 10-15 minutes to complete
                </p>
              </div>
            </div>
          </div>
        )

      case 'section1':
      case 'section2':
      case 'section3':
      case 'section4':
      case 'section5':
      case 'section6':
        const sectionIndex = parseInt(stage.id.replace('section', '')) - 1
        const section = driverSections[sectionIndex]
        const SectionIcon = section.icon
        const sectionDriverSelection = getSectionDrivers(section.id)
        
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#30B859]'
                            : index < currentStage
                            ? 'w-2 bg-[#30B859]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className={`inline-flex p-4 ${section.lightColor} rounded-full mb-4`}>
                    <SectionIcon className={`w-12 h-12 ${section.textColor}`} />
                  </div>
                  <p className="text-gray-600 text-lg">
                    {section.description}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Select two drivers that best describe what motivates you
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {section.drivers.map((driver) => {
                    const isSelected = sectionDriverSelection.includes(driver.name)
                    return (
                      <button
                        key={driver.name}
                        onClick={() => handleDriverSelect(section.id, driver.name)}
                        disabled={!isSelected && sectionDriverSelection.length >= 2}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? `${section.color} text-white border-transparent`
                            : sectionDriverSelection.length >= 2
                            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white hover:border-gray-300 border-gray-200'
                        }`}
                      >
                        <h3 className={`font-semibold text-lg mb-1 ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {driver.name}
                        </h3>
                        <p className={`text-sm ${
                          isSelected ? 'text-white/90' : 'text-gray-600'
                        }`}>
                          {driver.description}
                        </p>
                      </button>
                    )
                  })}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={sectionDriverSelection.length !== 2}
                    className="px-6 py-3 bg-[#30B859] text-white rounded-lg font-medium hover:bg-[#2AA34F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'ranking':
        const allDrivers = getAllSelectedDrivers()
        
        // Initialize ranked drivers if not already done
        if (rankedDrivers.length === 0 && allDrivers.length === 12) {
          setRankedDrivers(allDrivers.slice(0, 6))
        }
        
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Rank Your Top 6 Drivers</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#30B859]'
                            : index < currentStage
                            ? 'w-2 bg-[#30B859]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="mb-8">
                  <p className="text-gray-600 text-center">
                    Arrange these in order of importance to you, with your most important driver at the top
                  </p>
                </div>

                <div className="space-y-3">
                  {rankedDrivers.map((driver, index) => (
                    <div key={driver} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#30B859] text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg px-4 py-3 font-medium text-gray-900">
                        {driver}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveDriverUp(index)}
                          disabled={index === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveDriverDown(index)}
                          disabled={index === rankedDrivers.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="px-6 py-3 bg-[#30B859] text-white rounded-lg font-medium hover:bg-[#2AA34F] transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'analysis':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Deep Dive: Your #1 Driver</h2>
                  <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <div
                        key={s.id}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#30B859]'
                            : index < currentStage
                            ? 'w-2 bg-[#30B859]/50'
                            : 'w-2 bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 bg-gradient-to-br from-[#BADA54] to-[#30B859] text-white rounded-full mb-4">
                    <Star className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {rankedDrivers[0] || focusDriver.driver}
                  </h3>
                  <p className="text-gray-600">
                    Let's explore what this driver means to you
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What does {rankedDrivers[0] || focusDriver.driver} mean to you?
                    </label>
                    <textarea
                      value={focusDriver.meaning}
                      onChange={(e) => setFocusDriver({
                        ...focusDriver,
                        driver: rankedDrivers[0],
                        meaning: e.target.value
                      })}
                      placeholder="Describe what this driver looks like in your ideal work environment..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30B859] min-h-[120px] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why is this a driver for you?
                    </label>
                    <textarea
                      value={focusDriver.why}
                      onChange={(e) => setFocusDriver({
                        ...focusDriver,
                        why: e.target.value
                      })}
                      placeholder="Explain why this matters so much to you..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#30B859] min-h-[120px] resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 flex justify-between">
                  <button
                    onClick={handleBack}
                    className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!focusDriver.meaning || !focusDriver.why}
                    className="px-6 py-3 bg-[#30B859] text-white rounded-lg font-medium hover:bg-[#2AA34F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View Your Career Map
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'results':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Your Career Drivers Map</h2>
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
                {/* Primary Driver Highlight */}
                <div className="bg-gradient-to-br from-[#BADA54] to-[#30B859] rounded-2xl p-8 text-white">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex p-3 bg-white/20 rounded-full">
                      <Star className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">Your Primary Driver</h3>
                      <p className="text-3xl font-bold mb-4">{focusDriver.driver}</p>
                      <div className="space-y-4 text-white/90">
                        <div>
                          <p className="font-semibold mb-1">What it means to you:</p>
                          <p className="italic">"{focusDriver.meaning}"</p>
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Why it matters:</p>
                          <p className="italic">"{focusDriver.why}"</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top 6 Drivers */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Your Top 6 Career Drivers</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {rankedDrivers.map((driver, index) => {
                      // Find which section this driver belongs to
                      const driverSection = driverSections.find(section =>
                        section.drivers.some(d => d.name === driver)
                      )
                      const Icon = driverSection?.icon || Sparkles
                      
                      return (
                        <div
                          key={driver}
                          className={`flex items-center gap-3 p-4 rounded-lg ${
                            index === 0 ? 'bg-gradient-to-r from-[#BADA54]/20 to-[#30B859]/20 border-2 border-[#30B859]' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-12 h-12 ${index === 0 ? 'bg-[#30B859]' : 'bg-gray-300'} text-white rounded-full flex items-center justify-center font-bold`}>
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{driver}</p>
                            <p className="text-sm text-gray-600">{driverSection?.title}</p>
                          </div>
                          <Icon className={`w-6 h-6 ${driverSection?.textColor}`} />
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Career Conversation Guide */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex p-2 bg-green-100 rounded-lg">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Career Conversation Guide</h3>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Use these questions to have meaningful career conversations with your manager or mentor:
                  </p>
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Based on your top driver ({focusDriver.driver}):</p>
                      <p className="text-gray-600">
                        "How can we create more opportunities for {focusDriver.driver.toLowerCase()} in my current role?"
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Career alignment:</p>
                      <p className="text-gray-600">
                        "What roles or projects in our organization would best align with my drivers?"
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-1">Growth planning:</p>
                      <p className="text-gray-600">
                        "How can I develop skills that leverage my natural motivations?"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Steps */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex p-2 bg-green-100 rounded-lg">
                      <Target className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Next Steps</h3>
                  </div>
                  <ol className="space-y-3 text-gray-600">
                    <li className="flex gap-3">
                      <span className="font-bold text-green-600">1.</span>
                      <span>Schedule time with your manager to discuss your career drivers</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-green-600">2.</span>
                      <span>Identify 2-3 ways to incorporate more of your #1 driver into your work</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-green-600">3.</span>
                      <span>Research roles that align with your top drivers</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-bold text-green-600">4.</span>
                      <span>Create a development plan that leverages your motivations</span>
                    </li>
                  </ol>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">Ready to continue your career journey?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Explore More Tools
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#30B859] text-white rounded-lg hover:bg-[#2AA34F] transition-colors"
                  >
                    Start Over
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

// Import for ArrowUp and ArrowDown icons
import { ArrowUp, ArrowDown } from 'lucide-react'