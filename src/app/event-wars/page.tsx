'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import ToolNavigationWrapper from '@/components/ToolNavigationWrapper'
import { ChevronLeft, Upload, Trophy, Users, Zap, Brain, Target } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Attendee {
  firstName: string
  lastName: string
  company: string
  currentJob: string
  employeeCount: string
  industry: string
  companyType: string
  headline: string
  location: string
}

interface MatchResult {
  winner: Attendee
  loser: Attendee
  winnerIndex: number
}

interface AttendeeStats {
  attendee: Attendee
  wins: number
  losses: number
  comparisons: Set<string> // Set of attendee IDs they've been compared against
  eloRating: number
  confidence: number // 0-1, how confident we are in their ranking
}

export default function EventWarsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [attendees, setAttendees] = useState<Attendee[]>([])
  const [attendeeStats, setAttendeeStats] = useState<Map<string, AttendeeStats>>(new Map())
  const [currentMatch, setCurrentMatch] = useState<[Attendee, Attendee] | null>(null)
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>([])
  const [stage, setStage] = useState<'upload' | 'battle' | 'results'>('upload')
  const [roundCount, setRoundCount] = useState(0)
  const [showInstructions, setShowInstructions] = useState(true)
  const [comparisonMode, setComparisonMode] = useState<'explore' | 'refine'>('explore')

  // Get attendee ID
  const getAttendeeId = (attendee: Attendee) => `${attendee.firstName} ${attendee.lastName}`

  // Initialize stats for all attendees
  const initializeStats = (attendeeList: Attendee[]) => {
    const stats = new Map<string, AttendeeStats>()
    attendeeList.forEach(attendee => {
      const id = getAttendeeId(attendee)
      stats.set(id, {
        attendee,
        wins: 0,
        losses: 0,
        comparisons: new Set(),
        eloRating: 1000, // Standard starting ELO
        confidence: 0
      })
    })
    setAttendeeStats(stats)
  }


  // Calculate confidence based on number of comparisons and consistency
  const calculateConfidence = (stats: AttendeeStats) => {
    const totalGames = stats.wins + stats.losses
    if (totalGames === 0) return 0
    
    // Base confidence on number of comparisons (diminishing returns)
    const comparisonFactor = Math.min(stats.comparisons.size / 10, 1) * 0.7
    
    // Consistency factor - are they winning/losing consistently?
    const winRate = stats.wins / totalGames
    const consistencyFactor = (Math.abs(winRate - 0.5) * 2) * 0.3 // More consistent = higher confidence
    
    return Math.min(comparisonFactor + consistencyFactor, 1)
  }

  // Get the most valuable next comparison
  const getNextMatch = (): [Attendee, Attendee] | null => {
    const statsArray = Array.from(attendeeStats.values())
    if (statsArray.length < 2) return null

    // Maximum times someone should appear (based on total attendees)
    const maxAppearances = Math.ceil(attendees.length * 0.3) // ~30% of total attendees
    
    // Filter out people who've appeared too many times
    const eligibleStats = statsArray.filter(s => (s.wins + s.losses) < maxAppearances)
    
    // If everyone has hit the max, use everyone but penalize high-appearance people
    const workingStats = eligibleStats.length >= 2 ? eligibleStats : statsArray

    // In explore mode (early rounds), ensure everyone gets compared
    if (comparisonMode === 'explore') {
      // Find person with fewest comparisons among eligible
      const leastCompared = workingStats.sort((a, b) => a.comparisons.size - b.comparisons.size)[0]
      
      // Find someone they haven't been compared with yet
      const candidates = workingStats.filter(s => {
        const id = getAttendeeId(s.attendee)
        return id !== getAttendeeId(leastCompared.attendee) && !leastCompared.comparisons.has(id)
      })
      
      if (candidates.length > 0) {
        // Prefer someone with similar number of comparisons
        candidates.sort((a, b) => Math.abs(a.comparisons.size - leastCompared.comparisons.size) - 
                                  Math.abs(b.comparisons.size - leastCompared.comparisons.size))
        return [leastCompared.attendee, candidates[0].attendee]
      }
    }

    // In refine mode or when explore mode can't find new pairs
    // Focus on comparing people with similar ELO ratings
    workingStats.sort((a, b) => b.eloRating - a.eloRating)
    
    let bestPair: [Attendee, Attendee] | null = null
    let bestValue = -1
    
    for (let i = 0; i < workingStats.length - 1; i++) {
      for (let j = i + 1; j < Math.min(i + 10, workingStats.length); j++) {
        const a = workingStats[i]
        const b = workingStats[j]
        const aId = getAttendeeId(a.attendee)
        const bId = getAttendeeId(b.attendee)
        
        // Skip if already compared recently
        if (a.comparisons.has(bId) && a.comparisons.size > 5) continue
        
        // Calculate appearances penalty (reduce value for people who've appeared a lot)
        const aAppearances = a.wins + a.losses
        const bAppearances = b.wins + b.losses
        const appearancePenalty = Math.max(0.1, 1 - ((aAppearances + bAppearances) / (maxAppearances * 4)))
        
        // Value of this comparison
        const ratingDiff = Math.abs(a.eloRating - b.eloRating)
        const uncertaintyValue = (1 - a.confidence) + (1 - b.confidence)
        const proximitryValue = ratingDiff < 200 ? 2 : ratingDiff < 400 ? 1 : 0.5
        
        // Apply appearance penalty to reduce value for overused people
        const value = uncertaintyValue * proximitryValue * appearancePenalty
        
        if (value > bestValue) {
          bestValue = value
          bestPair = [a.attendee, b.attendee]
        }
      }
    }
    
    // If we can't find a good pair, pick from least-used people
    if (!bestPair) {
      const leastUsed = workingStats.sort((a, b) => 
        (a.wins + a.losses) - (b.wins + b.losses)
      ).slice(0, 20) // Get 20 least-used people
      
      const idx1 = Math.floor(Math.random() * leastUsed.length)
      let idx2 = Math.floor(Math.random() * leastUsed.length)
      while (idx2 === idx1) {
        idx2 = Math.floor(Math.random() * leastUsed.length)
      }
      bestPair = [leastUsed[idx1].attendee, leastUsed[idx2].attendee]
    }
    
    return bestPair
  }

  // Calculate ranking confidence
  const getRankingConfidence = () => {
    const statsArray = Array.from(attendeeStats.values())
    const avgConfidence = statsArray.reduce((sum, s) => sum + s.confidence, 0) / statsArray.length
    const avgComparisons = statsArray.reduce((sum, s) => sum + s.comparisons.size, 0) / statsArray.length
    
    return {
      overall: avgConfidence,
      coverage: Math.min(avgComparisons / (statsArray.length * 0.1), 1), // How well connected the comparison graph is
      fullRankingConfidence: avgConfidence // Confidence for all attendees
    }
  }

  // Check if we should switch modes
  useEffect(() => {
    if (roundCount > attendees.length && comparisonMode === 'explore') {
      setComparisonMode('refine')
    }
  }, [roundCount, attendees.length, comparisonMode])

  // Calculate if we have enough data for full ranking
  const hasEnoughData = () => {
    const confidence = getRankingConfidence()
    // Need either high overall confidence or minimum rounds
    return confidence.fullRankingConfidence > 0.6 || roundCount >= attendees.length * 1.5
  }

  // Handle CSV upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        console.log(`Processing ${lines.length} lines from CSV`)
        
        // Skip header and parse data
        const parsedAttendees: Attendee[] = []
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
          if (values.length >= 9) {
            parsedAttendees.push({
              firstName: values[0],
              lastName: values[1],
              company: values[2],
              currentJob: values[3],
              employeeCount: values[4],
              industry: values[5],
              companyType: values[6],
              headline: values[7],
              location: values[8]
            })
          }
        }
        
        console.log(`Parsed ${parsedAttendees.length} attendees`)
        
        if (parsedAttendees.length === 0) {
          alert('No valid attendees found in the CSV file. Please check the format.')
          return
        }
        
        if (parsedAttendees.length < 2) {
          alert('Need at least 2 attendees to start the tournament.')
          return
        }
        
        setAttendees(parsedAttendees)
        initializeStats(parsedAttendees)
        setStage('battle')
        // Generate first match with simple random selection
        const index1 = Math.floor(Math.random() * parsedAttendees.length)
        let index2 = Math.floor(Math.random() * parsedAttendees.length)
        while (index2 === index1) {
          index2 = Math.floor(Math.random() * parsedAttendees.length)
        }
        setCurrentMatch([parsedAttendees[index1], parsedAttendees[index2]])
      } catch (error) {
        console.error('Error parsing CSV:', error)
        alert('Error parsing CSV file. Please check the format.')
      }
    }
    
    reader.onerror = () => {
      alert('Error reading file')
    }
    
    reader.readAsText(file)
  }

  // Generate a new match using smart algorithm
  const generateNewMatch = () => {
    const nextMatch = getNextMatch()
    if (nextMatch) {
      setCurrentMatch(nextMatch)
    }
  }

  // Handle match selection
  const handleSelection = useCallback((winnerIndex: 0 | 1) => {
    if (!currentMatch) return

    const winner = currentMatch[winnerIndex]
    const loser = currentMatch[winnerIndex === 0 ? 1 : 0]
    const winnerId = getAttendeeId(winner)
    const loserId = getAttendeeId(loser)
    
    // Update match history
    setMatchHistory(prev => [...prev, { winner, loser, winnerIndex }])
    
    // Get current stats for ELO calculation
    const currentWinnerStats = attendeeStats.get(winnerId)!
    const currentLoserStats = attendeeStats.get(loserId)!
    
    // Update ELO ratings
    const K = 32 // ELO K-factor
    const expectedWinner = 1 / (1 + Math.pow(10, (currentLoserStats.eloRating - currentWinnerStats.eloRating) / 400))
    const expectedLoser = 1 - expectedWinner
    const newWinnerRating = currentWinnerStats.eloRating + K * (1 - expectedWinner)
    const newLoserRating = currentLoserStats.eloRating + K * (0 - expectedLoser)
    
    // Update stats
    setAttendeeStats(prev => {
      const newStats = new Map(prev)
      
      // Update winner stats
      const winnerStats = newStats.get(winnerId)!
      winnerStats.wins += 1
      winnerStats.comparisons.add(loserId)
      winnerStats.eloRating = newWinnerRating
      winnerStats.confidence = calculateConfidence(winnerStats)
      
      // Update loser stats
      const loserStats = newStats.get(loserId)!
      loserStats.losses += 1
      loserStats.comparisons.add(winnerId)
      loserStats.eloRating = newLoserRating
      loserStats.confidence = calculateConfidence(loserStats)
      
      return newStats
    })
    
    setRoundCount(prev => prev + 1)
    setShowInstructions(false)
    
    // Generate next match after state updates
    setTimeout(() => {
      generateNewMatch()
    }, 50)
  }, [currentMatch, attendeeStats])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (stage !== 'battle' || !currentMatch) return
      
      if (e.key === '1') {
        e.preventDefault()
        handleSelection(0)
      } else if (e.key === '2') {
        e.preventDefault()
        handleSelection(1)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [stage, currentMatch, handleSelection])

  // Get all attendees sorted by ELO rating
  const getAllAttendeesSorted = () => {
    const statsArray = Array.from(attendeeStats.values())
    return statsArray
      .sort((a, b) => b.eloRating - a.eloRating)
      .map(stats => ({
        attendee: stats.attendee,
        wins: stats.wins,
        losses: stats.losses,
        eloRating: Math.round(stats.eloRating),
        confidence: stats.confidence,
        winRate: stats.wins + stats.losses > 0 ? stats.wins / (stats.wins + stats.losses) : 0
      }))
  }

  const renderAttendeeCard = (attendee: Attendee, index: number) => {
    const attendeeId = getAttendeeId(attendee)
    const stats = attendeeStats.get(attendeeId)
    const appearances = stats ? stats.wins + stats.losses : 0
    const maxAppearances = Math.ceil(attendees.length * 0.3)
    
    return (
      <div className="flex-1 p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer transform hover:scale-[1.02]"
           onClick={() => stage === 'battle' && handleSelection(index as 0 | 1)}>
        <div className="flex items-center justify-between mb-4">
          <div className="text-4xl font-bold text-[#BF4C74]">{index + 1}</div>
          <div className="flex items-center gap-2">
            {appearances > maxAppearances * 0.8 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                {appearances} matches
              </span>
            )}
            <div className="text-sm text-gray-500">{attendee.companyType}</div>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-1">
          {attendee.firstName} {attendee.lastName}
        </h3>
        <p className="text-lg font-semibold text-[#BF4C74] mb-3">{attendee.currentJob}</p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-600">Company:</span>
            <span className="text-gray-800">{attendee.company}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-600">Industry:</span>
            <span className="text-gray-800">{attendee.industry}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-600">Size:</span>
            <span className="text-gray-800">{attendee.employeeCount} employees</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-gray-600">Location:</span>
            <span className="text-gray-800">{attendee.location}</span>
          </div>
        </div>
        
        {attendee.headline && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm italic text-gray-700">"{attendee.headline}"</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <ViewportContainer>
      <ToolNavigationWrapper />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Event Wars</h1>
          <p className="text-xl text-gray-600">Tournament-style attendee prioritization</p>
        </div>

        {/* Upload Stage */}
        {stage === 'upload' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <Upload className="w-16 h-16 text-[#BF4C74] mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Guest List</h2>
                <p className="text-gray-600">Upload a CSV file with attendee information to start the tournament</p>
              </div>
              
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700 font-medium mb-2">Required CSV columns:</p>
                <p className="text-sm text-gray-600">
                  First Name, Last Name, Company Name, Current Job, Emp. Count, 
                  Company Industry, Company Type, Profile Headline, Location
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 bg-[#BF4C74] text-white rounded-lg font-semibold hover:bg-[#A63D5F] transition-colors"
              >
                Choose CSV File
              </button>
              
              <div className="mt-4 text-center">
                <button
                  onClick={() => {
                    // Generate sample CSV
                    const sampleCSV = `First Name,Last Name,Company Name,Current Job,Emp. Count,Company Industry,Company Type,Profile Headline,Location
John,Doe,Tech Corp,CTO,500,Technology,Public Company,Innovation Leader,"San Francisco, CA"
Jane,Smith,StartupXYZ,VP Engineering,50,Software,Privately Held,Building the Future,"Austin, TX"
Mike,Johnson,BigCo Inc,Director of Product,1000,Finance,Public Company,Product Visionary,"New York, NY"
Sarah,Williams,Design Studio,Creative Director,25,Design,Privately Held,Design Thinking Expert,"Los Angeles, CA"
Tom,Brown,DataCo,Data Scientist,200,Analytics,Privately Held,ML Pioneer,"Seattle, WA"`
                    
                    const blob = new Blob([sampleCSV], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'sample-event-attendees.csv'
                    a.click()
                  }}
                  className="text-sm text-[#BF4C74] underline hover:no-underline"
                >
                  Download Sample CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Battle Stage */}
        {stage === 'battle' && currentMatch && (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium">Round {roundCount + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">{attendees.length} Attendees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-500" />
                    <span className="font-medium">Mode: {comparisonMode === 'explore' ? 'Exploring' : 'Refining'}</span>
                  </div>
                </div>
              
                {hasEnoughData() && (
                  <button
                    onClick={() => setStage('results')}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                  >
                    View Full Rankings
                  </button>
                )}
              </div>
              
              {/* Confidence Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Overall Ranking Confidence</span>
                  <span className="font-medium">{Math.round(getRankingConfidence().fullRankingConfidence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${getRankingConfidence().fullRankingConfidence * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {comparisonMode === 'explore' 
                    ? 'Ensuring everyone gets compared...' 
                    : 'Refining rankings near the cutoff...'}
                </p>
              </div>
            </div>

            {/* Instructions */}
            {showInstructions && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800">
                  Click on a card or press <kbd className="px-2 py-1 bg-white rounded">1</kbd> or <kbd className="px-2 py-1 bg-white rounded">2</kbd> to select your preferred attendee
                </p>
              </div>
            )}

            {/* Match Cards */}
            <div className="flex gap-6">
              {renderAttendeeCard(currentMatch[0], 0)}
              <div className="flex items-center justify-center px-4">
                <span className="text-3xl font-bold text-gray-400">VS</span>
              </div>
              {renderAttendeeCard(currentMatch[1], 1)}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <button
                onClick={() => generateNewMatch()}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Skip Match
              </button>
              <button
                onClick={() => {
                  setStage('upload')
                  setAttendees([])
                  setMatchHistory([])
                  setAttendeeStats(new Map())
                  setRoundCount(0)
                  setComparisonMode('explore')
                }}
                className="px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Results Stage */}
        {stage === 'results' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Full Event Attendee Rankings</h2>
              <p className="text-center text-gray-600 mb-8">All {attendees.length} attendees ranked by preference</p>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {getAllAttendeesSorted().map((item, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="text-2xl font-bold text-[#BF4C74] w-12">#{index + 1}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {item.attendee.firstName} {item.attendee.lastName}
                      </h3>
                      <p className="text-gray-600">
                        {item.attendee.currentJob} at {item.attendee.company}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.attendee.industry} • {item.attendee.location}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xl font-bold text-purple-600">{item.eloRating}</div>
                          <div className="text-xs text-gray-500">rating</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-green-600">{item.wins}-{item.losses}</div>
                          <div className="text-xs text-gray-500">record</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">Confidence:</div>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${item.confidence * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{Math.round(item.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-center gap-4">
                <button
                  onClick={() => {
                    setStage('battle')
                    generateNewMatch()
                  }}
                  className="px-6 py-3 bg-[#BF4C74] text-white rounded-lg font-semibold hover:bg-[#A63D5F] transition-colors"
                >
                  Continue Playing
                </button>
                <button
                  onClick={() => {
                    const fullList = getAllAttendeesSorted()
                    const csvContent = [
                      'Rank,First Name,Last Name,Company,Job Title,Industry,Location,ELO Rating,Wins,Losses,Win Rate,Confidence',
                      ...fullList.map((item, i) => 
                        `${i + 1},${item.attendee.firstName},${item.attendee.lastName},${item.attendee.company},${item.attendee.currentJob},${item.attendee.industry},${item.attendee.location},${item.eloRating},${item.wins},${item.losses},${Math.round(item.winRate * 100)}%,${Math.round(item.confidence * 100)}%`
                      )
                    ].join('\n')
                    
                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'event-wars-full-rankings.csv'
                    a.click()
                  }}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Download Full Rankings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </ViewportContainer>
  )
}