'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Users, Target, Heart, Zap, TrendingUp, Shield, Trophy, Sparkles, ArrowLeft, Download, Share2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import jsPDF from 'jspdf'
import { useAnalytics } from '@/hooks/useAnalytics'
import ShareButton from '@/components/ShareButton'
import NavigationHeader from '@/components/NavigationHeader'

interface TeamData {
  teamName: string
  purpose: {
    exists: string
    outcome: string
  }
  people: Array<{ name: string; role: string }>
  values: string[]
  impact: string
  impactExplanation: string
  activities: string[]
  strengths: string[]
  weaknesses: string[]
  soloWins: string[]
  teamWins: string[]
}

const stages = [
  { id: 'intro', title: 'Team Canvas', icon: Users },
  { id: 'purpose', title: 'Purpose', icon: Target },
  { id: 'people', title: 'People & Roles', icon: Users },
  { id: 'values', title: 'Values', icon: Heart },
  { id: 'impact', title: 'Impact', icon: TrendingUp },
  { id: 'activities', title: 'Activities', icon: Zap },
  { id: 'strengths', title: 'Strengths & Assets', icon: Sparkles },
  { id: 'weaknesses', title: 'Weaknesses & Risks', icon: Shield },
  { id: 'solo-wins', title: 'Solo Wins', icon: Trophy },
  { id: 'team-wins', title: 'Team Wins', icon: Trophy },
  { id: 'results', title: 'Your Team Canvas', icon: Users }
]

const valueOptions = [
  'Collaboration', 'Innovation', 'Excellence', 'Integrity', 'Transparency',
  'Accountability', 'Growth', 'Customer Focus', 'Agility', 'Trust',
  'Diversity', 'Sustainability', 'Quality', 'Efficiency', 'Creativity',
  'Learning', 'Leadership', 'Respect', 'Communication', 'Results-Driven',
  'Empowerment', 'Balance', 'Fun', 'Impact', 'Ownership'
]

const impactOptions = [
  { id: 'revenue', label: 'Revenue Growth', icon: '💰' },
  { id: 'customer', label: 'Customer Satisfaction', icon: '😊' },
  { id: 'innovation', label: 'Product Innovation', icon: '💡' },
  { id: 'efficiency', label: 'Operational Efficiency', icon: '⚡' },
  { id: 'culture', label: 'Company Culture', icon: '🌟' },
  { id: 'market', label: 'Market Expansion', icon: '🚀' },
  { id: 'quality', label: 'Quality Improvement', icon: '✨' },
  { id: 'team', label: 'Team Development', icon: '👥' }
]

const strengthOptions = [
  'Strong communication', 'Technical expertise', 'Creative problem-solving',
  'Adaptability', 'Deep domain knowledge', 'Customer relationships',
  'Cross-functional collaboration', 'Fast execution', 'Data-driven decisions',
  'Clear vision', 'Strong leadership', 'Diverse perspectives'
]

const weaknessOptions = [
  'Limited resources', 'Knowledge gaps', 'Communication silos',
  'Technical debt', 'Process inefficiencies', 'Unclear priorities',
  'Skills shortage', 'Time constraints', 'Budget limitations',
  'Change resistance', 'Documentation gaps', 'Dependency bottlenecks'
]

const soloWinOptions = [
  'Public recognition', 'Skill development opportunities', 'Performance bonuses',
  'Career advancement', 'Flexible work arrangements', 'Personal projects',
  'Mentorship programs', 'Conference attendance', 'Certificate programs',
  'Innovation time', 'Leadership opportunities', 'Peer appreciation'
]

const teamWinOptions = [
  'Team celebrations', 'Shared bonuses', 'Team outings', 
  'Project showcases', 'Team awards', 'Success stories',
  'Milestone parties', 'Team recognition', 'Collaborative workshops',
  'Team retreats', 'Shared learning', 'Victory announcements'
]

export default function TeamCanvasTool() {
  const router = useRouter()
  const analytics = useAnalytics()
  const [currentStage, setCurrentStage] = useState(0)
  const [shareUrl, setShareUrl] = useState('')
  const [startTime] = useState(Date.now())
  const [teamData, setTeamData] = useState<TeamData>({
    teamName: '',
    purpose: { exists: '', outcome: '' },
    people: [{ name: '', role: '' }],
    values: [],
    impact: '',
    impactExplanation: '',
    activities: ['', '', ''],
    strengths: [],
    weaknesses: [],
    soloWins: [],
    teamWins: []
  })

  // Track tool start
  useEffect(() => {
    analytics.trackToolStart('Team Canvas')
  }, [])

  // Track stage progress
  useEffect(() => {
    const stage = stages[currentStage]
    const progress = ((currentStage + 1) / stages.length) * 100
    
    analytics.trackToolProgress('Team Canvas', stage.title, progress)
  }, [currentStage])

  const handleNext = () => {
    if (currentStage < stages.length - 1) {
      setCurrentStage(currentStage + 1)
    }
    
    // Track completion when reaching results
    if (currentStage === stages.length - 2) {
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      analytics.trackToolComplete('Team Canvas', {
        teamName: teamData.teamName,
        completionTime: timeSpent,
        team_size: teamData.people.filter(p => p.name.trim()).length,
        values_count: teamData.values.length,
        impact_area: teamData.impact,
        activities_count: teamData.activities.filter(a => a.trim()).length,
        strengths_count: teamData.strengths.length,
        weaknesses_count: teamData.weaknesses.length
      })
    }
  }

  const handleBack = () => {
    if (currentStage > 0) {
      setCurrentStage(currentStage - 1)
    }
  }

  const handlePersonAdd = (index: number) => {
    const updatedPeople = [...teamData.people]
    if (updatedPeople[index].name.trim()) {
      updatedPeople.push({ name: '', role: '' })
      setTeamData({ ...teamData, people: updatedPeople })
    }
  }

  const handlePersonChange = (index: number, field: 'name' | 'role', value: string) => {
    const updatedPeople = [...teamData.people]
    updatedPeople[index][field] = value
    setTeamData({ ...teamData, people: updatedPeople })
  }

  const toggleValue = (value: string) => {
    if (teamData.values.includes(value)) {
      setTeamData({ ...teamData, values: teamData.values.filter(v => v !== value) })
    } else {
      setTeamData({ ...teamData, values: [...teamData.values, value] })
    }
  }

  const toggleStrength = (strength: string) => {
    if (teamData.strengths.includes(strength)) {
      setTeamData({ ...teamData, strengths: teamData.strengths.filter(s => s !== strength) })
    } else if (teamData.strengths.length < 3) {
      setTeamData({ ...teamData, strengths: [...teamData.strengths, strength] })
    }
  }

  const toggleWeakness = (weakness: string) => {
    if (teamData.weaknesses.includes(weakness)) {
      setTeamData({ ...teamData, weaknesses: teamData.weaknesses.filter(w => w !== weakness) })
    } else if (teamData.weaknesses.length < 3) {
      setTeamData({ ...teamData, weaknesses: [...teamData.weaknesses, weakness] })
    }
  }

  const toggleSoloWin = (win: string) => {
    if (teamData.soloWins.includes(win)) {
      setTeamData({ ...teamData, soloWins: teamData.soloWins.filter(w => w !== win) })
    } else {
      setTeamData({ ...teamData, soloWins: [...teamData.soloWins, win] })
    }
  }

  const toggleTeamWin = (win: string) => {
    if (teamData.teamWins.includes(win)) {
      setTeamData({ ...teamData, teamWins: teamData.teamWins.filter(w => w !== win) })
    } else {
      setTeamData({ ...teamData, teamWins: [...teamData.teamWins, win] })
    }
  }

  const generatePDF = () => {
    // Track download event
    analytics.trackDownload('PDF', 'Team Canvas')
    
    const doc = new jsPDF()
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 20

    doc.setFontSize(24)
    doc.text(`${teamData.teamName} - Team Canvas`, 20, yPosition)
    yPosition += 20

    doc.setFontSize(16)
    doc.text('Purpose', 20, yPosition)
    yPosition += 10
    doc.setFontSize(12)
    doc.text(`Why we exist: ${teamData.purpose.exists}`, 20, yPosition)
    yPosition += 10
    doc.text(`Our most important outcome: ${teamData.purpose.outcome}`, 20, yPosition)
    yPosition += 20

    doc.setFontSize(16)
    doc.text('Team Members', 20, yPosition)
    yPosition += 10
    doc.setFontSize(12)
    teamData.people.filter(p => p.name).forEach(person => {
      doc.text(`• ${person.name} - ${person.role}`, 20, yPosition)
      yPosition += 8
    })
    yPosition += 10

    doc.setFontSize(16)
    doc.text('Core Values', 20, yPosition)
    yPosition += 10
    doc.setFontSize(12)
    doc.text(teamData.values.join(', '), 20, yPosition, { maxWidth: 170 })
    yPosition += 20

    doc.setFontSize(16)
    doc.text('Primary Impact', 20, yPosition)
    yPosition += 10
    doc.setFontSize(12)
    doc.text(`${teamData.impact}: ${teamData.impactExplanation}`, 20, yPosition, { maxWidth: 170 })
    yPosition += 20

    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = 20
    }

    doc.setFontSize(16)
    doc.text('Key Activities', 20, yPosition)
    yPosition += 10
    doc.setFontSize(12)
    teamData.activities.filter(a => a).forEach((activity, index) => {
      doc.text(`${index + 1}. ${activity}`, 20, yPosition)
      yPosition += 8
    })
    yPosition += 10

    doc.setFontSize(16)
    doc.text('Top Strengths', 20, yPosition)
    yPosition += 10
    doc.setFontSize(12)
    teamData.strengths.forEach(strength => {
      doc.text(`• ${strength}`, 20, yPosition)
      yPosition += 8
    })
    yPosition += 10

    doc.setFontSize(16)
    doc.text('Key Risks', 20, yPosition)
    yPosition += 10
    doc.setFontSize(12)
    teamData.weaknesses.forEach(weakness => {
      doc.text(`• ${weakness}`, 20, yPosition)
      yPosition += 8
    })

    doc.save(`${teamData.teamName}-team-canvas.pdf`)
  }

  const handleShare = async () => {
    const shareData = {
      type: 'team-canvas',
      data: teamData,
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
    setShareUrl(fullUrl)
    
    // Track share event
    analytics.trackShare('Team Canvas', 'link', {
      teamName: teamData.teamName,
      team_size: teamData.people.filter(p => p.name.trim()).length,
      values_count: teamData.values.length
    })
    
    return fullUrl
  }

  const renderStage = () => {
    const stage = stages[currentStage]

    switch (stage.id) {
      case 'intro':
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#FFA851] via-[#FF8FA3] to-[#EB6593] flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
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

              <div className="text-center space-y-8">
                <div className="inline-flex p-6 bg-white/20 backdrop-blur-sm rounded-full">
                  <Users className="w-20 h-20 text-white" />
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-5xl font-bold text-white">Team Canvas</h1>
                  <p className="text-xl text-white/90 max-w-xl mx-auto">
                    Map your team's composition, strengths, and opportunities for growth in a comprehensive visual framework.
                  </p>
                </div>

                <div className="space-y-4 max-w-md mx-auto">
                  <label className="block text-lg font-medium text-white/90">
                    Let's start with your team name
                  </label>
                  <input
                    type="text"
                    value={teamData.teamName}
                    onChange={(e) => setTeamData({ ...teamData, teamName: e.target.value })}
                    placeholder="Enter your team name..."
                    className="w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                  />
                </div>

                <button
                  onClick={handleNext}
                  disabled={!teamData.teamName}
                  className="px-8 py-4 bg-white text-[#FFA851] rounded-xl font-semibold text-lg hover:bg-white/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Building Your Canvas
                </button>

                <p className="text-white/70 text-sm">
                  This will take about 5-7 minutes to complete
                </p>
              </div>
            </div>
          </div>
        )

      case 'purpose':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <Target className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Define Your Purpose</h3>
                      <p className="text-gray-600">What drives your team forward?</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Why does your team exist?
                      </label>
                      <textarea
                        value={teamData.purpose.exists}
                        onChange={(e) => setTeamData({ 
                          ...teamData, 
                          purpose: { ...teamData.purpose, exists: e.target.value } 
                        })}
                        placeholder="Describe your team's reason for being..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851] min-h-[100px] resize-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        What is your most important outcome?
                      </label>
                      <textarea
                        value={teamData.purpose.outcome}
                        onChange={(e) => setTeamData({ 
                          ...teamData, 
                          purpose: { ...teamData.purpose, outcome: e.target.value } 
                        })}
                        placeholder="Describe the key result your team aims to achieve..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851] min-h-[100px] resize-none"
                      />
                    </div>
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
                    disabled={!teamData.purpose.exists || !teamData.purpose.outcome}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'people':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <Users className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">People & Roles</h3>
                      <p className="text-gray-600">List your team members and their roles</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {teamData.people.map((person, index) => (
                      <div key={index} className="flex gap-4">
                        <input
                          type="text"
                          value={person.name}
                          onChange={(e) => handlePersonChange(index, 'name', e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && person.name.trim()) {
                              handlePersonAdd(index)
                            }
                          }}
                          placeholder="Team member name..."
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851]"
                        />
                        <input
                          type="text"
                          value={person.role}
                          onChange={(e) => handlePersonChange(index, 'role', e.target.value)}
                          placeholder="Role..."
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851]"
                        />
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 text-center">
                      Press Enter after typing a name to add another team member
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
                    disabled={!teamData.people.some(p => p.name)}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'values':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <Heart className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Core Values</h3>
                      <p className="text-gray-600">What common values are at the core of your team?</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {valueOptions.map((value) => (
                      <button
                        key={value}
                        onClick={() => toggleValue(value)}
                        className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                          teamData.values.includes(value)
                            ? 'bg-[#FFA851] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>

                  {teamData.values.length > 0 && (
                    <div className="p-4 bg-[#FFA851]/10 rounded-lg">
                      <p className="text-sm text-gray-700">
                        Selected values: <span className="font-medium">{teamData.values.join(', ')}</span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Other values? (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Add any additional values..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          toggleValue(e.currentTarget.value.trim())
                          e.currentTarget.value = ''
                        }
                      }}
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
                    disabled={teamData.values.length === 0}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'impact':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Primary Impact</h3>
                      <p className="text-gray-600">What primary impact will achieving your MIO have on the company?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {impactOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTeamData({ ...teamData, impact: option.label })}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          teamData.impact === option.label
                            ? 'border-[#FFA851] bg-[#FFA851]/10'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{option.icon}</div>
                        <div className="text-sm font-medium text-gray-700">{option.label}</div>
                      </button>
                    ))}
                  </div>

                  {teamData.impact && (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Explain how your team drives {teamData.impact.toLowerCase()}:
                      </label>
                      <textarea
                        value={teamData.impactExplanation}
                        onChange={(e) => setTeamData({ ...teamData, impactExplanation: e.target.value })}
                        placeholder="Describe the specific ways your team contributes to this impact..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851] min-h-[100px] resize-none"
                      />
                    </div>
                  )}
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
                    disabled={!teamData.impact || !teamData.impactExplanation}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'activities':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <Zap className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Key Activities</h3>
                      <p className="text-gray-600">What activities will your team focus on to achieve your most important outcome?</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">List 3-5 activities in priority order:</p>
                    {teamData.activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#FFA851] flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={activity}
                          onChange={(e) => {
                            const updated = [...teamData.activities]
                            updated[index] = e.target.value
                            if (index === teamData.activities.length - 1 && e.target.value && teamData.activities.length < 5) {
                              updated.push('')
                            }
                            setTeamData({ ...teamData, activities: updated })
                          }}
                          placeholder={`Activity ${index + 1}...`}
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851]"
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
                    disabled={!teamData.activities.some(a => a)}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'strengths':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <Sparkles className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Strengths & Assets</h3>
                      <p className="text-gray-600">What are your top 3 strengths as a team?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className={`h-24 rounded-xl border-2 border-dashed flex items-center justify-center ${
                          teamData.strengths[index]
                            ? 'border-[#FFA851] bg-[#FFA851]/10'
                            : 'border-gray-300'
                        }`}
                      >
                        {teamData.strengths[index] ? (
                          <span className="text-gray-700 font-medium px-4 text-center">
                            {teamData.strengths[index]}
                          </span>
                        ) : (
                          <span className="text-gray-400">Select below</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">Click to select your team's strengths:</p>
                    <div className="flex flex-wrap gap-3">
                      {strengthOptions.map((strength) => (
                        <button
                          key={strength}
                          onClick={() => toggleStrength(strength)}
                          disabled={teamData.strengths.length >= 3 && !teamData.strengths.includes(strength)}
                          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                            teamData.strengths.includes(strength)
                              ? 'bg-[#FFA851] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {strength}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        What is your team's single biggest asset that will lead to your success?
                      </p>
                      <input
                        type="text"
                        placeholder="Explain your biggest team asset..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851]"
                      />
                    </div>
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
                    disabled={teamData.strengths.length !== 3}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'weaknesses':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <Shield className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Weaknesses & Risks</h3>
                      <p className="text-gray-600">What 3 things are the most difficult for your team?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[0, 1, 2].map((index) => (
                      <div
                        key={index}
                        className={`h-24 rounded-xl border-2 border-dashed flex items-center justify-center ${
                          teamData.weaknesses[index]
                            ? 'border-[#FFA851] bg-[#FFA851]/10'
                            : 'border-gray-300'
                        }`}
                      >
                        {teamData.weaknesses[index] ? (
                          <span className="text-gray-700 font-medium px-4 text-center">
                            {teamData.weaknesses[index]}
                          </span>
                        ) : (
                          <span className="text-gray-400">Select below</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600 text-center">Click to identify your team's challenges:</p>
                    <div className="flex flex-wrap gap-3">
                      {weaknessOptions.map((weakness) => (
                        <button
                          key={weakness}
                          onClick={() => toggleWeakness(weakness)}
                          disabled={teamData.weaknesses.length >= 3 && !teamData.weaknesses.includes(weakness)}
                          className={`px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                            teamData.weaknesses.includes(weakness)
                              ? 'bg-[#FFA851] text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {weakness}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        What are the biggest risks in achieving your most important outcome?
                      </p>
                      <input
                        type="text"
                        placeholder="Explain the key risks to watch out for..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851]"
                      />
                    </div>
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
                    disabled={teamData.weaknesses.length !== 3}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'solo-wins':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <Trophy className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Solo Wins</h3>
                      <p className="text-gray-600">How do you call out individual accomplishments?</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">Select all that apply:</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {soloWinOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleSoloWin(option)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm ${
                          teamData.soloWins.includes(option)
                            ? 'bg-[#FFA851] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Other ways you recognize individual achievements:
                    </label>
                    <input
                      type="text"
                      placeholder="Add custom recognition methods..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          toggleSoloWin(e.currentTarget.value.trim())
                          e.currentTarget.value = ''
                        }
                      }}
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
                    disabled={teamData.soloWins.length === 0}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'team-wins':
        return (
          <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="mb-8">
                <Link href="/" className="text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to tools
                </Link>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">{teamData.teamName}</h2>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm text-gray-600">
                      Step {currentStage} of {stages.length - 1}
                    </p>
                    <div className="flex items-center gap-2">
                    {stages.map((s, index) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          if (index < currentStage && index > 0) {
                            setCurrentStage(index)
                          }
                        }}
                        disabled={index > currentStage || index === 0}
                        className={`h-2 rounded-full transition-all ${
                          index === currentStage
                            ? 'w-8 bg-[#FFA851]'
                            : index < currentStage
                            ? 'w-2 bg-[#FFA851]/50 hover:bg-[#FFA851]/70 cursor-pointer'
                            : 'w-2 bg-gray-300 cursor-not-allowed'
                        }`}
                        aria-label={`Go to ${s.title}`}
                      />
                    ))}
                  </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#FFA851]/10 rounded-lg">
                      <Trophy className="w-8 h-8 text-[#FFA851]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Team Wins</h3>
                      <p className="text-gray-600">How do you celebrate team accomplishments?</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">Select all that apply:</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {teamWinOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleTeamWin(option)}
                        className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 text-sm ${
                          teamData.teamWins.includes(option)
                            ? 'bg-[#FFA851] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Other ways you celebrate together:
                    </label>
                    <input
                      type="text"
                      placeholder="Add custom celebration methods..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFA851]"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          toggleTeamWin(e.currentTarget.value.trim())
                          e.currentTarget.value = ''
                        }
                      }}
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
                    disabled={teamData.teamWins.length === 0}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg font-medium hover:bg-[#FF9741] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    View Results
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'results':
        return (
          <div className="min-h-screen bg-gray-50">
            <NavigationHeader
              backTo="/toolkit"
              backLabel="Back to Tools"
              variant="dark"
              rightActions={[
                {
                  type: 'share',
                  onClick: handleShare,
                  variant: 'secondary'
                },
                {
                  type: 'custom',
                  label: 'Download PDF',
                  onClick: generatePDF,
                  variant: 'primary'
                }
              ]}
            />
            
            <div className="max-w-4xl mx-auto p-4">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Your Team Canvas Complete!</h2>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="space-y-8">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{teamData.teamName}</h3>
                    <p className="text-lg text-gray-600">{teamData.purpose.exists}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Target className="w-5 h-5 text-[#FFA851]" />
                          Most Important Outcome
                        </h4>
                        <p className="text-gray-700 pl-7">{teamData.purpose.outcome}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <TrendingUp className="w-5 h-5 text-[#FFA851]" />
                          Primary Impact: {teamData.impact}
                        </h4>
                        <p className="text-gray-700 pl-7">{teamData.impactExplanation}</p>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Users className="w-5 h-5 text-[#FFA851]" />
                          Team Members
                        </h4>
                        <div className="space-y-1 pl-7">
                          {teamData.people.filter(p => p.name).map((person, index) => (
                            <p key={index} className="text-gray-700">
                              <span className="font-medium">{person.name}</span> - {person.role}
                            </p>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Heart className="w-5 h-5 text-[#FFA851]" />
                          Core Values
                        </h4>
                        <div className="flex flex-wrap gap-2 pl-7">
                          {teamData.values.map((value) => (
                            <span key={value} className="px-3 py-1 bg-[#FFA851]/10 text-gray-700 rounded-full text-sm">
                              {value}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Zap className="w-5 h-5 text-[#FFA851]" />
                          Key Activities
                        </h4>
                        <ol className="space-y-1 pl-7">
                          {teamData.activities.filter(a => a).map((activity, index) => (
                            <li key={index} className="text-gray-700 list-decimal list-inside">
                              {activity}
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#FFA851]" />
                          Top Strengths
                        </h4>
                        <ul className="space-y-1 pl-7">
                          {teamData.strengths.map((strength) => (
                            <li key={strength} className="text-gray-700">• {strength}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Shield className="w-5 h-5 text-[#FFA851]" />
                          Key Risks
                        </h4>
                        <ul className="space-y-1 pl-7">
                          {teamData.weaknesses.map((weakness) => (
                            <li key={weakness} className="text-gray-700">• {weakness}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                          <Trophy className="w-5 h-5 text-[#FFA851]" />
                          Recognition Methods
                        </h4>
                        <div className="space-y-2 pl-7">
                          <p className="text-sm text-gray-600">Individual: {teamData.soloWins.join(', ')}</p>
                          <p className="text-sm text-gray-600">Team: {teamData.teamWins.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-gray-600 mb-4">What's next for your team?</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Explore More Tools
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-[#FFA851] text-white rounded-lg hover:bg-[#FF9741] transition-colors"
                  >
                    Create Another Canvas
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