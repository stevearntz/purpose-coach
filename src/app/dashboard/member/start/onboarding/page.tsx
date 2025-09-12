'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useOrganization } from '@clerk/nextjs'
import { 
  ChevronRight, 
  ChevronLeft, 
  User, 
  Users, 
  Check,
  Briefcase,
  Plus,
  X,
  Wrench,
  Flame,
  BookOpen,
  Video,
  FileText,
  Lightbulb,
  Heart,
  Zap,
  MessageCircle,
  Sparkles
} from 'lucide-react'

interface TeamMember {
  id: string
  firstName: string
  lastName: string
  firstNameError?: boolean
  lastNameError?: boolean
}

interface OnboardingData {
  firstName: string
  lastName: string
  teamMembers: TeamMember[]
  teamName: string
  teamPurpose: string
  teamEmoji: string
}

interface OnboardingErrors {
  firstName?: string
  lastName?: string
  teamMembers?: string
  teamName?: string
  teamPurpose?: string
  teamEmoji?: string
}

interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  teamName?: string
  teamSize?: string
  teamPurpose?: string
  teamEmoji?: string
}

interface ProfileUpdatePayload extends ProfileUpdateData {
  partialUpdate: boolean
  companyId?: string
}


// Primary team emojis - curated selection
const TEAM_EMOJIS = [
  '😊', '🎯', '🚀', '💪', '🌟', '🎨', '🧠', '💡',
  '🦁', '🐻', '🦊', '🐧', '🦋', '🐢', '🦅', '🐙',
  '🔥', '⚡', '🌈', '🎪', '🎭', '🏆', '💎', '🎵',
  '🤝', '👑', '🌺', '🍀', '🌞'
]

// Full emoji library for picker
const EMOJI_LIBRARY = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘'],
  'Animals': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄'],
  'Nature': ['🌵', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '🥀', '🌾'],
  'Objects': ['💎', '💍', '🏆', '🎯', '🎪', '🎨', '🎭', '🎲', '🎮', '🎸', '🎺', '🥁', '🎬', '🎤', '📚', '🎧'],
  'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💝'],
  'Activities': ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '🤸', '🤺', '🏌️', '🏇']
}

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const { organization } = useOrganization()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [animating, setAnimating] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedEmojiCategory, setSelectedEmojiCategory] = useState('Smileys')
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null)
  const [companyDatabaseId, setCompanyDatabaseId] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const emojiRef = useRef<HTMLDivElement>(null)
  
  const [data, setData] = useState<OnboardingData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    teamMembers: [{ id: Date.now().toString(), firstName: '', lastName: '', firstNameError: false, lastNameError: false }],
    teamName: '',
    teamPurpose: '',
    teamEmoji: ''
  })

  const [errors, setErrors] = useState<OnboardingErrors>({})
  const memberInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const nameInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Team member management functions
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      firstNameError: false,
      lastNameError: false
    }
    setData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, newMember]
    }))
    
    // Focus the new row's first name input after a brief delay
    setTimeout(() => {
      nameInputRefs.current[`${newMember.id}-firstName`]?.focus()
    }, 100)
  }

  const removeTeamMember = (id: string) => {
    setData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter(m => m.id !== id)
    }))
  }

  const updateTeamMember = (id: string, field: keyof TeamMember, value: string) => {
    setData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map(member => {
        if (member.id === id) {
          const updated = { ...member, [field]: value }
          if (field === 'firstName' && value) updated.firstNameError = false
          if (field === 'lastName' && value) updated.lastNameError = false
          return updated
        }
        return member
      })
    }))
  }

  const handleMemberKeyDown = (e: React.KeyboardEvent, memberId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const currentMember = data.teamMembers.find(m => m.id === memberId)
      
      if (!currentMember) return
      
      if (currentMember.firstName.trim() || currentMember.lastName.trim()) {
        // Check if this is the last member, if so add a new row
        const lastMember = data.teamMembers[data.teamMembers.length - 1]
        if (lastMember.id === memberId) {
          addTeamMember()
        } else {
          // Otherwise, continue to the next step
          handleNext()
        }
      } else {
        // Show error if both names are empty
        setData(prev => ({
          ...prev,
          teamMembers: prev.teamMembers.map(m => {
            if (m.id === memberId) {
              return { ...m, firstNameError: !currentMember.firstName.trim(), lastNameError: !currentMember.lastName.trim() }
            }
            return m
          })
        }))
      }
    }
  }

  // Fetch existing profile data and company ID
  useEffect(() => {
    const fetchData = async () => {
      // Fetch existing profile
      try {
        console.log('[Onboarding] Fetching existing profile...')
        const profileResponse = await fetch('/api/user/profile', {
          credentials: 'include' // Include auth cookies
        })
        console.log('[Onboarding] Profile fetch response:', profileResponse.status)
        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          console.log('[Onboarding] Raw profile data from API:', profileData)
          
          // Handle nested response format from new API pattern
          const profile = profileData.data?.profile || profileData.profile
          console.log('[Onboarding] Extracted profile:', profile)
          
          if (profile) {
            // Pre-populate form with existing data (without team members - they'll be fetched separately)
            setData(prev => ({
              firstName: profile.firstName || prev.firstName || '',
              lastName: profile.lastName || prev.lastName || '',
              teamMembers: prev.teamMembers, // Keep default for now, will be updated below
              teamName: profile.teamName || '',
              teamPurpose: profile.teamPurpose || '',
              teamEmoji: profile.teamEmoji || ''
            }))
            
            // If profile has a company, set it
            if (profile.companyId) {
              setCompanyDatabaseId(profile.companyId)
            }
            
            // Mark as edit mode if any data exists
            if (profile.teamName || profile.teamPurpose) {
              setIsEditMode(true)
            }
            
            console.log('[Onboarding] Loaded existing profile data:', profile)
          }
        }
        
        // Fetch team members separately
        const teamResponse = await fetch('/api/team/members', {
          credentials: 'include'
        })
        console.log('[Onboarding] Team members fetch response:', teamResponse.status)
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          console.log('[Onboarding] Raw team data from API:', teamData)
          
          // Handle nested response format
          const teamMembers = teamData.data?.teamMembers || teamData.teamMembers
          console.log('[Onboarding] Extracted team members:', teamMembers)
          
          if (teamMembers && teamMembers.length > 0) {
            // Convert team members to the format used in the form
            const formattedMembers = teamMembers.map((member: any) => {
              // Split existing name into firstName and lastName
              const nameParts = (member.name || '').split(' ')
              const firstName = nameParts[0] || ''
              const lastName = nameParts.slice(1).join(' ') || ''
              
              return {
                id: member.id,
                firstName,
                lastName,
                firstNameError: false,
                lastNameError: false
              }
            })
            
            setData(prev => ({
              ...prev,
              teamMembers: formattedMembers
            }))
            
            // Mark as edit mode since we have team members
            setIsEditMode(true)
            
            console.log('Loaded existing team members:', formattedMembers)
          }
        }
      } catch (error) {
        console.error('Error fetching profile and team members:', error)
      }
      
      // Also fetch company if user is in an organization
      if (organization?.id) {
        try {
          const response = await fetch('/api/user/company')
          if (response.ok) {
            const data = await response.json()
            if (data.company) {
              setCompanyDatabaseId(data.company.id)
              console.log('Found company in database:', data.company.name, 'with ID:', data.company.id)
            } else {
              console.log('No company found in database for organization:', organization.name)
            }
          }
        } catch (error) {
          console.error('Error fetching company:', error)
        }
      }
    }
    
    fetchData()
  }, [organization])

  // Load animated emoji font
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)

    // Create animated emoji CSS - inspired by Noto Emoji animations
    const style = document.createElement('style')
    style.innerHTML = `
      /* Noto-style smooth bounce animation */
      @keyframes noto-bounce {
        0% { 
          transform: translateY(0) scale(1) rotate(0deg);
          animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1);
        }
        20% { 
          transform: translateY(-8px) scale(1.05) rotate(-3deg);
          animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1);
        }
        40% { 
          transform: translateY(-12px) scale(1.15) rotate(2deg);
          animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1);
        }
        50% { 
          transform: translateY(-14px) scale(1.2) rotate(0deg);
          animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1);
        }
        60% { 
          transform: translateY(-12px) scale(1.15) rotate(-2deg);
          animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1);
        }
        80% { 
          transform: translateY(-4px) scale(1.05) rotate(1deg);
          animation-timing-function: cubic-bezier(0.28, 0.84, 0.42, 1);
        }
        100% { 
          transform: translateY(0) scale(1) rotate(0deg);
        }
      }
      
      /* Playful wiggle animation */
      @keyframes noto-wiggle {
        0%, 100% { transform: rotate(0deg) scale(1); }
        10% { transform: rotate(-12deg) scale(1.1); }
        20% { transform: rotate(12deg) scale(1.1); }
        30% { transform: rotate(-8deg) scale(1.05); }
        40% { transform: rotate(8deg) scale(1.05); }
        50% { transform: rotate(-4deg) scale(1.02); }
        60% { transform: rotate(4deg) scale(1.02); }
        70% { transform: rotate(-2deg) scale(1.01); }
        80% { transform: rotate(2deg) scale(1.01); }
        90% { transform: rotate(-1deg) scale(1); }
      }
      
      /* Heartbeat pulse */
      @keyframes noto-heartbeat {
        0% { transform: scale(1); }
        14% { transform: scale(1.3); }
        28% { transform: scale(1); }
        42% { transform: scale(1.3); }
        56% { transform: scale(1); }
        100% { transform: scale(1); }
      }
      
      /* Jello effect */
      @keyframes noto-jello {
        0%, 100% { transform: scale(1, 1); }
        30% { transform: scale(1.25, 0.75); }
        40% { transform: scale(0.75, 1.25); }
        50% { transform: scale(1.15, 0.85); }
        65% { transform: scale(0.95, 1.05); }
        75% { transform: scale(1.05, 0.95); }
      }
      
      /* Tada celebration */
      @keyframes noto-tada {
        0% { transform: scale(1) rotate(0deg); }
        10%, 20% { transform: scale(0.9) rotate(-3deg); }
        30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
        40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
        100% { transform: scale(1) rotate(0deg); }
      }
      
      /* Float up animation */
      @keyframes noto-float {
        0%, 100% { 
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        33% { 
          transform: translateY(-6px) scale(1.05);
          opacity: 0.9;
        }
        66% { 
          transform: translateY(-10px) scale(1.1);
          opacity: 0.95;
        }
      }
      
      /* Base emoji hover styles */
      .emoji-hover {
        display: inline-block;
        transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        cursor: pointer;
        will-change: transform;
      }
      
      /* Different animation classes */
      .emoji-hover-bounce:hover {
        animation: noto-bounce 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
      
      .emoji-hover-wiggle:hover {
        animation: noto-wiggle 0.8s ease-in-out;
      }
      
      .emoji-hover-heartbeat:hover {
        animation: noto-heartbeat 0.8s ease-in-out;
      }
      
      .emoji-hover-jello:hover {
        animation: noto-jello 0.8s ease-in-out;
      }
      
      .emoji-hover-tada:hover {
        animation: noto-tada 0.8s ease-in-out;
      }
      
      .emoji-hover-float:hover {
        animation: noto-float 0.6s ease-in-out;
      }
      
      /* Selected state with gentle continuous animation */
      .emoji-selected {
        animation: noto-float 3s ease-in-out infinite;
        filter: drop-shadow(0 0 8px rgba(191, 76, 116, 0.4));
      }
      
      /* Prevent animation conflicts */
      .emoji-hover:not(:hover) {
        animation: none;
      }
    `
    document.head.appendChild(style)
  }, [])

  // Update step based on question and set focus
  useEffect(() => {
    if (currentQuestion === 0) {
      setCurrentStep(0)
    } else {
      setCurrentStep(currentQuestion <= 3 ? 1 : 2)
    }
    
    // Set focus on the appropriate input after navigation
    const timer = setTimeout(() => {
      // Find the first input or textarea (not buttons)
      const input = document.querySelector(
        'input:not([disabled]):not([tabindex]), textarea:not([disabled])'
      ) as HTMLElement
      
      if (input) {
        input.focus()
      } else {
        // For question 0 (welcome), focus the "Let's Get Started" button
        const startButton = document.querySelector('[data-start-button]') as HTMLElement
        if (startButton) {
          startButton.focus()
        }
      }
    }, 400) // Wait for animation to complete
    
    return () => clearTimeout(timer)
  }, [currentQuestion])

  const validateQuestion = (question: number): boolean => {
    const newErrors: OnboardingErrors = {}
    
    switch(question) {
      case 1:
        // Step 1 (names) is skipped - no validation needed
        break
      case 2:
        // Step 2 is now team name (role and department have been removed)
        if (!data.teamName) newErrors.teamName = 'Team name is required'
        break
      case 3:
        // Step 3 is now team members
        // Validate at least one team member has a name
        const validMembers = data.teamMembers.filter(m => m.firstName.trim() || m.lastName.trim())
        if (validMembers.length === 0) {
          newErrors.teamMembers = 'Add at least one team member'
        }
        break
      case 4:
        // Step 4 is now team purpose
        if (!data.teamPurpose) newErrors.teamPurpose = 'Team purpose is required'
        break
      case 5:
        // Step 5 is now team emoji
        if (!data.teamEmoji) newErrors.teamEmoji = 'Please select a team emoji'
        break
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const saveProfileData = async (fields: ProfileUpdateData) => {
    try {
      const payload: ProfileUpdatePayload = {
        ...fields,
        partialUpdate: true, // Flag for partial update
      }
      
      // Only include companyId if we have the database ID
      if (companyDatabaseId) {
        payload.companyId = companyDatabaseId
      }
      
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include auth cookies
        body: JSON.stringify(payload),
      })
      
      console.log('Profile API response status:', response.status)
      
      if (!response.ok) {
        let errorData = {}
        try {
          errorData = await response.json()
        } catch (e) {
          console.error('Failed to parse error response:', e)
        }
        console.error('Failed to save profile data:', response.status, errorData)
        // Re-throw to see if there's an outer catch transforming the error
        throw new Error(`Profile save failed with status ${response.status}`)
      } else {
        console.log('Profile data saved successfully:', fields)
      }
    } catch (error) {
      console.error('Error saving profile data:', error)
    }
  }

  const handleNext = async () => {
    if (validateQuestion(currentQuestion)) {
      // Save data after each step
      // Skip step 1 (names) - they're collected during sign-up
      // Role and department have been removed from onboarding
      if (currentQuestion === 2 && data.teamName) {
        // Save team name (now step 2)
        await saveProfileData({
          teamName: data.teamName
        })
      } else if (currentQuestion === 3) {
        // Save team members to database
        const validMembers = data.teamMembers.filter(m => m.firstName.trim() || m.lastName.trim())
          .map(m => ({
            id: m.id,
            name: `${m.firstName.trim()} ${m.lastName.trim()}`.trim(),
            email: '', // No email field anymore
            role: ''   // No role field anymore
          }))
        if (validMembers.length > 0) {
          // Save team size to user profile
          await saveProfileData({
            teamSize: validMembers.length.toString()
          })
          
          // Determine if we should update existing or create new team members
          // Check if we have existing members (loaded from database)
          const hasExistingMembers = isEditMode && data.teamMembers.some(m => 
            m.id && !m.id.startsWith('new-') && m.id.length > 10
          )
          
          // Save team members to database via the team API
          try {
            if (hasExistingMembers) {
              // First, delete all existing team members for this manager
              const deleteResponse = await fetch('/api/team/members/all', {
                method: 'DELETE',
                credentials: 'include'
              })
              
              if (!deleteResponse.ok) {
                console.error('Failed to delete existing team members')
              }
            }
            
            // Now create the new set of team members
            const response = await fetch('/api/team/members', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ members: validMembers })
            })
            
            if (!response.ok) {
              const errorText = await response.text()
              console.error('Failed to save team members:', response.status, errorText)
            }
          } catch (error) {
            console.error('Error saving team members:', error)
          }
        }
      } else if (currentQuestion === 4 && data.teamPurpose) {
        // Save team purpose (now step 4)
        await saveProfileData({
          teamPurpose: data.teamPurpose
        })
      } else if (currentQuestion === 5 && data.teamEmoji) {
        // Save team emoji (now step 5)
        await saveProfileData({
          teamEmoji: data.teamEmoji
        })
      }
      
      setAnimating(true)
      setTimeout(() => {
        if (currentQuestion < 7) {
          setCurrentQuestion(currentQuestion + 1)
        }
        setAnimating(false)
      }, 300)
    }
  }

  const handleBack = () => {
    setAnimating(true)
    setTimeout(() => {
      if (currentQuestion > 0) {
        // Skip the mission interlude (6) when going back from offerings (7)
        if (currentQuestion === 7) {
          setCurrentQuestion(5) // Go back to team emoji selection
        } else if (currentQuestion === 2) {
          // Skip step 1 (names) when going back from team name
          setCurrentQuestion(0) // Go back to welcome screen
        } else {
          setCurrentQuestion(currentQuestion - 1)
        }
      }
      setAnimating(false)
    }, 300)
  }

  const handleComplete = async () => {
    // Clear any previous errors before validating
    setErrors({})
    
    if (validateQuestion(5)) {
      // Save onboarding data
      const finalData = {
        ...data,
        companyId: companyDatabaseId || null
      }
      
      try {
        // Save to database and update Clerk
        const response = await fetch('/api/user/profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include auth cookies
          body: JSON.stringify(finalData),
        })
        
        if (!response.ok) {
          let errorData
          try {
            errorData = await response.json()
          } catch {
            errorData = await response.text()
          }
          console.error('Failed to save profile:', response.status, errorData)
        } else {
          const result = await response.json()
          console.log('Profile saved successfully:', result)
        }
      } catch (error) {
        console.error('Error saving profile:', error)
      }
      
      // Redirect to dashboard after completing onboarding
      router.push('/dashboard/member/start/dashboard')
    }
  }

  const selectEmoji = (emoji: string) => {
    // Update data and clear any errors for teamEmoji
    setData(prev => ({...prev, teamEmoji: emoji}))
    setErrors(prev => ({...prev, teamEmoji: undefined}))
    setShowEmojiPicker(false)
  }

  const renderStepIndicator = () => (
    <div className="flex flex-col items-center justify-center mb-6">
      <div className="flex items-center">
        {[1, 2].map((step) => (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <button
                onClick={() => {
                  // Can only navigate to completed steps or current step
                  if (step === 1 && currentStep >= 1) {
                    setAnimating(true)
                    setTimeout(() => {
                      // If we're on step 2, go back to the last question of step 1 (question 3)
                      // Otherwise go to question 1
                      setCurrentQuestion(currentStep === 2 && currentQuestion > 3 ? 3 : 1)
                      setAnimating(false)
                    }, 300)
                  } else if (step === 2 && currentStep >= 2) {
                    setAnimating(true)
                    setTimeout(() => {
                      // If we're past step 2, go to the last question of step 2 (question 6)
                      // Otherwise go to question 4
                      setCurrentQuestion(currentQuestion > 6 ? 6 : 4)
                      setAnimating(false)
                    }, 300)
                  }
                }}
                disabled={step > currentStep}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  currentStep >= step
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white cursor-pointer hover:scale-110'
                    : 'bg-white/10 text-white/50 border border-white/20 cursor-not-allowed'
                }`}
              >
                {currentStep > step ? <Check className="w-4 h-4" /> : step}
              </button>
              <span className={`text-[10px] mt-1 transition-all ${
                currentStep >= step ? 'text-white/70' : 'text-white/40'
              }`}>
                {step === 1 ? 'You' : 'Your Team'}
              </span>
            </div>
            {step < 2 && (
              <div
                className={`w-16 h-0.5 mx-2 mb-4 transition-all duration-500 ${
                  currentStep > step
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                    : 'bg-white/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )

  const renderQuestion = () => {
    const questionContent = () => {
      switch(currentQuestion) {
        case 0:
          return (
            <div className="space-y-8 w-full max-w-4xl mx-auto">
              <div className="text-center">
                {/* Animated Campfire SVG */}
                <div className="relative w-64 h-64 mx-auto mb-8">
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Logs */}
                    <rect x="70" y="140" width="60" height="15" rx="7" fill="#8B4513" />
                    <rect x="60" y="150" width="80" height="15" rx="7" fill="#654321" />
                    
                    {/* Fire */}
                    <g className="animate-pulse">
                      <path 
                        d="M100 135 Q85 110 90 95 Q95 105 100 95 Q105 105 110 95 Q115 110 100 135" 
                        fill="url(#fire-gradient)"
                        className="animate-[flicker_1.5s_ease-in-out_infinite]"
                      />
                      <path 
                        d="M100 125 Q92 105 95 90 Q98 100 100 90 Q102 100 105 90 Q108 105 100 125" 
                        fill="url(#fire-gradient-inner)"
                        className="animate-[flicker_1s_ease-in-out_infinite]"
                      />
                    </g>
                    
                    {/* Sparks */}
                    <circle r="1.5" fill="#FFA500" className="animate-[float_3s_ease-in-out_infinite]">
                      <animate attributeName="cy" values="130;60;130" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="cx" values="95;85;95" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="3s" repeatCount="indefinite" />
                    </circle>
                    <circle r="1" fill="#FFD700" className="animate-[float_4s_ease-in-out_infinite_0.5s]">
                      <animate attributeName="cy" values="130;50;130" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="cx" values="105;115;105" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle r="1.2" fill="#FF6347" className="animate-[float_3.5s_ease-in-out_infinite_1s]">
                      <animate attributeName="cy" values="130;55;130" dur="3.5s" repeatCount="indefinite" />
                      <animate attributeName="cx" values="100;90;100" dur="3.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="1;0;1" dur="3.5s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id="fire-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#FF6B6B" />
                        <stop offset="50%" stopColor="#FFA500" />
                        <stop offset="100%" stopColor="#FFD700" />
                      </linearGradient>
                      <linearGradient id="fire-gradient-inner" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#FF8C42" />
                        <stop offset="50%" stopColor="#FFB347" />
                        <stop offset="100%" stopColor="#FFF4E6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 blur-xl opacity-50">
                    <div className="w-32 h-32 mx-auto mt-16 bg-gradient-to-t from-orange-500 to-yellow-400 rounded-full animate-pulse" />
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-[fadeInUp_1s_ease-out]">
                  {isEditMode ? 'Welcome Back to Campfire! 🔥' : 'Welcome to Campfire! 🔥'}
                </h1>
                
                <p className="text-xl text-white/80 mb-8 animate-[fadeInUp_1s_ease-out_0.2s] opacity-0" 
                   style={{animationFillMode: 'forwards'}}>
                  {isEditMode 
                    ? "Let's update your profile and keep your team info current"
                    : "Where teams gather, stories ignite, and connections grow stronger"}
                </p>
                
                <div className="space-y-4 text-white/70 max-w-2xl mx-auto animate-[fadeInUp_1s_ease-out_0.4s] opacity-0"
                     style={{animationFillMode: 'forwards'}}>
                  <p className="flex items-center justify-center gap-3">
                    <span className="text-2xl animate-bounce" style={{animationDelay: '0.5s'}}>✨</span>
                    <span>In just 2 minutes, we'll help you set up your team's virtual campfire</span>
                  </p>
                  <p className="flex items-center justify-center gap-3">
                    <span className="text-2xl animate-bounce" style={{animationDelay: '0.7s'}}>🎯</span>
                    <span>Get personalized tools and experiences tailored to your team's needs</span>
                  </p>
                  <p className="flex items-center justify-center gap-3">
                    <span className="text-2xl animate-bounce" style={{animationDelay: '0.9s'}}>🤝</span>
                    <span>Build deeper connections and unlock your team's full potential</span>
                  </p>
                </div>
                
                <button
                  onClick={() => {
                    // Skip step 1 (names) and step 2 (department) - go straight to team name
                    setCurrentQuestion(2)
                  }}
                  data-start-button
                  className="mt-8 px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-600 text-white rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-pink-700 transition-all transform hover:scale-105 animate-[fadeInUp_1s_ease-out_0.6s] opacity-0 shadow-lg"
                  style={{animationFillMode: 'forwards'}}
                >
                  {isEditMode ? 'Update Your Profile 📝' : "Let's Get Started! 🚀"}
                </button>
              </div>
              
              <style jsx>{`
                @keyframes flicker {
                  0%, 100% { transform: scaleY(1) scaleX(1); }
                  50% { transform: scaleY(1.1) scaleX(0.95); }
                }
                @keyframes float {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
                @keyframes fadeInUp {
                  from {
                    opacity: 0;
                    transform: translateY(20px);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0);
                  }
                }
              `}</style>
            </div>
          )
          
        case 1:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">What's your name?</h2>
                <p className="text-white/60 text-sm">Let's start with the basics</p>
              </div>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">First Name</label>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) => setData({...data, firstName: e.target.value})}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleNext()
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-white/10 border ${
                      errors.firstName ? 'border-red-500' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all`}
                    placeholder="Jane"
                    autoFocus
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={data.lastName}
                    onChange={(e) => setData({...data, lastName: e.target.value})}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleNext()
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-white/10 border ${
                      errors.lastName ? 'border-red-500' : 'border-white/20'
                    } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
            </div>
          )

        case 2:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">What's your team called?</h2>
                <p className="text-white/60 text-sm">Give your team a name that captures its identity</p>
              </div>
              <div className="max-w-2xl mx-auto">
                <input
                  type="text"
                  value={data.teamName}
                  onChange={(e) => setData({...data, teamName: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleNext()
                    }
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border ${
                    errors.teamName ? 'border-red-500' : 'border-white/20'
                  } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all`}
                  placeholder="e.g., Product Team, Engineering Squad, Customer Success Heroes"
                  autoFocus
                />
                {errors.teamName && (
                  <p className="text-red-400 text-xs mt-1">{errors.teamName}</p>
                )}
              </div>
            </div>
          )

        case 3:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Who's on your team?</h2>
                <p className="text-white/60 text-sm">Add the people you work with directly</p>
              </div>
              <div className="max-w-3xl mx-auto">
                {/* Header row */}
                <div className="grid grid-cols-7 gap-4 mb-3 px-1">
                  <div className="col-span-3 text-xs font-medium text-white/60">First Name *</div>
                  <div className="col-span-3 text-xs font-medium text-white/60">Last Name *</div>
                  <div className="col-span-1"></div>
                </div>

                {/* Team member rows */}
                <div className="space-y-2">
                  {data.teamMembers.map((member, index) => (
                    <div key={member.id} className="grid grid-cols-7 gap-4 items-center">
                      <div className="col-span-3">
                        <input
                          ref={(el) => { nameInputRefs.current[`${member.id}-firstName`] = el }}
                          type="text"
                          value={member.firstName}
                          onChange={(e) => updateTeamMember(member.id, 'firstName', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              // Move to lastName field
                              nameInputRefs.current[`${member.id}-lastName`]?.focus()
                            }
                          }}
                          placeholder="Jane"
                          className={`w-full px-4 py-2 bg-white/10 border ${
                            member.firstNameError ? 'border-red-500' : 'border-white/20'
                          } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                          autoFocus={index === 0}
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          ref={(el) => { nameInputRefs.current[`${member.id}-lastName`] = el }}
                          type="text"
                          value={member.lastName}
                          onChange={(e) => updateTeamMember(member.id, 'lastName', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (member.firstName.trim() || member.lastName.trim()) {
                                // If this is the last row, add a new one
                                if (index === data.teamMembers.length - 1) {
                                  addTeamMember()
                                } else {
                                  // Focus next row's firstName input
                                  const nextMember = data.teamMembers[index + 1]
                                  nameInputRefs.current[`${nextMember.id}-firstName`]?.focus()
                                }
                              } else {
                                // Show validation errors
                                setData(prev => ({
                                  ...prev,
                                  teamMembers: prev.teamMembers.map(m => {
                                    if (m.id === member.id) {
                                      return { 
                                        ...m, 
                                        firstNameError: !member.firstName.trim(), 
                                        lastNameError: !member.lastName.trim() 
                                      }
                                    }
                                    return m
                                  })
                                }))
                              }
                            }
                          }}
                          placeholder="Smith"
                          className={`w-full px-4 py-2 bg-white/10 border ${
                            member.lastNameError ? 'border-red-500' : 'border-white/20'
                          } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center gap-2">
                        {index === data.teamMembers.length - 1 ? (
                          <button
                            onClick={addTeamMember}
                            className="w-10 h-10 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                            title="Add team member"
                          >
                            <Plus className="w-5 h-5 text-white" />
                          </button>
                        ) : (
                          data.teamMembers.length > 1 && (
                            <button
                              onClick={() => removeTeamMember(member.id)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                              title="Remove team member"
                            >
                              <X className="w-5 h-5 text-white/60 hover:text-white" />
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Error message */}
                {errors.teamMembers && (
                  <p className="text-red-400 text-xs text-center mt-4">{errors.teamMembers}</p>
                )}

                {/* Hint */}
                <p className="text-white/40 text-xs text-center mt-6">
                  Press Enter in First Name to move to Last Name, or Enter in Last Name to add more team members
                </p>
              </div>
            </div>
          )

        case 4:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">What's your team's mission?</h2>
                <p className="text-white/60 text-sm">What does {organization?.name || 'the company'} count on your team for?</p>
              </div>
              <div className="max-w-2xl mx-auto">
                <textarea
                  value={data.teamPurpose}
                  onChange={(e) => setData({...data, teamPurpose: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.ctrlKey) {
                      e.preventDefault()
                      handleNext()
                    }
                  }}
                  className={`w-full px-4 py-3 bg-white/10 border ${
                    errors.teamPurpose ? 'border-red-500' : 'border-white/20'
                  } rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all resize-none`}
                  placeholder="e.g., We build and maintain the core platform that powers our customer experience... (Ctrl+Enter to continue)"
                  rows={3}
                  autoFocus
                />
                {errors.teamPurpose && (
                  <p className="text-red-400 text-xs mt-1">{errors.teamPurpose}</p>
                )}
              </div>
            </div>
          )

        case 5:
          return (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Pick your team vibe!</h2>
                <p className="text-white/60 text-sm">Choose an emoji that represents your team's energy</p>
              </div>
              <div className="max-w-2xl mx-auto">
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                  {TEAM_EMOJIS.map((emoji, index) => {
                    // Assign different Noto-style animation types for variety
                    const animationTypes = ['emoji-hover-bounce', 'emoji-hover-wiggle', 'emoji-hover-heartbeat', 'emoji-hover-jello', 'emoji-hover-tada', 'emoji-hover-float']
                    const animationType = animationTypes[index % animationTypes.length]
                    
                    return (
                      <button
                        key={emoji}
                        onClick={() => selectEmoji(emoji)}
                        className={`p-2.5 rounded-lg transition-all ${
                          data.teamEmoji === emoji
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg'
                            : 'hover:bg-white/10'
                        }`}
                      >
                        <span 
                          className={`text-2xl block emoji-hover ${animationType} ${data.teamEmoji === emoji ? 'emoji-selected' : ''}`}
                          style={{ fontFamily: 'Noto Color Emoji, sans-serif' }}
                        >
                          {emoji}
                        </span>
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setShowEmojiPicker(true)}
                    className="p-2.5 rounded-lg border-2 border-dashed border-white/30 hover:border-purple-500 hover:bg-white/10 transition-all group"
                  >
                    <Plus className="w-6 h-6 text-white/50 group-hover:text-purple-400 mx-auto" />
                  </button>
                </div>
                {errors.teamEmoji && (
                  <p className="text-red-400 text-xs text-center mt-2">{errors.teamEmoji}</p>
                )}
              </div>
            </div>
          )
          
        case 6: // Mission Interlude
          return (
            <div className="w-full max-w-3xl mx-auto">
              {/* Campfire Heart Illustration */}
              <div className="relative w-24 h-24 mx-auto mb-8">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Campfire Heart */}
                  <g className="animate-pulse">
                    <path 
                      d="M100 160 C60 120, 20 90, 60 50 C80 30, 100 50, 100 50 C100 50, 120 30, 140 50 C180 90, 140 120, 100 160"
                      fill="url(#heart-gradient)"
                      className="animate-[heartbeat_2s_ease-in-out_infinite]"
                    />
                    {/* Inner flame */}
                    <path 
                      d="M100 130 Q90 110 95 95 Q98 105 100 95 Q102 105 105 95 Q110 110 100 130" 
                      fill="url(#flame-gradient)"
                      className="animate-[flicker_1.5s_ease-in-out_infinite]"
                    />
                  </g>
                  
                  <defs>
                    <linearGradient id="heart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF6B6B" />
                      <stop offset="50%" stopColor="#FF8C42" />
                      <stop offset="100%" stopColor="#FFA500" />
                    </linearGradient>
                    <linearGradient id="flame-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#FFA500" />
                      <stop offset="100%" stopColor="#FFD700" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 blur-2xl opacity-40">
                  <div className="w-20 h-20 mx-auto mt-2 bg-gradient-to-t from-orange-500 to-pink-500 rounded-full" />
                </div>
              </div>
              
              {/* Content */}
              <div className="text-center space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Our Mission
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full" />
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 max-w-2xl mx-auto">
                  <p className="text-lg text-white/90 leading-relaxed">
                    We're on a mission to help managers lead with confidence by equipping them with the skills, tools, and real-time support they need to navigate challenges, inspire their teams, and drive performance—without burning out or going it alone.
                  </p>
                </div>
              </div>
            </div>
          )
          
        case 7: // What is Campfire
          return (
            <div className="w-full max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-3">
                  What Campfire Offers
                </h2>
                <p className="text-white/70 text-sm">
                  Everything your team needs to thrive
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Tools Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <Wrench className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Self-Service Tools</h3>
                      <p className="text-white/60 text-xs">Interactive coaching experiences</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Target className="w-4 h-4 text-purple-400" />
                      <span className="text-white/80 text-sm">Purpose Coach</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span className="text-white/80 text-sm">Values Explorer</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/80 text-sm">Strengths Finder</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80 text-sm">Team Charter</span>
                    </div>
                  </div>
                </div>
                
                {/* Campfires Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Live Campfires</h3>
                      <p className="text-white/60 text-xs">Group learning sessions</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 text-sm">1-on-1 Mastery</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span className="text-white/80 text-sm">Leadership 101</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Target className="w-4 h-4 text-red-400" />
                      <span className="text-white/80 text-sm">Goal Setting</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-white/80 text-sm">Team Dynamics</span>
                    </div>
                  </div>
                </div>
                
                {/* Resources Section */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Resources Library</h3>
                      <p className="text-white/60 text-xs">Curated learning materials</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Video className="w-4 h-4 text-red-400" />
                      <span className="text-white/80 text-sm">Video Guides</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-white/80 text-sm">Articles</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <BookOpen className="w-4 h-4 text-green-400" />
                      <span className="text-white/80 text-sm">Case Studies</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-white/80 text-sm">Best Practices</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )

        default:
          return null
      }
    }

    return (
      <div className={`w-full transition-all duration-500 ${animating ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
        {questionContent()}
      </div>
    )
  }

  return (
    <>
      <div className="mt-6">
        <div className="w-full max-w-7xl mx-auto px-4">
          {/* Glass card container - wider and shorter */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Progress bar */}
            <div className="h-1.5 bg-white/5">
              <div 
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                style={{ width: `${(currentQuestion / 8) * 100}%` }}
              />
            </div>

            <div className="px-8 py-6 md:px-12 md:py-8">
              {/* Step indicator - only show after welcome */}
              {currentQuestion > 0 && renderStepIndicator()}

              {/* Question content - tighter height */}
              <div className="min-h-[200px] flex items-center justify-center w-full">
                {renderQuestion()}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-6">
                {currentQuestion > 0 ? (
                  <button
                    onClick={handleBack}
                    tabIndex={100}
                    className="px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 text-sm bg-white/10 text-white hover:bg-white/20"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                <div className="text-white/40 text-xs flex items-center">
                  {currentQuestion === 0 || currentQuestion === 6 || currentQuestion === 7 ? '' : 
                   `Question ${currentQuestion} of 5`}
                </div>

                {currentQuestion === 0 ? null : currentQuestion < 7 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium text-sm hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 group"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    onClick={handleComplete}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium text-sm hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2 group"
                  >
                    Complete Profile
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tips - smaller */}
          <div className="mt-4 text-center">
            <p className="text-white/50 text-xs">
              💡 Tip: This helps us personalize your experience and recommend the best tools for your team
            </p>
          </div>
        </div>
      </div>

      {/* Emoji Picker Modal */}
      {showEmojiPicker && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEmojiPicker(false)}>
          <div 
            className="bg-gray-900 rounded-xl border border-white/20 shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-semibold">Choose an Emoji</h3>
              <button
                onClick={() => setShowEmojiPicker(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex">
              {/* Categories */}
              <div className="w-32 border-r border-white/10 p-2">
                {Object.keys(EMOJI_LIBRARY).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedEmojiCategory(category)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                      selectedEmojiCategory === category
                        ? 'bg-purple-600/30 text-purple-300'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              
              {/* Emojis */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[50vh]">
                <div className="grid grid-cols-8 gap-2">
                  {EMOJI_LIBRARY[selectedEmojiCategory as keyof typeof EMOJI_LIBRARY].map((emoji, index) => {
                    // Mix up Noto-style animation types for variety
                    const animationTypes = ['emoji-hover-bounce', 'emoji-hover-wiggle', 'emoji-hover-heartbeat', 'emoji-hover-jello', 'emoji-hover-tada', 'emoji-hover-float']
                    const animationType = animationTypes[index % animationTypes.length]
                    
                    return (
                      <button
                        key={emoji}
                        onClick={() => selectEmoji(emoji)}
                        className="p-2 rounded hover:bg-white/10 transition-all"
                      >
                        <span 
                          className={`text-2xl block emoji-hover ${animationType}`}
                          style={{ fontFamily: 'Noto Color Emoji, sans-serif' }}
                        >
                          {emoji}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}