'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Send, Users, Calendar, Settings, Search,
  ChevronDown, X, Plus, Upload, Clock, Target, AlertCircle,
  CheckCircle, UserPlus, Download
} from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import { useToast } from '@/hooks/useToast'
import { ToastProvider } from '@/hooks/useToast'

// Tool data - same as in ToolsLibrary
const toolsData: Record<string, any> = {
  'team-charter': {
    title: 'Team Charter',
    subtitle: 'Align your team',
    description: 'Create clarity and alignment on your team\'s purpose, values, and ways of working.',
    gradient: 'from-[#FF6B6B] to-[#4ECDC4]',
    path: '/team-charter'
  },
  'trust-audit': {
    title: 'Trust Audit',
    subtitle: 'Build stronger relationships',
    description: 'Assess trust across key dimensions to strengthen your professional relationships.',
    gradient: 'from-[#FFA62A] to-[#DB4839]',
    path: '/trust-audit'
  },
  'burnout-assessment': {
    title: 'Burnout Assessment',
    subtitle: 'Check your energy levels',
    description: 'Evaluate your current state and get strategies for maintaining well-being.',
    gradient: 'from-[#74DEDE] to-[#30B859]',
    path: '/burnout-assessment'
  },
  'decision-audit': {
    title: 'Decision Making Audit',
    subtitle: 'Improve your decisions',
    description: 'Evaluate how you make decisions to identify strengths and growth areas.',
    gradient: 'from-[#6DC7FF] to-[#3C36FF]',
    path: '/decision-making-audit'
  },
  'change-style': {
    title: 'Change Style Profile',
    subtitle: 'Discover your change persona',
    description: 'Understand how you naturally respond to change.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    path: '/change-style'
  },
  'change-readiness': {
    title: 'Change Readiness Assessment',
    subtitle: 'Navigate change confidently',
    description: 'Assess your readiness for change and identify where you need support.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    path: '/change-readiness-assessment'
  },
  'user-guide': {
    title: 'User Guide',
    subtitle: 'Create your user guide',
    description: 'Build a shareable guide that helps others collaborate effectively with you.',
    gradient: 'from-[#30C7C7] to-[#2A74B9]',
    path: '/user-guide'
  },
  'expectations-reflection': {
    title: 'Expectations Reflection',
    subtitle: 'Surface team dynamics',
    description: 'Create psychological safety by sharing hopes, fears, and expectations.',
    gradient: 'from-[#C67AF4] to-[#3E37FF]',
    path: '/expectations-reflection'
  },
  'drivers-reflection': {
    title: 'Drivers Reflection',
    subtitle: 'Understand motivations',
    description: 'Identify and prioritize what truly drives you in your career.',
    gradient: 'from-[#FBBF24] to-[#F59E0B]',
    path: '/drivers-reflection'
  },
  'coaching-cards': {
    title: 'Coaching Cards',
    subtitle: 'Guided reflection',
    description: 'Use powerful questions to guide self-reflection and growth.',
    gradient: 'from-[#D4F564] to-[#87AE05]',
    path: '/coaching-cards'
  },
  'change-reflection': {
    title: 'Change Reflection',
    subtitle: '1:1 conversation prep',
    description: 'Prepare for meaningful conversations about change with your team members.',
    gradient: 'from-[#F595B6] to-[#BF4C74]',
    path: '/change-reflection'
  },
  'focus-finder': {
    title: 'Focus Finder',
    subtitle: '5-minute weekly check-in',
    description: 'A rapid weekly reflection to surface what really matters.',
    gradient: 'from-[#C67AF4] to-[#3E37FF]',
    path: '/accountability-builder'
  },
  'hr-partnership': {
    title: 'HR Partnership Assessment',
    subtitle: 'Bridge the gap with HR',
    description: 'Help managers articulate their needs for growth, support, and strategic direction.',
    gradient: 'from-[#30C7C7] to-[#2A74B9]',
    path: '/hr-partnership'
  }
}

interface CompanyUser {
  email: string
  firstName: string
  lastName: string
  status: 'active' | 'invited' | 'deactivated'
  department?: string
  role?: string
  lastAssessment?: string
}

function CreateCampaignContent({ params }: { params: Promise<{ toolId: string }> }) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [toolId, setToolId] = useState<string>('')
  const [currentStep, setCurrentStep] = useState<'setup' | 'participants' | 'review'>('setup')
  
  // Campaign setup state
  const [campaignName, setCampaignName] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [deadline, setDeadline] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [sendReminders, setSendReminders] = useState(true)
  const [anonymousResults, setAnonymousResults] = useState(false)
  
  // Participant selection state
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    params.then(p => {
      setToolId(p.toolId)
      // Set default campaign name
      const tool = toolsData[p.toolId]
      if (tool) {
        const today = new Date()
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December']
        const currentMonth = monthNames[today.getMonth()]
        setCampaignName(`${currentMonth} - ${tool.title}`)
        
        // Set default deadline to 2 weeks from now
        const twoWeeksFromNow = new Date()
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14)
        setDeadline(twoWeeksFromNow.toISOString().split('T')[0])
      }
    })
  }, [params])

  useEffect(() => {
    // Load company users
    const userEmail = localStorage.getItem('campfire_user_email')
    if (userEmail) {
      loadCompanyUsers(userEmail)
    }
  }, [])

  const loadCompanyUsers = async (userEmail: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/company/users?email=${userEmail}`)
      if (response.ok) {
        const data = await response.json()
        // Just use the real users from the API
        setCompanyUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to load company users:', error)
      showError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const tool = toolsData[toolId]

  if (!tool) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Tool not found</div>
      </ViewportContainer>
    )
  }

  // Filter users based on search only
  const filteredUsers = companyUsers.filter(user => {
    const matchesSearch = searchQuery === '' || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  const toggleUser = (email: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(email)) {
      newSelected.delete(email)
    } else {
      newSelected.add(email)
    }
    setSelectedUsers(newSelected)
  }

  const selectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      // Deselect all filtered users
      const newSelected = new Set(selectedUsers)
      filteredUsers.forEach(user => newSelected.delete(user.email))
      setSelectedUsers(newSelected)
    } else {
      // Select all filtered users
      const newSelected = new Set(selectedUsers)
      filteredUsers.forEach(user => newSelected.add(user.email))
      setSelectedUsers(newSelected)
    }
  }

  const handleCreateCampaign = async () => {
    if (selectedUsers.size === 0) {
      showError('Please select at least one participant')
      return
    }

    if (!campaignName || !deadline) {
      showError('Please fill in all required fields')
      return
    }

    setCreating(true)
    try {
      // Get selected user details
      const participants = Array.from(selectedUsers).map(email => {
        const user = companyUsers.find(u => u.email === email)!
        return {
          userId: email, // In real app, this would be user ID
          email,
          name: `${user.firstName} ${user.lastName}`
        }
      })

      // Create campaign
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          toolName: tool.title,
          toolPath: tool.path,
          name: campaignName,
          description: customMessage,
          startDate,
          deadline,
          participants,
          settings: {
            sendReminders,
            anonymousResults,
            reminderFrequency: 'weekly',
            allowLateSubmissions: true,
            requiredCompletion: false
          },
          createdBy: localStorage.getItem('campfire_user_email'),
          companyId: localStorage.getItem('campfire_user_company') || 'default'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      const campaign = await response.json()
      showSuccess(`Campaign "${campaignName}" created successfully!`)
      
      // Redirect to campaign dashboard
      setTimeout(() => {
        router.push(`/dashboard/campaigns/${campaign.id}`)
      }, 1500)
    } catch (error) {
      console.error('Failed to create campaign:', error)
      showError('Failed to create campaign. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const getStepNumber = () => {
    switch(currentStep) {
      case 'setup': return 1
      case 'participants': return 2
      case 'review': return 3
      default: return 1
    }
  }

  return (
    <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-4 py-6 border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => router.push('/dashboard?tab=tools')}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Assessments
              </button>
              
              {/* Step Indicator */}
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${getStepNumber() >= 1 ? 'text-white' : 'text-white/40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    getStepNumber() >= 1 ? 'bg-purple-600' : 'bg-white/10'
                  }`}>
                    1
                  </div>
                  <span className="hidden sm:inline">Setup</span>
                </div>
                <div className="w-8 h-0.5 bg-white/20" />
                <div className={`flex items-center gap-2 ${getStepNumber() >= 2 ? 'text-white' : 'text-white/40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    getStepNumber() >= 2 ? 'bg-purple-600' : 'bg-white/10'
                  }`}>
                    2
                  </div>
                  <span className="hidden sm:inline">Participants</span>
                </div>
                <div className="w-8 h-0.5 bg-white/20" />
                <div className={`flex items-center gap-2 ${getStepNumber() >= 3 ? 'text-white' : 'text-white/40'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    getStepNumber() >= 3 ? 'bg-purple-600' : 'bg-white/10'
                  }`}>
                    3
                  </div>
                  <span className="hidden sm:inline">Review</span>
                </div>
              </div>
            </div>

            {/* Tool Header */}
            <div className={`bg-gradient-to-br ${tool.gradient} rounded-xl p-6`}>
              <h1 className="text-2xl font-bold text-white mb-2">
                Create Assessment Campaign: {tool.title}
              </h1>
              <p className="text-white/90">{tool.description}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8 max-w-7xl mx-auto">
          {currentStep === 'setup' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">Campaign Setup</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Campaign Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    placeholder="e.g., Q1 2024 Trust Audit - Engineering Team"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Start Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Deadline <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      min={startDate}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Custom Message (Optional)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Add a personal note about why this assessment is important..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 h-24"
                  />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendReminders}
                      onChange={(e) => setSendReminders(e.target.checked)}
                      className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white">Send automatic reminders to participants</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={anonymousResults}
                      onChange={(e) => setAnonymousResults(e.target.checked)}
                      className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white">Keep individual results anonymous (aggregate only)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setCurrentStep('participants')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Next: Select Participants
                </button>
              </div>
            </div>
          )}

          {currentStep === 'participants' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
              {/* Search and Filters Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Select Participants</h2>
                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-5 h-5" />
                    <span>{selectedUsers.size} selected of {companyUsers.length} total</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <button
                    onClick={selectAll}
                    className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                  >
                    {selectedUsers.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* User List */}
              <div className="max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="p-12 text-center text-white/60">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-12 text-center text-white/60">No users found matching your criteria</div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                      <label
                        key={user.email}
                        className="flex items-center gap-4 p-4 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.email)}
                          onChange={() => toggleUser(user.email)}
                          className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-white font-medium">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="text-white/60 text-sm">{user.email}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-xs text-white/50">
                            {user.department && <span>{user.department}</span>}
                            {user.role && <span>• {user.role}</span>}
                            {user.lastAssessment && <span>• Last assessment: {user.lastAssessment}</span>}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.status}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-white/10 flex justify-between">
                <button
                  onClick={() => setCurrentStep('setup')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('review')}
                  disabled={selectedUsers.size === 0}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next: Review Campaign
                </button>
              </div>
            </div>
          )}

          {currentStep === 'review' && (
            <div className="space-y-6">
              {/* Campaign Summary */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white mb-6">Review Campaign</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-white/60">Campaign Name</div>
                      <div className="text-white font-medium">{campaignName}</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-white/60">Timeline</div>
                      <div className="text-white">
                        {new Date(startDate).toLocaleDateString()} - {new Date(deadline).toLocaleDateString()}
                        <span className="text-white/60 ml-2">
                          ({Math.ceil((new Date(deadline).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-white/60">Participants</div>
                      <div className="text-white">
                        {selectedUsers.size} users selected
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-white/60">Settings</div>
                      <div className="space-y-1">
                        {sendReminders && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-white text-sm">Automatic reminders enabled</span>
                          </div>
                        )}
                        {anonymousResults && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-white text-sm">Anonymous results (aggregate only)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {customMessage && (
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-white/60">Custom Message</div>
                        <div className="text-white text-sm mt-1">{customMessage}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Participants Preview */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">Selected Participants ({selectedUsers.size})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {Array.from(selectedUsers).map(email => {
                    const user = companyUsers.find(u => u.email === email)
                    if (!user) return null
                    return (
                      <div key={email} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-400 rounded-full" />
                        <span className="text-white/80">{user.firstName} {user.lastName}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep('participants')}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={creating}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {creating ? (
                    'Creating Campaign...'
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Launch Campaign
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </ViewportContainer>
  )
}

export default function CreateCampaignPage({ params }: { params: Promise<{ toolId: string }> }) {
  return (
    <ToastProvider>
      <CreateCampaignContent params={params} />
    </ToastProvider>
  )
}