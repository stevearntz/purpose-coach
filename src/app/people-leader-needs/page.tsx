'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Users, Target, Heart, Brain, Lightbulb, MessageSquare, CheckCircle, X, Plus, AlertCircle, Shield, UserCheck, UsersIcon, MessagesSquare, Laptop, Briefcase, GitBranch, Settings, Handshake, ShieldCheck, DollarSign, Package, Link, Cog, Calendar, RefreshCw, Clock, ShieldAlert, Printer } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import ToolNavigationWrapper from '@/components/ToolNavigationWrapper'
import { toolConfigs } from '@/lib/toolConfigs'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useEmailCapture } from '@/hooks/useEmailCapture'
import { validateEmail, validateEmailRealtime, EmailValidationResult } from '@/utils/emailValidation'
import { saveAssessmentResult } from '@/lib/assessment-utils'

interface ManagerData {
  name: string
  email: string
  department: string
  teamSize: string
  selectedCategories: string[]
  categoryDetails: {
    [key: string]: {
      challenges: string[]
      details: string
    }
  }
  skillGaps: string[]
  skillDetails: string
  supportNeeds: string[]
  supportDetails: string
  selectedPriorities: string[]
  customPriority?: string
  teamPriorities: string
  hrSupport: string
  cultureNeeds: string[]
  cultureDetails: string
  additionalInsights: string
  aiFollowUp?: string
}

const mainCategories = [
  { id: 'performance', label: 'Individual Performance', icon: UserCheck, color: 'text-blue-600' },
  { id: 'teamDynamics', label: 'Team Dynamics', icon: UsersIcon, color: 'text-purple-600' },
  { id: 'communication', label: 'Communication', icon: MessagesSquare, color: 'text-green-600' },
  { id: 'workModels', label: 'Work Norms', icon: Laptop, color: 'text-orange-600' },
  { id: 'leadership', label: 'Leadership Skills', icon: Briefcase, color: 'text-red-600' },
  { id: 'change', label: 'Change & Alignment', icon: GitBranch, color: 'text-indigo-600' },
  { id: 'systems', label: 'Systems & Operations', icon: Settings, color: 'text-gray-600' },
  { id: 'collaboration', label: 'Cross-functional Collaboration', icon: Handshake, color: 'text-teal-600' },
  { id: 'compliance', label: 'Compliance & Risk', icon: ShieldCheck, color: 'text-amber-600' }
]

const categoryOptions: { [key: string]: string[] } = {
  performance: [
    'Managing underperformers',
    'High performer growth',
    'Performance reviews',
    'Coaching and feedback',
    'Skill development',
    'Career paths',
    'Growth conversations',
    'Stretch assignments'
  ],
  teamDynamics: [
    'Team morale',
    'Team conflict',
    'Psychological safety',
    'Inclusion and belonging',
    'Team engagement',
    'Conflict resolution',
    'Collaboration',
    'Celebrating wins',
    'Recruiting and hiring'
  ],
  communication: [
    'Difficult conversations',
    'Giving and receiving feedback',
    'Leading without authority',
    'Building trust',
    'Communicating expectations',
    'Managing up',
    'Cross-functional communication',
    'Navigating change'
  ],
  workModels: [
    'Remote work',
    'Hybrid collaboration',
    'Meetings',
    'Slack/Teams/Email',
    'Work-life balance',
    'Flexible work',
    'Time zone challenges',
    'Tools and systems'
  ],
  leadership: [
    'Delegation',
    'Decision-making',
    'Prioritization',
    'Setting boundaries',
    'Executive presence',
    'Vision',
    'Strategy',
    'Project planning',
    'Managing change',
    'Leading through ambiguity'
  ],
  change: [
    'Team resistance',
    'Communicating change',
    'Managing through transitions',
    'Leading in uncertainty',
    'Organizational restructuring',
    'Scaling teams',
    'Change fatigue',
    'Building buy-in'
  ],
  systems: [
    'Roles and organization',
    'Meeting effectiveness',
    'Reporting and metrics',
    'Onboarding and offboarding',
    'Technology',
    'Performance management',
    'Communication tools',
    'Core HR tools'
  ],
  collaboration: [
    'Interpersonal relationships',
    'Stakeholder management',
    'Navigating silos',
    'Leading with influence',
    'Strategic alignment',
    'Partnership with specific departments'
  ],
  compliance: [
    'HR policies',
    'Documentation',
    'Performance tracking',
    'Fairness and bias',
    'Legal considerations',
    'Managing sensitive issues',
    'Feedback and terminations',
    'Regulatory compliance'
  ]
}

function PeopleLeaderNeedsContent() {
  const searchParams = useSearchParams()
  const analytics = useAnalytics()
  const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
  const config = toolConfigs.peopleLeaderNeeds
  const inviteCode = searchParams.get('invite') || ''
  const campaignName = searchParams.get('campaign') || ''
  const [currentStage, setCurrentStage] = useState('intro')
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false)
  const [startTime] = useState(Date.now())
  
  const [managerData, setManagerData] = useState<ManagerData>({
    name: '',
    email: '',
    department: '',
    teamSize: '',
    selectedCategories: [],
    categoryDetails: {},
    skillGaps: [],
    skillDetails: '',
    supportNeeds: [],
    supportDetails: '',
    selectedPriorities: [],
    teamPriorities: '',
    hrSupport: '',
    cultureNeeds: [],
    cultureDetails: '',
    additionalInsights: ''
  })
  
  const [emailValidation, setEmailValidation] = useState<EmailValidationResult>({ isValid: true })
  const [showSuggestion, setShowSuggestion] = useState(false)
  const [customInputs, setCustomInputs] = useState<{ [key: string]: string }>({})
  
  // Track original values to detect changes
  const [originalProfileData, setOriginalProfileData] = useState<{
    name?: string
    email?: string
    department?: string
    teamSize?: string
  }>({})

  // Fetch invitation data if invite code is present OR pre-populate from URL params
  useEffect(() => {
    // First, check URL parameters for pre-population
    const urlName = searchParams.get('name')
    const urlEmail = searchParams.get('email')
    const urlDepartment = searchParams.get('department')
    const urlTeamSize = searchParams.get('teamSize')
    
    // Pre-populate from URL params if available
    if (urlName || urlEmail || urlDepartment || urlTeamSize) {
      const profileData = {
        name: urlName || '',
        email: urlEmail || '',
        department: urlDepartment || '',
        teamSize: urlTeamSize || ''
      }
      
      setManagerData(prev => ({
        ...prev,
        ...profileData
      }))
      
      // Store original values to track changes
      setOriginalProfileData(profileData)
      
      // If email is provided, validate it
      if (urlEmail) {
        const validation = validateEmail(urlEmail)
        setEmailValidation(validation)
      }
    }
    
    // Then, if there's an invite code, fetch invitation data (which can override URL params)
    if (inviteCode) {
      fetch(`/api/invitations/${inviteCode}`)
        .then(res => res.json())
        .then(data => {
          if (data.name || data.email) {
            setManagerData(prev => ({
              ...prev,
              name: data.name || prev.name,
              email: data.email || prev.email,
              department: data.department || prev.department
            }))
          }
        })
        .catch(err => console.error('Failed to load invitation data:', err))
    }
  }, [inviteCode, searchParams])

  // Calculate dynamic stages based on selected categories
  const getDynamicStages = () => {
    const baseStages = [
      { id: 'intro', title: 'Introduction', icon: Lightbulb },
      { id: 'categories', title: 'Challenge Areas', icon: AlertCircle }
    ]
    
    // Add a stage for each selected category
    managerData.selectedCategories.forEach(catId => {
      const category = mainCategories.find(c => c.id === catId)
      if (category) {
        baseStages.push({
          id: catId,
          title: category.label,
          icon: category.icon
        })
      }
    })
    
    // Add final stages
    baseStages.push(
      { id: 'skills', title: 'Skills & Knowledge', icon: Target },
      { id: 'support', title: 'Immediate Support', icon: Shield },
      { id: 'priorities', title: 'Team Priorities', icon: Brain },
      { id: 'insights', title: 'Additional Thoughts', icon: MessageSquare },
      { id: 'results', title: 'Summary', icon: CheckCircle }
    )
    
    return baseStages
  }

  const stages = getDynamicStages()
  const currentStageIndex = stages.findIndex(s => s.id === currentStage)
  const progress = ((currentStageIndex + 1) / stages.length) * 100

  useEffect(() => {
    analytics.trackToolStart('People Leadership Needs Assessment', {
      inviteCode,
      campaignName
    })
  }, [])

  useEffect(() => {
    if (hasStoredEmail && email && !managerData.email) {
      setManagerData(prev => ({ ...prev, email }))
      setEmailValidation({ isValid: true })
    }
  }, [email, hasStoredEmail])

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setManagerData(prev => ({ ...prev, email: newEmail }))
    
    const validation = validateEmailRealtime(newEmail)
    setEmailValidation(validation)
    setShowSuggestion(!!validation.suggestion)
  }

  const handleSuggestionClick = () => {
    if (emailValidation.suggestion) {
      setManagerData(prev => ({ ...prev, email: emailValidation.suggestion! }))
      setEmailValidation({ isValid: true })
      setShowSuggestion(false)
    }
  }

  const handleStartAssessment = async () => {
    const validation = validateEmail(managerData.email)
    setEmailValidation(validation)
    
    if (!validation.isValid || !managerData.name || !managerData.department || !managerData.teamSize) {
      setShowSuggestion(!!validation.suggestion)
      return
    }
    
    // Check if profile data has changed and update if needed
    // Only sync profile if:
    // 1. User exists in database (has original profile data with email)
    // 2. Accessing via campaign link (has campaignName) or invite link (has inviteCode)
    const hasValidAccessPath = campaignName || inviteCode
    
    if (originalProfileData.email && hasValidAccessPath) {
      const hasChanges = 
        (originalProfileData.name && originalProfileData.name !== managerData.name) ||
        (originalProfileData.department && originalProfileData.department !== managerData.department) ||
        (originalProfileData.teamSize && originalProfileData.teamSize !== managerData.teamSize)
      
      if (hasChanges) {
        try {
          // Parse name into first and last
          const nameParts = managerData.name.trim().split(' ')
          const firstName = nameParts[0] || ''
          const lastName = nameParts.slice(1).join(' ') || ''
          
          // Update profile with changed fields
          const response = await fetch('/api/user/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              firstName,
              lastName,
              department: managerData.department,
              teamSize: managerData.teamSize
            })
          })
          
          if (response.ok) {
            console.log('Profile updated successfully')
          }
        } catch (error) {
          console.error('Failed to update profile:', error)
          // Continue anyway - don't block the assessment
        }
      }
    }
    
    if (managerData.email) {
      await captureEmailForTool(managerData.email, 'People Leadership Needs Assessment', 'people-leader-needs')
    }
    setCurrentStage('categories')
  }

  const toggleCategory = (categoryId: string) => {
    setManagerData(prev => {
      const isSelected = prev.selectedCategories.includes(categoryId)
      const newCategories = isSelected
        ? prev.selectedCategories.filter(id => id !== categoryId)
        : [...prev.selectedCategories, categoryId]
      
      // Initialize category details if selecting
      if (!isSelected && !prev.categoryDetails[categoryId]) {
        return {
          ...prev,
          selectedCategories: newCategories,
          categoryDetails: {
            ...prev.categoryDetails,
            [categoryId]: { challenges: [], details: '' }
          }
        }
      }
      
      return { ...prev, selectedCategories: newCategories }
    })
  }

  const toggleCategoryChallenge = (categoryId: string, challenge: string) => {
    setManagerData(prev => ({
      ...prev,
      categoryDetails: {
        ...prev.categoryDetails,
        [categoryId]: {
          ...prev.categoryDetails[categoryId],
          challenges: prev.categoryDetails[categoryId].challenges.includes(challenge)
            ? prev.categoryDetails[categoryId].challenges.filter(c => c !== challenge)
            : [...prev.categoryDetails[categoryId].challenges, challenge]
        }
      }
    }))
  }

  const handleAddCustomChallenge = (categoryId: string) => {
    const value = customInputs[categoryId]?.trim()
    if (!value) return
    
    setManagerData(prev => ({
      ...prev,
      categoryDetails: {
        ...prev.categoryDetails,
        [categoryId]: {
          ...prev.categoryDetails[categoryId],
          challenges: [...prev.categoryDetails[categoryId].challenges, value]
        }
      }
    }))
    setCustomInputs(prev => ({ ...prev, [categoryId]: '' }))
  }

  const updateCategoryDetails = (categoryId: string, details: string) => {
    setManagerData(prev => ({
      ...prev,
      categoryDetails: {
        ...prev.categoryDetails,
        [categoryId]: {
          ...prev.categoryDetails[categoryId],
          details
        }
      }
    }))
  }

  const renderNavigationHeader = () => {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentStage('intro')}
            className="text-white/70 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Start Over
          </button>
          
          <div className="flex gap-2">
            {stages.map((stage, index) => {
              const isCompleted = index < currentStageIndex
              const isCurrent = index === currentStageIndex
              const isClickable = index <= currentStageIndex
              
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    if (isClickable) {
                      setCurrentStage(stage.id)
                    }
                  }}
                  disabled={!isClickable}
                  className={`w-2 h-2 rounded-full transition-all ${
                    isCurrent
                      ? 'bg-white w-3 h-3'
                      : isCompleted
                      ? 'bg-white hover:w-3 hover:h-3'
                      : 'bg-white/30 cursor-not-allowed'
                  }`}
                  title={`${stage.title}${isClickable ? ' (Click to navigate)' : ''}`}
                />
              )
            })}
          </div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-white transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    )
  }

  const handleBack = () => {
    const currentIndex = stages.findIndex(s => s.id === currentStage)
    if (currentIndex > 0) {
      setCurrentStage(stages[currentIndex - 1].id)
    }
  }

  const handleContinue = async () => {
    const currentIndex = stages.findIndex(s => s.id === currentStage)
    if (currentIndex < stages.length - 1) {
      setCurrentStage(stages[currentIndex + 1].id)
    }
    
    // Save assessment and track completion when moving to results
    if (currentStage === 'insights') {
      const completionTime = Math.round((Date.now() - startTime) / 1000)
      
      // Calculate scores/insights from the assessment data
      const challengeCount = Object.keys(managerData.categoryDetails).reduce((total, cat) => {
        return total + (managerData.categoryDetails[cat]?.challenges?.length || 0)
      }, 0)
      
      const insights = {
        mainChallengeAreas: managerData.selectedCategories.map(catId => {
          const category = mainCategories.find(c => c.id === catId)
          return {
            category: category?.label || catId,
            challenges: managerData.categoryDetails[catId]?.challenges || [],
            details: managerData.categoryDetails[catId]?.details || ''
          }
        }),
        skillGaps: managerData.skillGaps,
        supportNeeds: managerData.supportNeeds,
        priorities: managerData.selectedPriorities,
        cultureNeeds: managerData.cultureNeeds
      }
      
      const recommendations = [
        ...managerData.supportNeeds.map(need => `Immediate support needed: ${need}`),
        ...managerData.skillGaps.map(skill => `Develop skill: ${skill}`),
        managerData.customPriority && `Focus on: ${managerData.customPriority}`
      ].filter(Boolean)
      
      // Save assessment to database with campaign tracking
      try {
        let saveResult;
        
        // If we have a campaign but no invite code, use campaign-based saving
        if (campaignName && !inviteCode && managerData.email) {
          // Saving with campaign code
          
          const response = await fetch('/api/assessments/save-campaign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignCode: campaignName,
              email: managerData.email,
              name: managerData.name,
              toolId: 'hr-partnership',
              toolName: 'People Leadership Needs Assessment',
              responses: managerData,
              scores: {
                challengeCount,
                categoryCount: managerData.selectedCategories.length,
                skillGapCount: managerData.skillGaps.length,
                supportNeedCount: managerData.supportNeeds.length
              },
              summary: `Manager assessment completed with ${challengeCount} challenges identified across ${managerData.selectedCategories.length} categories`,
              insights,
              recommendations,
              userProfile: {
                name: managerData.name,
                email: managerData.email,
                role: 'Manager',
                department: managerData.department,
                teamSize: managerData.teamSize
              }
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to save assessment')
          }
          
          saveResult = await response.json()
        } else if (inviteCode) {
          // Use original invite code based saving
          // Saving with invite code
          const assessmentData = {
            inviteCode,
            toolId: 'hr-partnership',
            toolName: 'HR Partnership Assessment',
            responses: managerData,
            scores: {
              challengeCount,
              categoryCount: managerData.selectedCategories.length,
              skillGapCount: managerData.skillGaps.length,
              supportNeedCount: managerData.supportNeeds.length
            },
            summary: `Manager assessment completed with ${challengeCount} challenges identified across ${managerData.selectedCategories.length} categories`,
            insights,
            recommendations,
            userProfile: {
              name: managerData.name,
              email: managerData.email,
              role: 'Manager',
              department: managerData.department,
              teamSize: managerData.teamSize
            }
          }
          
          saveResult = await saveAssessmentResult(assessmentData)
        } else {
          // No campaign or invite code - can't save
          // No campaign or invite code - skipping database save
        }
        // Assessment saved to database
        
        // Also save to original endpoint for backward compatibility
        const response = await fetch('/api/hr-assessments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            managerData,
            inviteCode,
            campaignName
          })
        })
        
        if (!response.ok) {
          console.error('Failed to save assessment to legacy endpoint')
        }
        
        // Update invitation status if this came from a campaign
        if (inviteCode) {
          await fetch('/api/invitations/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              inviteCode,
              assessmentType: 'People Leadership Needs Assessment'
            })
          })
        }
      } catch (error) {
        console.error('Error saving assessment:', error)
      }
      
      analytics.trackToolComplete('People Leadership Needs Assessment', {
        completionTime,
        categoriesSelected: managerData.selectedCategories.length,
        hasAIFollowUp: !!managerData.aiFollowUp,
        campaignName: campaignName || 'direct',
        hasInviteCode: !!inviteCode
      })

      // Update invitation status if coming from campaign
      if (inviteCode) {
        fetch('/api/invitations/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            inviteCode,
            assessmentType: 'People Leadership Needs Assessment'
          })
        }).catch(error => {
          console.error('Failed to update invitation status:', error)
        })
      }
    }
  }

  const canContinue = () => {
    switch (currentStage) {
      case 'categories':
        return managerData.selectedCategories.length > 0
      case 'skills':
        return managerData.skillGaps.length > 0
      case 'support':
        return managerData.supportNeeds.length > 0
      case 'priorities':
        return true // All fields optional
      case 'insights':
        return true // Optional
      default:
        // For category stages
        if (managerData.selectedCategories.includes(currentStage)) {
          const categoryData = managerData.categoryDetails[currentStage]
          return categoryData?.challenges.length > 0
        }
        return true
    }
  }

  const generateAIFollowUp = async () => {
    if (!managerData.additionalInsights.trim()) return
    
    setIsGeneratingFollowUp(true)
    
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `As an HR expert, analyze this manager's additional insights and suggest 1-2 specific follow-up questions that would help HR better understand their needs. Keep it brief and actionable.

Manager's insights: "${managerData.additionalInsights}"

Context: They've identified challenges in these areas: ${managerData.selectedCategories.join(', ')}.`
          }]
        })
      })

      if (response.ok) {
        const data = await response.json()
        setManagerData(prev => ({ ...prev, aiFollowUp: data.response }))
      }
    } catch (error) {
      console.error('Error generating AI follow-up:', error)
    } finally {
      setIsGeneratingFollowUp(false)
    }
  }


  // Existing skill and support options
  const skillOptions = [
    'Feedback',
    'Coaching',
    'Conflict',
    'Strategic thinking',
    'Emotional intelligence',
    'Decision making',
    'Change',
    'Well-being',
    'Communication',
    'Collaboration',
    'Alignment',
    'AI',
    'Data analysis'
  ]

  const supportOptions = [
    'Day-to-day people issues',
    'Performance management',
    'Team dynamics',
    'Hiring & recruitment',
    'Policy clarification',
    'Difficult terminations',
    'Compensation questions',
    'Legal/compliance issues',
    'Training resources',
    'Employee relations',
    'Reorganization support',
    'Mental health resources'
  ]

  const priorityOptions = [
    { id: 'revenue', label: 'Revenue, sales, or growth targets', icon: DollarSign },
    { id: 'customer', label: 'Customer success or retention', icon: Heart },
    { id: 'product', label: 'Product or delivery milestones', icon: Package },
    { id: 'team', label: 'Team performance or growth', icon: Users },
    { id: 'collaboration', label: 'Cross-functional collaboration', icon: Link },
    { id: 'culture', label: 'Culture or engagement', icon: UsersIcon },
    { id: 'efficiency', label: 'Operational efficiency', icon: Cog },
    { id: 'budget', label: 'Budget or cost management', icon: DollarSign },
    { id: 'strategy', label: 'Strategy or planning', icon: Target },
    { id: 'change', label: 'Change or transformation efforts', icon: RefreshCw },
    { id: 'personal', label: 'My own focus / effectiveness', icon: Clock },
    { id: 'risk', label: 'Risk management or compliance', icon: ShieldAlert }
  ]

  const toggleSelection = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item)
    }
    return [...array, item]
  }

  const handleAddCustom = (value: string, field: 'skill' | 'support') => {
    if (!value.trim()) return
    
    if (field === 'skill') {
      setManagerData(prev => ({
        ...prev,
        skillGaps: [...prev.skillGaps, value.trim()]
      }))
    } else {
      setManagerData(prev => ({
        ...prev,
        supportNeeds: [...prev.supportNeeds, value.trim()]
      }))
    }
  }

  const renderStage = () => {
    switch (currentStage) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${config.gradient} text-white mb-6`}>
                <Lightbulb className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">
                People Leadership Needs Assessment
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
                This assessment helps all people leaders identify core needs for leading their teams effectively so that we can help you get the right support and resources.
              </p>
            </div>
            
            <div className="space-y-4 max-w-md mx-auto">
              <input
                type="text"
                placeholder="Your name"
                value={managerData.name}
                onChange={(e) => setManagerData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              
              <div>
                <input
                  type="email"
                  placeholder="Your email"
                  value={managerData.email}
                  onChange={handleEmailChange}
                  className={`w-full p-4 rounded-xl border ${
                    emailValidation.error ? 'border-red-400' : 'border-white/30'
                  } bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400`}
                />
                {emailValidation.error && (
                  <p className="text-red-300 text-sm mt-1">{emailValidation.error}</p>
                )}
                {showSuggestion && emailValidation.suggestion && (
                  <button
                    onClick={handleSuggestionClick}
                    className="text-cyan-300 text-sm mt-1 hover:text-cyan-200"
                  >
                    Did you mean {emailValidation.suggestion}?
                  </button>
                )}
              </div>
              
              <input
                type="text"
                placeholder="Your department"
                value={managerData.department}
                onChange={(e) => setManagerData(prev => ({ ...prev, department: e.target.value }))}
                className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              
              <input
                type="number"
                placeholder="Team size (e.g., 12)"
                value={managerData.teamSize}
                onChange={(e) => {
                  const value = e.target.value
                  // Allow empty string or positive numbers only
                  if (value === '' || (parseInt(value) > 0 && !value.includes('.'))) {
                    setManagerData(prev => ({ ...prev, teamSize: value }))
                  }
                }}
                onKeyDown={(e) => {
                  // Prevent decimal point, negative sign, 'e' (scientific notation)
                  if (e.key === '.' || e.key === '-' || e.key === 'e' || e.key === 'E') {
                    e.preventDefault()
                  }
                }}
                min="1"
                step="1"
                className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              
              <button
                onClick={handleStartAssessment}
                className="w-full py-4 bg-white text-[#2A74B9] rounded-xl font-semibold hover:bg-white/90 transition-colors text-lg"
              >
                Begin Assessment
              </button>
            </div>
          </div>
        )
        
      case 'categories':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Current Challenges
              </h2>
              <p className="text-lg text-white/80">
                What parts of people management feel most challenging or unclear to you right now?
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mainCategories.map((category) => {
                const Icon = category.icon
                const isSelected = managerData.selectedCategories.includes(category.id)
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'bg-white text-gray-900 border-white shadow-lg'
                        : 'bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-3 mx-auto ${isSelected ? category.color : ''}`} />
                    <p className="font-semibold text-sm">{category.label}</p>
                  </button>
                )
              })}
            </div>
            
            {managerData.selectedCategories.length > 0 && (
              <p className="text-center text-white/70 text-sm">
                Selected: {managerData.selectedCategories.length} area{managerData.selectedCategories.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )
        
      // Dynamic category stages
      default:
        if (managerData.selectedCategories.includes(currentStage)) {
          const category = mainCategories.find(c => c.id === currentStage)
          const categoryData = managerData.categoryDetails[currentStage]
          const options = categoryOptions[currentStage] || []
          const Icon = category?.icon || AlertCircle
          const customInput = customInputs[currentStage] || ''
          
          return (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className={`inline-flex p-3 rounded-full bg-white/20 text-white mb-4`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {category?.label} Challenges
                </h2>
                <p className="text-lg text-white/80">
                  Select the specific challenges you're facing in this area
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  {options.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleCategoryChallenge(currentStage, option)}
                      className={`px-4 py-2 rounded-full border-2 transition-all text-sm shadow-sm ${
                        categoryData?.challenges.includes(option)
                          ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                          : 'bg-white/90 text-gray-700 border-white/60 hover:border-blue-900 hover:shadow-md'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  {categoryData?.challenges.filter(c => !options.includes(c)).map((customChallenge) => (
                    <button
                      key={customChallenge}
                      onClick={() => toggleCategoryChallenge(currentStage, customChallenge)}
                      className="px-4 py-2 rounded-full border-2 bg-blue-900 text-white border-blue-900 flex items-center gap-2 text-sm shadow-md"
                    >
                      {customChallenge}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add your own..."
                    value={customInput}
                    onChange={(e) => setCustomInputs(prev => ({ ...prev, [currentStage]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddCustomChallenge(currentStage)
                      }
                    }}
                    className="flex-1 p-3 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={() => handleAddCustomChallenge(currentStage)}
                    className="p-3 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
                
                <textarea
                  placeholder={`Tell us more about your ${category?.label.toLowerCase()} challenges...`}
                  value={categoryData?.details || ''}
                  onChange={(e) => updateCategoryDetails(currentStage, e.target.value)}
                  className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px]"
                />
              </div>
            </div>
          )
        }
        
        // Other existing stages (skills, support, priorities, insights, results)
        switch (currentStage) {
          case 'skills':
            return (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Skills & Knowledge
                  </h2>
                  <p className="text-lg text-white/80">
                    What skills or knowledge areas do you feel would help you be more effective 
                    in your role over the next 6-12 months?
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {skillOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setManagerData(prev => ({
                          ...prev,
                          skillGaps: toggleSelection(prev.skillGaps, option)
                        }))}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm shadow-sm ${
                          managerData.skillGaps.includes(option)
                            ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                            : 'bg-white/90 text-gray-700 border-white/60 hover:border-blue-900 hover:shadow-md'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    {managerData.skillGaps.filter(skill => !skillOptions.includes(skill)).map((customSkill) => (
                      <button
                        key={customSkill}
                        onClick={() => setManagerData(prev => ({
                          ...prev,
                          skillGaps: prev.skillGaps.filter(s => s !== customSkill)
                        }))}
                        className="px-4 py-2 rounded-full border-2 bg-blue-900 text-white border-blue-900 flex items-center gap-2 text-sm shadow-md"
                      >
                        {customSkill}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add your own..."
                      value={customInputs.skill || ''}
                      onChange={(e) => setCustomInputs(prev => ({ ...prev, skill: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustom(customInputs.skill || '', 'skill')
                          setCustomInputs(prev => ({ ...prev, skill: '' }))
                        }
                      }}
                      className="flex-1 p-3 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={() => {
                        handleAddCustom(customInputs.skill || '', 'skill')
                        setCustomInputs(prev => ({ ...prev, skill: '' }))
                      }}
                      className="p-3 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  <textarea
                    placeholder="Why are these skills important for you? How would developing them help you succeed?"
                    value={managerData.skillDetails}
                    onChange={(e) => setManagerData(prev => ({ ...prev, skillDetails: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px]"
                  />
                </div>
              </div>
            )
            
          case 'support':
            return (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Immediate Support Needs
                  </h2>
                  <p className="text-lg text-white/80">
                    Where do you feel least supported right now in your role as a manager?
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    {supportOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setManagerData(prev => ({
                          ...prev,
                          supportNeeds: toggleSelection(prev.supportNeeds, option)
                        }))}
                        className={`px-4 py-2 rounded-full border-2 transition-all text-sm shadow-sm ${
                          managerData.supportNeeds.includes(option)
                            ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                            : 'bg-white/90 text-gray-700 border-white/60 hover:border-blue-900 hover:shadow-md'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                    {managerData.supportNeeds.filter(need => !supportOptions.includes(need)).map((customNeed) => (
                      <button
                        key={customNeed}
                        onClick={() => setManagerData(prev => ({
                          ...prev,
                          supportNeeds: prev.supportNeeds.filter(n => n !== customNeed)
                        }))}
                        className="px-4 py-2 rounded-full border-2 bg-blue-900 text-white border-blue-900 flex items-center gap-2 text-sm shadow-md"
                      >
                        {customNeed}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add your own..."
                      value={customInputs.support || ''}
                      onChange={(e) => setCustomInputs(prev => ({ ...prev, support: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustom(customInputs.support || '', 'support')
                          setCustomInputs(prev => ({ ...prev, support: '' }))
                        }
                      }}
                      className="flex-1 p-3 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={() => {
                        handleAddCustom(customInputs.support || '', 'support')
                        setCustomInputs(prev => ({ ...prev, support: '' }))
                      }}
                      className="p-3 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  <textarea
                    placeholder="Describe specific situations where you need more HR support or guidance..."
                    value={managerData.supportDetails}
                    onChange={(e) => setManagerData(prev => ({ ...prev, supportDetails: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px]"
                  />
                </div>
              </div>
            )
            
          case 'priorities':
            return (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Team Priorities
                  </h2>
                  <p className="text-lg text-white/80">
                    How can HR help you to be successful?
                  </p>
                </div>
                
                <div className="space-y-6">
                  {/* Priority selection buttons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {priorityOptions.map((priority) => (
                      <button
                        key={priority.id}
                        onClick={() => {
                          setManagerData(prev => {
                            const isSelected = prev.selectedPriorities.includes(priority.id)
                            const newPriorities = isSelected
                              ? prev.selectedPriorities.filter(p => p !== priority.id)
                              : [...prev.selectedPriorities, priority.id]
                            
                            return { ...prev, selectedPriorities: newPriorities }
                          })
                        }}
                        className={`p-4 rounded-xl border-2 transition-all text-left flex items-center gap-3 shadow-sm ${
                          managerData.selectedPriorities.includes(priority.id)
                            ? 'bg-blue-900 border-blue-900 text-white shadow-md'
                            : 'bg-white/90 border-white/60 text-gray-700 hover:bg-white hover:border-blue-900 hover:shadow-md'
                        }`}
                      >
                        <priority.icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{priority.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Custom priority input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom area (optional)"
                      value={customInputs.priority || ''}
                      onChange={(e) => setCustomInputs(prev => ({ ...prev, priority: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customInputs.priority?.trim()) {
                          e.preventDefault()
                          setManagerData(prev => ({ ...prev, customPriority: customInputs.priority!.trim() }))
                          setCustomInputs(prev => ({ ...prev, priority: '' }))
                        }
                      }}
                      className="flex-1 p-3 rounded-lg border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      onClick={() => {
                        if (customInputs.priority?.trim()) {
                          setManagerData(prev => ({ ...prev, customPriority: customInputs.priority!.trim() }))
                          setCustomInputs(prev => ({ ...prev, priority: '' }))
                        }
                      }}
                      className="p-3 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Display custom priority if added */}
                  {managerData.customPriority && (
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-2 bg-blue-900 border-2 border-blue-900 rounded-full text-white text-sm flex items-center gap-2 shadow-md">
                        {managerData.customPriority}
                        <button
                          onClick={() => setManagerData(prev => ({ ...prev, customPriority: undefined }))}
                          className="ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    </div>
                  )}
                  
                  {/* HR support textarea */}
                  <div>
                    <label className="block text-white/80 mb-2">
                      How could HR help you achieve these priorities?
                    </label>
                    <textarea
                      placeholder="Tell us how HR can support your focus areas..."
                      value={managerData.hrSupport}
                      onChange={(e) => setManagerData(prev => ({ ...prev, hrSupport: e.target.value }))}
                      className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px]"
                    />
                  </div>
                </div>
              </div>
            )
            
          case 'insights':
            return (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Additional Thoughts
                  </h2>
                  <p className="text-lg text-white/80">
                    Is there anything else you'd like HR to know about your needs or challenges?
                  </p>
                </div>
                
                <div className="space-y-4">
                  <textarea
                    placeholder="Share any other thoughts, concerns, or ideas for how HR can better support you and your team..."
                    value={managerData.additionalInsights}
                    onChange={(e) => setManagerData(prev => ({ ...prev, additionalInsights: e.target.value }))}
                    className="w-full p-4 rounded-xl border border-white/30 bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[150px]"
                  />
                  
                  {managerData.aiFollowUp && (
                    <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-cyan-400 mt-1" />
                        <div>
                          <p className="text-sm text-white/70 mb-2">AI-suggested follow-up questions:</p>
                          <p className="text-white">{managerData.aiFollowUp}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isGeneratingFollowUp && (
                    <div className="text-center">
                      <p className="text-white/70">Generating follow-up questions...</p>
                    </div>
                  )}
                </div>
              </div>
            )
            
          case 'results':
            return (
              <>
                {/* Print styles */}
                <style jsx>{`
                  @media print {
                    .no-print {
                      display: none !important;
                    }
                    .print-only {
                      display: block !important;
                    }
                  }
                `}</style>
                
                <div className="space-y-6">
                  {/* Print button in top right */}
                  <div className="flex justify-end mb-4 no-print">
                    <button
                      onClick={() => window.print()}
                      className="p-3 bg-white/20 border border-white/30 text-white rounded-lg hover:bg-white/30 transition-colors"
                      title="Print results"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="text-center mb-8">
                    <div className={`inline-flex p-4 rounded-full bg-gradient-to-br ${config.gradient} text-white mb-6 no-print`}>
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">
                      Thank You, {managerData.name}!
                    </h2>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                      Your insights will help HR better understand and support your needs. 
                      We'll review your responses and follow up with targeted support and resources.
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl p-8 space-y-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Summary of Your Needs</h3>
                    
                    <div className="space-y-4">
                      {managerData.selectedCategories.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Challenge Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {managerData.selectedCategories.map((catId) => {
                              const category = mainCategories.find(c => c.id === catId)
                              return category ? (
                                <span key={catId} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                                  <category.icon className="w-3 h-3" />
                                  {category.label}
                                </span>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                      
                      {managerData.skillGaps.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Skills to Develop</p>
                          <div className="flex flex-wrap gap-2">
                            {managerData.skillGaps.map((skill) => (
                              <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {managerData.supportNeeds.length > 0 && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Immediate Support Needs</p>
                          <div className="flex flex-wrap gap-2">
                            {managerData.supportNeeds.map((need) => (
                              <span key={need} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                                {need}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(managerData.selectedPriorities.length > 0 || managerData.customPriority) && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Focus Areas</p>
                          <div className="flex flex-wrap gap-2">
                            {managerData.selectedPriorities.map((priorityId) => {
                              const priority = priorityOptions.find(p => p.id === priorityId)
                              return priority ? (
                                <span key={priorityId} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">
                                  <priority.icon className="w-3 h-3" />
                                  {priority.label}
                                </span>
                              ) : null
                            })}
                            {managerData.customPriority && (
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                                {managerData.customPriority}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-gray-700 font-medium mb-2">Next Steps:</p>
                      <p className="text-gray-600">
                        We will share these results with your HR/People team. This will help them to understand your specific needs and provide targeted support for you and your team. If you'd like to keep them for yourself, you can print them above.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Footer buttons */}
                <div className="flex justify-center gap-4 mt-8 no-print">
                  <button
                    onClick={() => {
                      setCurrentStage('insights')
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => window.location.href = '/toolkit'}
                    className="px-8 py-3 bg-[#2A74B9] text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors"
                  >
                    Explore All Tools
                  </button>
                </div>
              </div>
              </>
            )
            
          default:
            return null
        }
    }
  }

  return (
    <ViewportContainer className={`bg-gradient-to-br ${config.gradient}`}>
      <ToolNavigationWrapper />
      
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-4xl">
          {currentStage === 'intro' ? (
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
              {renderStage()}
            </div>
          ) : (
            <>
              {renderNavigationHeader()}
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/20">
                {renderStage()}
                
                {currentStage !== 'results' && (
                  <div className="flex justify-between mt-8 pt-6 border-t border-white/20">
                    <button
                      onClick={handleBack}
                      disabled={currentStageIndex === 1}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Back
                    </button>
                    
                    <button
                      onClick={handleContinue}
                      disabled={!canContinue()}
                      className="px-8 py-3 bg-[#2A74B9] text-white rounded-lg font-medium hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {currentStage === 'insights' ? 'Complete' : 'Continue'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ViewportContainer>
  )
}

export default function PeopleLeaderNeedsPage() {
  return (
    <Suspense fallback={
      <ViewportContainer className="bg-gradient-to-br from-[#30C7C7] to-[#2A74B9] flex items-center justify-center">
        <div className="text-white">Loading assessment...</div>
      </ViewportContainer>
    }>
      <PeopleLeaderNeedsContent />
    </Suspense>
  )
}