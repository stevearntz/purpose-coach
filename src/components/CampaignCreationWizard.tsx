'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser, useOrganization } from '@clerk/nextjs'
import { 
  Users, Mail, Calendar, MessageSquare, Rocket, 
  ChevronRight, ChevronLeft, ChevronDown, X, Plus, Check, 
  AlertCircle, Loader2, Clock, User, Search, Filter, Copy
} from 'lucide-react'
import { useToast } from '@/hooks/useToast'

interface Participant {
  email: string
  name: string
  isExistingUser?: boolean
  userId?: string
}

interface CampaignData {
  toolId: string
  toolTitle: string
  toolPath: string
  toolGradient: string
  toolIcon: React.ReactNode
  campaignName: string
  participants: Participant[]
  startDate: string
  deadline: string
  customMessage: string
}

interface CampaignCreationWizardProps {
  toolId: string
  toolTitle: string
  toolPath: string
  toolGradient: string
  toolIcon: React.ReactNode
  onClose: () => void
  editingCampaign?: any // Campaign being edited
  initialStep?: number // Initial step to show
}

export default function CampaignCreationWizard({
  toolId,
  toolTitle,
  toolPath,
  toolGradient,
  toolIcon,
  onClose,
  editingCampaign,
  initialStep = 1
}: CampaignCreationWizardProps) {
  const router = useRouter()
  const { user } = useUser()
  const { organization } = useOrganization()
  const { showSuccess, showError } = useToast()
  
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [isLoading, setIsLoading] = useState(false)
  const [existingUsers, setExistingUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  // Removed launchComplete state - not needed anymore
  
  // Email helper data state - integrated into wizard
  const [emailSubject, setEmailSubject] = useState('')
  const [emailTemplate, setEmailTemplate] = useState('')
  const [campaignLink, setCampaignLink] = useState('')
  const [copiedEmails, setCopiedEmails] = useState(false)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [copiedSubject, setCopiedSubject] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  
  // Campaign data state
  const [campaignData, setCampaignData] = useState<CampaignData>({
    toolId,
    toolTitle,
    toolPath,
    toolGradient,
    toolIcon,
    campaignName: `${toolTitle} - ${new Date().toLocaleDateString()}`,
    participants: [],
    startDate: new Date().toISOString().split('T')[0],
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks from now
    customMessage: ''
  })
  
  // State for selecting participants
  const [selectedExistingUsers, setSelectedExistingUsers] = useState<Set<string>>(new Set())
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all')
  const [selectAll, setSelectAll] = useState(false)
  
  // Load existing users and check for draft or editing campaign
  useEffect(() => {
    // If editing a campaign, populate the data
    if (editingCampaign) {
      let metadata: any = {}
      
      // Parse metadata from description if it's JSON
      if (editingCampaign.description) {
        try {
          metadata = JSON.parse(editingCampaign.description)
        } catch {
          // If it's not JSON, treat it as custom message
          metadata.message = editingCampaign.description
        }
      }
      
      // Load participants for this campaign
      const loadCampaignParticipants = async () => {
        try {
          const response = await fetch(`/api/campaigns/${editingCampaign.id}/participants`, {
            credentials: 'include'
          })
          if (response.ok) {
            const data = await response.json()
            const participants = data.participants || []
            
            // Set participants in campaign data
            setCampaignData(prev => ({
              ...prev,
              participants: participants.map((p: any) => ({
                email: p.email,
                name: p.name,
                isExistingUser: true
              }))
            }))
            
            // If jumping to email step, set the email list
            if (initialStep === 4) {
              const emails = participants.map((p: any) => p.email).join(', ')
              // This will be set after emailSubject is set
              setTimeout(() => {
                const emailField = document.querySelector('[data-email-addresses]') as HTMLInputElement
                if (emailField) emailField.value = emails
              }, 100)
            }
          }
        } catch (error) {
          console.error('Failed to load campaign participants:', error)
        }
      }
      
      loadCampaignParticipants()
      
      setCampaignData({
        toolId: metadata.toolId || toolId,
        toolTitle: metadata.toolName || toolTitle,
        toolPath: metadata.toolPath || toolPath,
        toolGradient,
        toolIcon,
        campaignName: editingCampaign.name,
        participants: [], // Will be populated from API above
        startDate: editingCampaign.startDate ? new Date(editingCampaign.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        deadline: editingCampaign.endDate ? new Date(editingCampaign.endDate).toISOString().split('T')[0] : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        customMessage: metadata.message || ''
      })
      
      // Set campaign link if available
      if (metadata.campaignLink) {
        setCampaignLink(metadata.campaignLink)
      }
      
      // If we're jumping to the email step, populate the email helper data
      if (initialStep === 4) {
        // Generate email helper content for existing campaign
        const link = metadata.campaignLink || `${window.location.origin}/assessment/${metadata.campaignCode || editingCampaign.id}`
        setCampaignLink(link)
        setEmailSubject(`Action Required: Complete Your ${metadata.toolName || toolTitle}`)
        setEmailTemplate(`Hi team,

I've set up an assessment for our team to better understand how we can improve our ${(metadata.toolName || toolTitle).toLowerCase().replace('assessment', '').trim()} processes.

Please take 5 minutes to complete this assessment by ${editingCampaign.endDate ? new Date(editingCampaign.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'soon'}:
${link}

Your responses are confidential and will help us identify areas for improvement and better support our team's needs.

Thanks for your participation!

Best,
${user?.firstName || 'Your Name'}`)
      }
    } 
    // Otherwise check for saved draft
    else {
      const savedDraft = localStorage.getItem('campaignDraft')
      const savedToolId = localStorage.getItem('campaignDraftTool')
      
      if (savedDraft && savedToolId === toolId) {
        try {
          const draft = JSON.parse(savedDraft)
          setCampaignData(draft)
            // Update selected users based on draft
          const selectedIds = new Set<string>(draft.participants.filter((p: any) => p.isExistingUser).map((p: any) => p.userId))
          setSelectedExistingUsers(selectedIds)
          // Clear the draft
          localStorage.removeItem('campaignDraft')
          localStorage.removeItem('campaignDraftTool')
        } catch (error) {
          console.error('Error loading draft:', error)
        }
      }
    }
    
    // Load participants
    loadParticipants()
  }, [toolId, editingCampaign, organization])
  
  const loadParticipants = async () => {
    setLoadingUsers(true)
    try {
      const allUsers: any[] = []
      const emailSet = new Set<string>()
      
      // Fetch Clerk members if organization is available
      if (organization) {
        try {
          const membershipList = await organization.getMemberships()
          const clerkMembers = membershipList.data as any[]
          
          // Add Clerk members first (they take priority)
          clerkMembers.forEach(member => {
            const fullName = [
              member.publicUserData.firstName,
              member.publicUserData.lastName
            ].filter(Boolean).join(' ') || member.publicUserData.identifier.split('@')[0]
            
            allUsers.push({
              id: member.id,
              email: member.publicUserData.identifier,
              name: fullName,
              department: null,
              isActive: true,
              isClerkUser: true,
              role: member.role
            })
            emailSet.add(member.publicUserData.identifier.toLowerCase())
          })
        } catch (error) {
          console.error('Error fetching Clerk members:', error)
        }
      }
      
      // Fetch participants from API
      const response = await fetch('/api/company/users/v2', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Add participants that aren't already Clerk members
        data.users?.forEach((user: any) => {
          if (!emailSet.has(user.email.toLowerCase())) {
            let displayName = ''
            if (user.firstName && user.lastName && user.firstName !== user.lastName) {
              displayName = `${user.firstName} ${user.lastName}`.trim()
            } else if (user.firstName) {
              displayName = user.firstName
            } else {
              displayName = user.email.split('@')[0]
            }
            
            allUsers.push({
              id: user.email, // Use email as ID for participants
              email: user.email,
              name: displayName,
              department: user.department || null,
              isActive: user.status === 'active' || user.status === 'ACTIVE' || user.status === 'COMPLETED',
              isClerkUser: false,
              role: 'participant'
            })
          }
        })
      }
      
      setExistingUsers(allUsers)
    } catch (error) {
      console.error('Error loading participants:', error)
      showError('Failed to load participants')
    } finally {
      setLoadingUsers(false)
    }
  }
  
  // Get unique departments from users
  const departments = [...new Set(existingUsers
    .map(u => u.department)
    .filter(Boolean)
  )].sort()
  
  // Filter users based on search and department
  const filteredUsers = existingUsers.filter(user => {
    const matchesSearch = userSearchTerm === '' || 
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchTerm.toLowerCase())
    
    const matchesDepartment = selectedDepartment === 'all' ||
      (selectedDepartment === 'none' && !user.department) ||
      user.department === selectedDepartment
    
    return matchesSearch && matchesDepartment
  })
  
  const handleToggleExistingUser = (userId: string) => {
    const newSelected = new Set(selectedExistingUsers)
    const user = existingUsers.find(u => u.id === userId)
    
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
      // Remove from participants
      setCampaignData(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.userId !== userId)
      }))
    } else {
      newSelected.add(userId)
      // Add to participants
      if (user) {
        setCampaignData(prev => ({
          ...prev,
          participants: [...prev.participants, {
            email: user.email,
            name: user.name,
            isExistingUser: true,
            userId: user.id
          }]
        }))
      }
    }
    
    setSelectedExistingUsers(newSelected)
    
    // Update select all state
    if (newSelected.size === filteredUsers.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }
  
  const handleSelectAll = () => {
    if (selectAll) {
      // Deselect all filtered users
      const newSelected = new Set(selectedExistingUsers)
      filteredUsers.forEach(user => {
        newSelected.delete(user.id)
      })
      setSelectedExistingUsers(newSelected)
      
      // Remove from participants
      setCampaignData(prev => ({
        ...prev,
        participants: prev.participants.filter(p => !filteredUsers.find(u => u.id === p.userId))
      }))
      
      setSelectAll(false)
    } else {
      // Select all filtered users
      const newSelected = new Set(selectedExistingUsers)
      const newParticipants: Participant[] = []
      
      filteredUsers.forEach(user => {
        newSelected.add(user.id)
        // Only add if not already in participants
        if (!campaignData.participants.find(p => p.userId === user.id)) {
          newParticipants.push({
            email: user.email,
            name: user.name,
            isExistingUser: true,
            userId: user.id
          })
        }
      })
      
      setSelectedExistingUsers(newSelected)
      setCampaignData(prev => ({
        ...prev,
        participants: [...prev.participants, ...newParticipants]
      }))
      
      setSelectAll(true)
    }
  }
  
  const handleRemoveParticipant = (email: string) => {
    const participant = campaignData.participants.find(p => p.email === email)
    
    if (participant?.isExistingUser && participant.userId) {
      // Also update selectedExistingUsers
      const newSelected = new Set(selectedExistingUsers)
      newSelected.delete(participant.userId)
      setSelectedExistingUsers(newSelected)
    }
    
    setCampaignData(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.email !== email)
    }))
  }
  
  const handleLaunchCampaign = async () => {
    setIsLoading(true)
    
    try {
      // For editing campaigns, we'd need to update the existing campaign
      // This would require an update API endpoint
      // For now, we'll note that certain fields shouldn't be editable after campaign creation
      if (editingCampaign) {
        // TODO: Implement campaign update API
        showError('Campaign editing functionality is being implemented')
        setIsLoading(false)
        return
      }
      
      const response = await fetch('/api/campaigns/launch/v3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          toolId: campaignData.toolId,
          toolName: campaignData.toolTitle,
          toolPath: campaignData.toolPath,
          campaignName: campaignData.campaignName,
          customMessage: campaignData.customMessage,
          startDate: new Date(campaignData.startDate).toISOString(),
          deadline: new Date(campaignData.deadline).toISOString(),
          participants: campaignData.participants.map(p => ({
            email: p.email,
            name: p.name
          })),
          senderEmail: user?.primaryEmailAddress?.emailAddress,
          companyName: organization?.name
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || 'Failed to launch campaign'
        throw new Error(errorMessage)
      }
      
      const result = await response.json()
      
      // Store email helper data
      setEmailSubject(result.emailHelper?.emailSubject || `Action Required: Complete Your ${campaignData.toolTitle}`)
      setEmailTemplate(result.emailHelper?.emailTemplate || '')
      setCampaignLink(result.summary?.campaignLink || '')
      
      // Show success and stay on step 4 with email helper data
      const inviteCount = result.summary?.invitationsCreated || result.summary?.totalParticipants || 0
      showSuccess(`Assessment created! ${inviteCount} participant${inviteCount !== 1 ? 's' : ''} added.`)
      
      // Stay on step 4 to show the email helper
      setCurrentStep(4)
      
    } catch (error) {
      console.error('Campaign launch error:', error)
      showError(error instanceof Error ? error.message : 'Failed to launch campaign')
    } finally {
      setIsLoading(false)
    }
  }
  
  const copyEmails = () => {
    const emailList = campaignData.participants.map(p => p.email).join(', ')
    navigator.clipboard.writeText(emailList)
    setCopiedEmails(true)
    setTimeout(() => setCopiedEmails(false), 2000)
  }
  
  const copyTemplate = () => {
    navigator.clipboard.writeText(emailTemplate)
    setCopiedTemplate(true)
    setTimeout(() => setCopiedTemplate(false), 2000)
  }
  
  const copySubject = () => {
    navigator.clipboard.writeText(emailSubject)
    setCopiedSubject(true)
    setTimeout(() => setCopiedSubject(false), 2000)
  }
  
  const copyLink = () => {
    navigator.clipboard.writeText(campaignLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }
  
  const renderStepIndicator = () => {
    const steps = ['Participants', 'Details', 'Review', 'Send']
    const totalSteps = steps.length
    
    return (
      <div className="flex items-center justify-between mb-8">
        {steps.map((label, index) => {
          const stepNumber = index + 1
          return (
            <div key={stepNumber} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= stepNumber
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white'
                      : 'bg-white/10 text-white/50 border border-white/20'
                  }`}
                >
                  {currentStep > stepNumber ? <Check className="w-5 h-5" /> : stepNumber}
                </div>
                <span className={`ml-3 font-medium ${
                  currentStep >= stepNumber ? 'text-white' : 'text-white/50'
                }`}>
                  {label}
                </span>
              </div>
              {stepNumber < totalSteps && (
                <div className={`flex-1 h-0.5 mx-4 ${
                  currentStep > stepNumber ? 'bg-purple-600' : 'bg-white/10'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    )
  }
  
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Who should take this assessment?</h3>
        <p className="text-white/70">Select team members from your participant list.</p>
      </div>
      
      {/* Existing Users Section */}
      {loadingUsers ? (
        <div className="bg-white/5 rounded-lg border border-white/10 p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-white/50 mr-3" />
            <span className="text-white/60">Loading team members...</span>
          </div>
        </div>
      ) : existingUsers.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-medium text-white">Team Members</h4>
            <span className="text-sm text-white/60">
              {selectedExistingUsers.size} of {existingUsers.length} selected
            </span>
          </div>
          
          {/* Search and Controls */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 text-sm"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-4 h-4 text-white/40 pointer-events-none" />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 text-sm appearance-none cursor-pointer"
              >
                <option value="all" className="bg-gray-900">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept} className="bg-gray-900">{dept}</option>
                ))}
                {departments.length > 0 && (
                  <option key="none" value="none" className="bg-gray-900">No Department</option>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-white/40 pointer-events-none" />
            </div>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm font-medium transition-colors"
            >
              {selectAll ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          
          {/* Users List with Better Scrolling */}
          <div className="bg-white/5 rounded-lg border border-white/10">
            {loadingUsers ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/50 mx-auto" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-white/50">
                No users found matching "{userSearchTerm}"
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <div className="sticky top-0 bg-white/10 backdrop-blur-sm border-b border-white/10 px-3 py-2">
                  <div className="flex items-center text-xs text-white/60 uppercase tracking-wider">
                    <div className="w-8"></div>
                    <div className="flex-1 ml-3">Name / Email / Role</div>
                    <div className="w-32 text-right">Department</div>
                  </div>
                </div>
                <div className="divide-y divide-white/5">
                  {filteredUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center px-3 py-2.5 hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExistingUsers.has(user.id)}
                        onChange={() => handleToggleExistingUser(user.id)}
                        className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                      />
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                            {(() => {
                              if (!user.name) return 'U'
                              const parts = user.name.split(' ')
                              const first = parts[0]?.[0] || ''
                              const second = parts[1]?.[0] || ''
                              return (first + second).toUpperCase() || 'U'
                            })()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium text-sm truncate">{user.name || 'Unnamed User'}</span>
                              {user.isClerkUser && (
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                  user.role === 'org:admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                                }`}>
                                  {user.role === 'org:admin' ? 'Admin' : 'Member'}
                                </span>
                              )}
                              {!user.isClerkUser && (
                                <span className="px-1.5 py-0.5 bg-gray-500/20 text-gray-300 rounded text-xs font-medium">
                                  Participant
                                </span>
                              )}
                            </div>
                            <div className="text-white/50 text-xs truncate">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="w-32 text-right">
                        {user.department && (
                          <span className="inline-flex px-2 py-1 bg-white/10 rounded text-xs text-white/70">
                            {user.department}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {existingUsers.length > 10 && (
            <p className="text-xs text-white/50 mt-2">
              Tip: Use search to quickly find specific team members
            </p>
          )}
        </div>
      ) : (
        <div className="bg-white/5 rounded-lg border border-white/10 p-8">
          <div className="text-center">
            <Users className="w-12 h-12 text-white/40 mx-auto mb-3" />
            <p className="text-white/60">No participants found</p>
            <p className="text-white/40 text-sm mt-2">Add participants in the Users tab first</p>
          </div>
        </div>
      )}
      
      {/* Link to Add New Participants */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-blue-300 text-sm font-medium mb-1">Need to add someone new?</p>
            <p className="text-blue-300/80 text-sm mb-3">
              Add new team members in the Users tab first, then return here to include them in your campaign.
            </p>
            <button
              onClick={() => {
                // Save draft state to localStorage
                localStorage.setItem('campaignDraft', JSON.stringify(campaignData))
                localStorage.setItem('campaignDraftTool', toolId)
                // Navigate to users tab
                router.push('/dashboard/users')
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Users className="w-4 h-4" />
              Go to Users Tab
            </button>
          </div>
        </div>
      </div>
      
      {/* Selected Participants List */}
      {campaignData.participants.length > 0 && (
        <div>
          <h4 className="text-lg font-medium text-white mb-3">
            Selected Participants ({campaignData.participants.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {campaignData.participants.map((participant) => (
              <div
                key={participant.email}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-white/50" />
                  <div>
                    <span className="text-white font-medium">{participant.name}</span>
                    <span className="text-white/60 text-sm ml-2">{participant.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveParticipant(participant.email)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-white/50 hover:text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
  
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Campaign Details</h3>
        <p className="text-white/70">
          {editingCampaign 
            ? 'Update the campaign details. Note: Some fields cannot be changed after campaign creation.'
            : 'Set the name and timeline for your assessment campaign.'}
        </p>
      </div>
      
      <div>
        <label className="block text-white mb-2 font-medium">Campaign Name</label>
        <input
          type="text"
          value={campaignData.campaignName}
          onChange={(e) => setCampaignData(prev => ({ ...prev, campaignName: e.target.value }))}
          placeholder="e.g., Q3 2024 HR Partnership Assessment"
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white mb-2 font-medium">
            <Calendar className="w-4 h-4 inline mr-2" />
            Start Date
          </label>
          <input
            type="date"
            value={campaignData.startDate}
            onChange={(e) => setCampaignData(prev => ({ ...prev, startDate: e.target.value }))}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
          />
        </div>
        
        <div>
          <label className="block text-white mb-2 font-medium">
            <Clock className="w-4 h-4 inline mr-2" />
            Deadline
          </label>
          <input
            type="date"
            value={campaignData.deadline}
            onChange={(e) => setCampaignData(prev => ({ ...prev, deadline: e.target.value }))}
            min={campaignData.startDate}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40"
          />
        </div>
      </div>
      
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <p className="text-blue-300 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          Participants will have from {new Date(campaignData.startDate).toLocaleDateString()} to {new Date(campaignData.deadline).toLocaleDateString()} to complete the assessment.
        </p>
      </div>
    </div>
  )
  
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-white mb-2">Review & Launch</h3>
        <p className="text-white/70">Review your campaign details before creating the assessment.</p>
      </div>
      
      <div className="space-y-4">
        {/* Assessment */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${campaignData.toolGradient}`}>
              {campaignData.toolIcon}
            </div>
            <div>
              <p className="text-white/60 text-sm">Assessment</p>
              <p className="text-white font-semibold">{campaignData.toolTitle}</p>
            </div>
          </div>
        </div>
        
        {/* Campaign Name */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-white/60 text-sm mb-1">Campaign Name</p>
          <p className="text-white font-semibold">{campaignData.campaignName}</p>
        </div>
        
        {/* Timeline */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-white/60 text-sm mb-1">Timeline</p>
          <p className="text-white">
            <span className="font-semibold">{new Date(campaignData.startDate).toLocaleDateString()}</span>
            {' to '}
            <span className="font-semibold">{new Date(campaignData.deadline).toLocaleDateString()}</span>
          </p>
        </div>
        
        {/* Participants */}
        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
          <p className="text-white/60 text-sm mb-3">
            Participants ({campaignData.participants.length})
          </p>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {campaignData.participants.map((p) => (
              <div key={p.email} className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-white/50" />
                <span className="text-white">{p.name}</span>
                <span className="text-white/60">({p.email})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-300 text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          <strong>Ready to launch?</strong> Click continue to create the assessment and get your email template.
        </p>
      </div>
    </div>
  )
  
  const renderStep4 = () => {
    // If we haven't launched yet, show the message input
    if (!emailSubject) {
      return (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">Custom Message</h3>
            <p className="text-white/70">Add a personal message to include in the invitation email (optional).</p>
          </div>
          
          <div>
            <label className="block text-white mb-2 font-medium">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Your Message
            </label>
            <textarea
              value={campaignData.customMessage}
              onChange={(e) => setCampaignData(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder={`Hi team,

I'd like you to complete this assessment to help us better understand your needs and how we can support you.

Thanks!`}
              rows={8}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 resize-none"
            />
          </div>
          
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
            <p className="text-purple-300 text-sm">
              <Mail className="w-4 h-4 inline mr-2" />
              This message will be included in the invitation email along with instructions on how to complete the assessment.
            </p>
          </div>
        </div>
      )
    }
    
    // After launch, show the email helper
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-2">Send Assessment Invitations</h3>
          <p className="text-white/70">Copy the email addresses and template to send via your email client.</p>
      </div>
      
      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium mb-2">How to send invitations:</p>
            <ol className="text-blue-300/80 text-sm space-y-1 list-decimal list-inside">
              <li>Copy the email addresses below</li>
              <li>Copy the email template</li>
              <li>Open your email client (Gmail, Outlook, etc.)</li>
              <li>Paste the addresses in the "To" or "BCC" field</li>
              <li>Paste and customize the template</li>
              <li>Send!</li>
            </ol>
          </div>
        </div>
      </div>
      
      {/* Email Addresses */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white font-medium">Participant Email Addresses</label>
          <button
            onClick={copyEmails}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
          >
            {copiedEmails ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Emails
              </>
            )}
          </button>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-lg p-3">
          <p className="text-white/90 text-sm font-mono break-all">
            {campaignData.participants.map(p => p.email).join(', ')}
          </p>
        </div>
      </div>
      
      {/* Email Subject */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white font-medium">Email Subject</label>
          <button
            onClick={copySubject}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
          >
            {copiedSubject ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Subject
              </>
            )}
          </button>
        </div>
        <input
          type="text"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
        />
      </div>
      
      {/* Email Template */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white font-medium">Email Template</label>
          <button
            onClick={copyTemplate}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
          >
            {copiedTemplate ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Template
              </>
            )}
          </button>
        </div>
        <textarea
          value={emailTemplate}
          onChange={(e) => setEmailTemplate(e.target.value)}
          rows={10}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-white/40 resize-none"
        />
      </div>
      
      {/* Campaign Link */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-white font-medium">Campaign Link</label>
          <button
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white text-sm transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Link
              </>
            )}
          </button>
        </div>
        <div className="bg-white/10 border border-white/20 rounded-lg p-3">
          <p className="text-white/90 font-mono text-xs break-all">{campaignLink}</p>
        </div>
        <p className="text-white/50 text-xs mt-2">This link is already included in the email template above</p>
      </div>
    </div>
    )
  }
  
  return (
    <div className="bg-gradient-to-br from-gray-900/50 via-purple-900/50 to-indigo-900/50 rounded-2xl shadow-xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${toolGradient} text-white`}>
                {toolIcon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingCampaign ? 'Edit' : 'Launch'} {toolTitle}
                </h2>
                <p className="text-white/70">
                  {editingCampaign ? 'Update your assessment campaign' : 'Create a new assessment campaign'}
                </p>
              </div>
            </div>
            <div className="text-sm text-white/60">
              Step {currentStep} of 4
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStepIndicator()}
          
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            
            {currentStep === 3 ? (
              <button
                onClick={handleLaunchCampaign}
                disabled={isLoading || campaignData.participants.length === 0}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Launch Assessment
                  </>
                )}
              </button>
            ) : currentStep === 4 ? (
              emailSubject ? (
              <button
                onClick={onClose}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Done
              </button>
              ) : (
                <button
                  onClick={handleLaunchCampaign}
                  disabled={isLoading || campaignData.participants.length === 0}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Launch & Get Email Template
                    </>
                  )}
                </button>
              )
            ) : (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 1 && campaignData.participants.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
        </div>
      </div>
    </div>
  )
}