'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ArrowRight, Printer, Download, Share2, Clock, MessageSquare, Heart, User, Target, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import Footer from '@/components/Footer'
import { toolConfigs } from '@/lib/toolConfigs'
import { UserGuideData, generateShareableGuide } from '@/lib/userGuideHelpers'
import ShareButton from '@/components/ShareButton'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useEmailCapture } from '@/hooks/useEmailCapture'
import { validateEmail, validateEmailRealtime, EmailValidationResult } from '@/utils/emailValidation'
import ToolNavigation from '@/components/ToolNavigation'

const sections = [
  { id: 'working-conditions', title: 'Working Conditions', icon: Clock },
  { id: 'hours', title: 'Hours of Operation', icon: Clock },
  { id: 'communication', title: 'Communication', icon: MessageSquare },
  { id: 'feedback', title: 'Feedback', icon: Target },
  { id: 'needs', title: 'My Biggest Needs', icon: Heart },
  { id: 'struggles', title: 'Personal Struggles', icon: Lightbulb },
  { id: 'love', title: 'Things I Love', icon: Heart },
  { id: 'about', title: 'Other Things About Me', icon: User },
]

export default function UserGuidePage() {
  const analytics = useAnalytics()
  const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
  const [showIntro, setShowIntro] = useState(true)
  const [showNameInput, setShowNameInput] = useState(false)
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ isValid: true })
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [startTime] = useState(Date.now())
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set())
  const [userData, setUserData] = useState<UserGuideData>({
    name: '',
    workingConditions: '',
    hoursOfOperation: {
      early: false,
      morning: false,
      afternoon: false,
      evening: false,
      late: false,
      weekends: false,
    },
    shareHours: '',
    communicationMethods: {
      inPerson: false,
      call: false,
      text: false,
      zoom: false,
      slack: false,
    },
    responseExpectations: '',
    meetingPreferences: '',
    feedbackPreferences: '',
    biggestNeeds: '',
    personalStruggles: '',
    thingsILove: ['', '', '', '', ''],
    thingsAboutMe: '',
  })
  
  const config = toolConfigs.workingWithMe
  const currentSection = sections[currentSectionIndex]
  const progress = ((currentSectionIndex + 1) / sections.length) * 100

  // Track tool start
  useEffect(() => {
    analytics.trackToolStart('Working With Me')
  }, [])

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

  // Track progress
  useEffect(() => {
    if (!showIntro && !showNameInput && !showResults) {
      analytics.trackToolProgress('Working With Me', currentSection.title, progress)
    }
  }, [currentSectionIndex, showIntro, showNameInput, showResults])
  
  const handleNext = () => {
    // Mark current section as completed
    setCompletedSections(prev => new Set([...prev, currentSectionIndex]))
    
    if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1)
    } else {
      // Track completion
      const timeSpent = Math.round((Date.now() - startTime) / 1000)
      analytics.trackToolComplete('Working With Me', {
        userName: userData.name,
        completionTime: timeSpent,
        sections_completed: sections.length
      })
      setShowResults(true)
    }
  }
  
  const handlePrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1)
    } else if (currentSectionIndex === 0) {
      // Go back to name input
      setShowNameInput(true)
    }
  }

  const handleShare = async () => {
    const guide = generateShareableGuide(userData)
    
    const shareData = {
      type: 'user-guide',
      toolName: 'Working With Me',
      results: {
        userData,
        guide
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
    
    // Track share event
    analytics.trackShare('Working With Me', 'link', {
      userName: userData.name
    })
    
    return fullUrl
  }
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Enter key for starting on intro
      if (e.key === 'Enter' && showIntro && emailValidation.isValid && userEmail) {
        const finalValidation = validateEmail(userEmail)
        setEmailValidation(finalValidation)
        
        if (!finalValidation.isValid) {
          setShowSuggestion(!!finalValidation.suggestion)
          return
        }
        
        if (userEmail) {
          captureEmailForTool(userEmail, 'Working With Me', 'wwm');
        }
        setShowIntro(false)
        setShowNameInput(true)
      }
      
      // Enter key for continuing from name input
      if (e.key === 'Enter' && showNameInput && userData.name.trim()) {
        setShowNameInput(false)
      }
      
      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && !showIntro && !showNameInput && !showResults && currentSectionIndex > 0) {
        handlePrevious()
      }
      
      if (e.key === 'ArrowRight' && !showIntro && !showNameInput && !showResults) {
        handleNext()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [showIntro, showNameInput, showResults, currentSectionIndex, emailValidation, userEmail, userData.name, captureEmailForTool])
  

  // Intro Screen
  if (showIntro) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#30C7C7] to-[#2A74B9] flex flex-col items-center justify-center p-4">
        <ToolNavigation />
        
        <div className="text-center text-white mb-12 max-w-3xl">
          <div className="inline-flex p-4 sm:p-6 bg-white/20 backdrop-blur-sm rounded-full mb-8">
            <Lightbulb className="w-12 h-12 sm:w-20 sm:h-20 text-white" />
          </div>
          <h1 className="text-5xl font-bold mb-6">{config.title}</h1>
          <h2 className="text-3xl mb-8">{config.subtitle}</h2>
          <p className="text-xl text-white/90 leading-relaxed">
            Help your colleagues understand how to work with you best. Share your preferences, 
            communication style, and what makes you tick. Because great collaboration starts 
            with understanding each other.
          </p>
        </div>
        
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl w-full">
          <div className="space-y-4">
            <label className="block text-lg font-medium text-white/90">
              What's your email?
            </label>
            <div className="relative">
              <input
                type="email"
                value={userEmail}
                onChange={handleEmailChange}
                placeholder="you@company.com"
                className={`w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg ${
                  emailValidation.isValid ? 'border-white/30' : 'border-red-300/50'
                }`}
                autoComplete="email"
              />
            </div>
            
            {!emailValidation.isValid && emailValidation.error && (
              <div className="text-sm text-red-200 mt-1">
                {emailValidation.error}
              </div>
            )}
            
            {showSuggestion && emailValidation.suggestion && (
              <button
                type="button"
                onClick={handleSuggestionClick}
                className="text-sm text-white/80 hover:text-white mt-1 underline"
              >
                Use suggested email: {emailValidation.suggestion}
              </button>
            )}
            
            {hasStoredEmail && (
              <p className="text-white/70 text-sm text-center">
                Welcome back! We've pre-filled your email.
              </p>
            )}
          </div>
          
          <button
            onClick={async () => {
              const finalValidation = validateEmail(userEmail)
              setEmailValidation(finalValidation)
              
              if (!finalValidation.isValid) {
                setShowSuggestion(!!finalValidation.suggestion)
                return
              }
              
              if (userEmail) {
                await captureEmailForTool(userEmail, 'Working With Me', 'wwm');
              }
              setShowIntro(false);
              setShowNameInput(true);
            }}
            disabled={!emailValidation.isValid || !userEmail}
            className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
              emailValidation.isValid && userEmail
                ? 'bg-white text-[#2A74B9] hover:bg-white/90'
                : 'bg-white/50 text-[#2A74B9]/50 cursor-not-allowed'
            }`}
          >
            <span className="sm:hidden">Start Guide</span>
            <span className="hidden sm:inline">Build My User Guide</span>
          </button>
          
          <p className="text-white/70 text-sm text-center">
            This will take about 5-7 minutes to complete
          </p>
        </div>
      </div>
    )
  }

  // Name Input Screen
  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#30C7C7] via-[#4DA0E0] to-[#2A74B9] flex flex-col items-center justify-center p-4">
        <ToolNavigation />
        
        <div className="max-w-2xl w-full">
          <button
            onClick={() => {
              setShowNameInput(false);
              setShowIntro(true);
            }}
            className="text-white/80 hover:text-white flex items-center gap-2 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white text-center mb-6">Let's start with your name</h3>
            
            <div className="space-y-6">
              <p className="text-xl text-white/90 text-center">
                What should people call you?
              </p>
              
              <input
                type="text"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userData.name.trim()) {
                    setShowNameInput(false);
                  }
                }}
                placeholder="Enter your full name..."
                className="w-full px-6 py-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 text-lg"
                autoFocus
              />
              
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                <p className="text-sm text-white/90">
                  💡 Tip: Include your full name since multiple people may create user guides
                </p>
              </div>
              
              <button
                onClick={() => setShowNameInput(false)}
                disabled={!userData.name.trim()}
                className={`w-full py-4 rounded-xl font-semibold text-lg uppercase transition-colors ${
                  userData.name.trim()
                    ? 'bg-white text-[#2A74B9] hover:bg-white/90'
                    : 'bg-white/50 text-[#2A74B9]/50 cursor-not-allowed'
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

  // Results Screen
  if (showResults) {
    const guide = generateShareableGuide(userData)
    
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
        <div className="min-h-screen bg-white sm:bg-gradient-to-br sm:from-[#30C7C7]/10 sm:via-[#5D9DD9]/10 sm:to-[#2A74B9]/10 py-16 print-section">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-8 no-print">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setCurrentSectionIndex(sections.length - 1)
                  }}
                  className="text-[#2A74B9] hover:text-[#215A91] flex items-center gap-2 font-medium text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="uppercase tracking-wider">Back</span>
                </button>
                <div className="flex gap-2 sm:gap-4">
                  <button
                    onClick={() => window.print()}
                    className="hidden sm:block p-2.5 sm:p-3 border-2 border-[#2A74B9]/50 text-[#2A74B9] rounded-lg hover:border-[#2A74B9] hover:bg-[#2A74B9]/10 transition-all"
                    title="Print guide"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <ShareButton
                    onShare={handleShare}
                    className="px-3 sm:px-6 py-2.5 bg-[#2A74B9] hover:bg-[#215A91] text-white rounded-lg font-semibold transition-colors"
                  >
                    <Share2 className="w-5 h-5 inline sm:hidden" />
                    <span className="hidden sm:inline uppercase tracking-wider">Share</span>
                  </ShareButton>
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-nightfall mb-8 text-center">{guide.title}</h1>
              
              <div className="space-y-6">
                {guide.sections.map((section, index) => (
                  <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-xl font-semibold text-nightfall mb-3">{section.title}</h3>
                    <p className="text-gray-700 whitespace-pre-line">{section.content}</p>
                  </div>
                ))}
              </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 no-print">
              <Link
                href="/"
                className="text-[#2A74B9] hover:text-[#215A91] transition-colors font-medium"
              >
                Explore all Tools
              </Link>
              <button
                onClick={() => {
                  setShowResults(false)
                  setCurrentSectionIndex(0)
                  setShowIntro(true)
                  // Reset data if needed
                }}
                className="px-8 py-3 bg-[#2A74B9] text-white rounded-lg font-semibold hover:bg-[#215A91] transition-colors shadow-lg"
              >
                CREATE ANOTHER GUIDE
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      </>
    )
  }

  // Section Screens
  const renderSection = () => {
    switch (currentSection.id) {
      case 'working-conditions':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-nightfall text-center mb-2">Working Conditions</h2>
            <p className="text-gray-600 text-center mb-6">Help others understand your ideal work environment</p>
            
            <textarea
              value={userData.workingConditions}
              autoFocus
              onChange={(e) => setUserData({...userData, workingConditions: e.target.value})}
              placeholder="Explain your ideal working conditions. For example: 'I do my best work in a quiet environment with minimal interruptions' or 'I thrive in collaborative spaces with background energy'"
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] text-base min-h-[150px] resize-y placeholder-gray-500"
            />
          </div>
        )
        
      case 'hours':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-nightfall text-center mb-2">Hours of Operation</h2>
            <p className="text-gray-600 text-center mb-6">When are you at your best?</p>
            
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'early', label: 'Early bird (before 8am)' },
                { key: 'morning', label: 'Morning (8am-12pm)' },
                { key: 'afternoon', label: 'Afternoon (12pm-5pm)' },
                { key: 'evening', label: 'Evening (5pm-8pm)' },
                { key: 'late', label: 'Night owl (after 8pm)' },
                { key: 'weekends', label: 'Weekends' },
              ].map(({ key, label }, index) => (
                <button
                  key={key}
                  onClick={() => setUserData({
                    ...userData,
                    hoursOfOperation: {
                      ...userData.hoursOfOperation,
                      [key]: !userData.hoursOfOperation[key as keyof typeof userData.hoursOfOperation]
                    }
                  })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    userData.hoursOfOperation[key as keyof typeof userData.hoursOfOperation]
                      ? 'border-[#2A74B9] bg-[#2A74B9]/10 text-[#2A74B9]'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            
            <textarea
              value={userData.shareHours}
              onChange={(e) => setUserData({...userData, shareHours: e.target.value})}
              placeholder="Share more about your hours. For example: 'My hours vary but I protect my mornings for deep work'"
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] text-base min-h-[100px] resize-y placeholder-gray-500"
            />
          </div>
        )
        
      case 'communication':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-nightfall text-center mb-2">Communication</h2>
            <p className="text-gray-600 text-center mb-6">How do you prefer to communicate?</p>
            
            <div>
              <p className="text-sm text-gray-600 mb-3">Methods I prefer:</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'inPerson', label: 'In-person' },
                  { key: 'call', label: 'Phone call' },
                  { key: 'text', label: 'Text' },
                  { key: 'zoom', label: 'Video call' },
                  { key: 'slack', label: 'Slack/Chat' },
                ].map(({ key, label }, index) => (
                  <button
                    key={key}
                      onClick={() => setUserData({
                      ...userData,
                      communicationMethods: {
                        ...userData.communicationMethods,
                        [key]: !userData.communicationMethods[key as keyof typeof userData.communicationMethods]
                      }
                    })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      userData.communicationMethods[key as keyof typeof userData.communicationMethods]
                        ? 'border-[#2A74B9] bg-[#2A74B9]/10 text-[#2A74B9]'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Response times I can commit to:</label>
              <input
                type="text"
                value={userData.responseExpectations}
                onChange={(e) => setUserData({...userData, responseExpectations: e.target.value})}
                placeholder="e.g., Within 24 hours for emails, 2 hours for urgent Slack messages"
                className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] placeholder-gray-500"
              />
            </div>
            
            <div>
              <label className="text-sm text-gray-600">Meetings:</label>
              <input
                type="text"
                value={userData.meetingPreferences}
                onChange={(e) => setUserData({...userData, meetingPreferences: e.target.value})}
                placeholder="e.g., I prefer agendas sent 24 hours in advance"
                className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] placeholder-gray-500"
              />
            </div>
          </div>
        )
        
      case 'feedback':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-nightfall text-center mb-2">Feedback</h2>
            <p className="text-gray-600 text-center mb-6">How do you like to be recognized and receive feedback?</p>
            
            <textarea
              value={userData.feedbackPreferences}
              onChange={(e) => setUserData({...userData, feedbackPreferences: e.target.value})}
              placeholder="Share how you prefer to receive recognition and constructive feedback. For example: 'I appreciate specific examples in feedback' or 'I prefer private recognition over public praise'"
              autoFocus
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] text-base min-h-[150px] resize-y placeholder-gray-500"
            />
            
            <p className="text-sm text-gray-500 text-center">
              How do you know when you're not meeting expectations?
            </p>
          </div>
        )
        
      case 'needs':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-nightfall text-center mb-2">My Biggest Needs</h2>
            <p className="text-gray-600 text-center mb-6">What do you need to do your best work?</p>
            
            <textarea
              value={userData.biggestNeeds}
              onChange={(e) => setUserData({...userData, biggestNeeds: e.target.value})}
              placeholder="Share what you need most to thrive. For example: 'Clear expectations and autonomy to execute' or 'Regular check-ins and collaborative brainstorming'"
              autoFocus
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] text-base min-h-[150px] resize-y placeholder-gray-500"
            />
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Examples: Clear priorities • Regular feedback • Quiet time to focus • Team collaboration
              </p>
            </div>
          </div>
        )
        
      case 'struggles':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-nightfall text-center mb-2">Personal Struggles</h2>
            <p className="text-gray-600 text-center mb-6">What challenges do you face? (Sharing helps others support you)</p>
            
            <textarea
              value={userData.personalStruggles}
              onChange={(e) => setUserData({...userData, personalStruggles: e.target.value})}
              placeholder="Share what you find challenging. For example: 'I can be a perfectionist which sometimes slows me down' or 'I tend to take on too much and need help prioritizing'"
              autoFocus
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] text-base min-h-[150px] resize-y placeholder-gray-500"
            />
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-800">
                Examples: Saying no • Asking for help • Time management • Public speaking
              </p>
            </div>
          </div>
        )
        
      case 'love':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-nightfall text-center mb-2">Things I Love</h2>
            <p className="text-gray-600 text-center mb-6">Top 5 things you're passionate about (work or personal)</p>
            
            {userData.thingsILove.map((item, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 bg-[#2A74B9] text-white rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newThings = [...userData.thingsILove]
                    newThings[index] = e.target.value
                    setUserData({...userData, thingsILove: newThings})
                  }}
                  placeholder={`Thing #${index + 1} I love...`}
                  className="flex-1 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] placeholder-gray-500"
                />
              </div>
            ))}
          </div>
        )
        
      case 'about':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-nightfall text-center mb-2">Other Things About Me</h2>
            <p className="text-gray-600 text-center mb-6">Anything else your colleagues should know?</p>
            
            <textarea
              value={userData.thingsAboutMe}
              onChange={(e) => setUserData({...userData, thingsAboutMe: e.target.value})}
              placeholder="Share anything else that helps people understand you better. Hobbies, fun facts, pet peeves, superpowers..."
              autoFocus
              className="w-full p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A74B9] text-base min-h-[150px] resize-y placeholder-gray-500"
            />
            
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                💡 Optional ideas: Favorite coffee order • Hidden talents • Weekend activities • Bucket list items
              </p>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }

  // Main Form Screen
  if (!showIntro && !showNameInput && !showResults) {
    return (
    <div className="min-h-screen bg-gray-50 p-4" data-bg style={{WebkitBackgroundClip: 'border-box'}}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => setShowIntro(true)}
            className="text-[#2A74B9] hover:text-[#215A91] flex items-center gap-2 mb-4 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Start Over
          </button>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">User Guide</h2>
            <div className="flex flex-col items-end gap-1">
              <p className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length}
              </p>
              <div className="flex items-center gap-2">
                {sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      if (index <= currentSectionIndex || completedSections.has(index)) {
                        setCurrentSectionIndex(index)
                      }
                    }}
                    disabled={!completedSections.has(index) && index > currentSectionIndex}
                    className={`h-2 rounded-full transition-all ${
                      index === currentSectionIndex
                        ? 'w-8 bg-[#2A74B9]'
                        : completedSections.has(index) || index < currentSectionIndex
                        ? 'w-2 bg-[#2A74B9]/50 hover:bg-[#2A74B9]/70 cursor-pointer'
                        : 'w-2 bg-gray-300 cursor-not-allowed'
                    }`}
                    aria-label={`Go to section ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {renderSection()}
          
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentSectionIndex === 0}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentSectionIndex === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-[#2A74B9] text-white rounded-lg font-medium hover:bg-[#215A91] transition-colors"
            >
              {currentSectionIndex === sections.length - 1 ? 'Complete' : 'Continue'}
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