'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useOrganization, useUser } from '@clerk/nextjs'
import { Edit2, Trash2, UserPlus, Mail, Shield, Calendar, CheckCircle, UserCheck, Clock, AlertCircle, Plus, ChevronDown, ChevronUp, X, Loader2, Upload, Download, Check } from 'lucide-react'

interface OrganizationMember {
  id: string
  role: string
  createdAt: string
  publicUserData: {
    userId: string
    firstName: string | null
    lastName: string | null
    profileImageUrl: string | null
    identifier: string
  }
}

interface Participant {
  id: string
  name: string
  email: string
  status: 'new' | 'invited' | 'active'
  department?: string
  joinedDate: string
}

type UnifiedUser = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Member' | 'Participant'
  status: 'Active' | 'Invited' | 'New'
  createdAt: string
  isClerkUser: boolean
  profileImageUrl?: string | null
  department?: string
}

interface ParticipantRow {
  id: string
  name: string
  email: string
  role: 'participant' | 'member' | 'admin'
  nameError: boolean
  emailError: boolean
}

export default function UsersPage() {
  const { organization, membership } = useOrganization()
  const { user } = useUser()
  const [unifiedUsers, setUnifiedUsers] = useState<UnifiedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  
  // Add user functionality
  const [showAddSection, setShowAddSection] = useState(false)
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')
  const [isAddingParticipants, setIsAddingParticipants] = useState(false)
  const [addingProgress, setAddingProgress] = useState({ current: 0, total: 0 })
  const [participantRows, setParticipantRows] = useState<ParticipantRow[]>([{
    id: Date.now().toString(),
    name: '',
    email: '',
    role: 'participant',
    nameError: false,
    emailError: false
  }])
  const nameInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [isMounted, setIsMounted] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const lastOrganizationIdRef = useRef<string | null>(null)

  useEffect(() => {
    setIsMounted(true)
    const currentOrgId = organization?.id
    
    // Only fetch if organization ID has changed and we're not currently fetching
    if (currentOrgId && currentOrgId !== lastOrganizationIdRef.current && !isFetching) {
      lastOrganizationIdRef.current = currentOrgId
      fetchAllUsers()
    }
  }, [organization?.id]) // Only depend on organization ID
  
  // Close dropdown when clicking outside, scrolling, or resizing
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId && dropdownRefs.current[openDropdownId]) {
        const target = event.target as Node
        const dropdownEl = dropdownRefs.current[openDropdownId]
        // Check if click is on the dropdown button or the portal dropdown menu
        const isDropdownButton = dropdownEl?.contains(target)
        const isDropdownMenu = (target as HTMLElement)?.closest('.dropdown-menu-portal')
        
        if (!isDropdownButton && !isDropdownMenu) {
          setOpenDropdownId(null)
        }
      }
    }
    
    const handleScroll = () => {
      if (openDropdownId) {
        setOpenDropdownId(null)
      }
    }
    
    const handleResize = () => {
      if (openDropdownId) {
        setOpenDropdownId(null)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleResize)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [openDropdownId])

  const fetchAllUsers = async (showLoading = true) => {
    if (!organization) {
      setLoading(false)
      return
    }

    // Prevent concurrent fetches
    if (isFetching) {
      return
    }

    try {
      setIsFetching(true)
      if (showLoading) {
        setLoading(true)
      }
      
      // Fetch Clerk members
      const membershipList = await organization.getMemberships()
      const clerkMembers = membershipList.data as unknown as OrganizationMember[]
      
      // Fetch participants from API
      const participantsResponse = await fetch('/api/company/users/v2')
      let participants: Participant[] = []
      if (participantsResponse.ok) {
        const data = await participantsResponse.json()
        participants = data.users?.map((user: any) => {
          let displayName = ''
          if (user.firstName && user.lastName && user.firstName !== user.lastName) {
            displayName = `${user.firstName} ${user.lastName}`.trim()
          } else if (user.firstName) {
            displayName = user.firstName
          } else {
            displayName = user.email.split('@')[0]
          }
          
          return {
            id: user.email,
            name: displayName,
            email: user.email,
            status: user.status || 'new',
            department: user.department || '',
            joinedDate: new Date(user.createdAt || Date.now()).toISOString()
          }
        }) || []
      }
      
      // Merge and deduplicate users
      const unified: UnifiedUser[] = []
      const emailSet = new Set<string>()
      
      // Add Clerk members first (they take priority)
      clerkMembers.forEach(member => {
        const fullName = [
          member.publicUserData.firstName,
          member.publicUserData.lastName
        ].filter(Boolean).join(' ') || 'No name'
        
        unified.push({
          id: member.id,
          name: fullName,
          email: member.publicUserData.identifier,
          role: formatRole(member.role) as 'Admin' | 'Member',
          status: 'Active',
          createdAt: member.createdAt,
          isClerkUser: true,
          profileImageUrl: member.publicUserData.profileImageUrl
        })
        emailSet.add(member.publicUserData.identifier.toLowerCase())
      })
      
      // Add participants that aren't already Clerk members
      participants.forEach(participant => {
        if (!emailSet.has(participant.email.toLowerCase())) {
          unified.push({
            id: participant.id,
            name: participant.name,
            email: participant.email,
            role: 'Participant',
            status: participant.status === 'invited' ? 'Invited' : participant.status === 'active' ? 'Active' : 'New',
            createdAt: participant.joinedDate,
            isClerkUser: false,
            department: participant.department
          })
        }
      })
      
      setUnifiedUsers(unified)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUnifiedUsers([])
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }

  const handleRemoveUser = async (user: UnifiedUser) => {
    if (!organization) return
    
    if (!confirm(`Are you sure you want to remove ${user.name}?`)) return
    
    try {
      if (user.isClerkUser) {
        // Remove Clerk member
        await organization.removeMember(user.id)
      } else {
        // Remove participant via API
        const response = await fetch('/api/company/users/v2', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email })
        })
        if (!response.ok) throw new Error('Failed to remove participant')
      }
      await fetchAllUsers(false) // Don't show loading when refreshing after user removal
    } catch (error) {
      console.error('Error removing user:', error)
      alert('Failed to remove user')
    }
  }
  
  // TODO: Implement participant to member conversion
  // When a participant completes an assessment and creates an account:
  // 1. They sign up/sign in via Clerk
  // 2. Link their Clerk account to their participant data via email
  // 3. Transfer their assessment results to their Clerk profile
  // 4. Update their role from 'Participant' to 'Member'
  const handleConvertParticipant = async (participantEmail: string) => {
    // This would be triggered when a participant claims their profile
    // Implementation depends on Clerk's invitation/signup flow
  }
  
  // Add user functions
  const addParticipantRow = () => {
    const newId = Date.now().toString()
    setParticipantRows([...participantRows, {
      id: newId,
      name: '',
      email: '',
      role: 'participant',
      nameError: false,
      emailError: false
    }])
    
    setTimeout(() => {
      nameInputRefs.current[newId]?.focus()
    }, 50)
  }
  
  const removeParticipantRow = (id: string) => {
    if (participantRows.length > 1) {
      setParticipantRows(participantRows.filter(row => row.id !== id))
    }
  }
  
  const updateParticipantRow = (id: string, field: string, value: string) => {
    setParticipantRows(participantRows.map(row => {
      if (row.id === id) {
        const updated = { ...row, [field]: value }
        if (field === 'name' && value) updated.nameError = false
        if (field === 'email' && value) updated.emailError = false
        return updated
      }
      return row
    }))
  }
  
  const handleKeyDown = (e: React.KeyboardEvent, rowId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const currentRow = participantRows.find(row => row.id === rowId)
      
      if (!currentRow) return
      
      if (currentRow.name && currentRow.email) {
        addParticipantRow()
      } else {
        setParticipantRows(participantRows.map(row => {
          if (row.id === rowId) {
            return {
              ...row,
              nameError: !row.name,
              emailError: !row.email
            }
          }
          return row
        }))
      }
    }
  }
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }
  
  const handleAddParticipants = async () => {
    const validParticipants = participantRows.filter(row => row.name && row.email)
    
    if (validParticipants.length === 0) {
      alert('Please fill in at least one user with name and email')
      return
    }
    
    setIsAddingParticipants(true)
    setAddingProgress({ current: 0, total: validParticipants.length })
    
    try {
      let successCount = 0
      
      for (let i = 0; i < validParticipants.length; i++) {
        const participant = validParticipants[i]
        setAddingProgress({ current: i + 1, total: validParticipants.length })
        
        // Different endpoints based on role
        const endpoint = participant.role === 'participant' 
          ? '/api/company/invite' 
          : '/api/company/invite-member'
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emails: [participant.email],
            name: participant.name,
            role: participant.role,
            senderEmail: user?.primaryEmailAddress?.emailAddress || '',
            company: organization?.name || user?.primaryEmailAddress?.emailAddress?.split('@')[1] || '',
            message: participant.role === 'participant'
              ? undefined  // Participants don't get welcome emails
              : `You've been invited to join ${organization?.name || 'our team'} on Campfire`
          })
        })
        
        if (response.ok) {
          successCount++
        } else {
          console.error(`Failed to add user ${participant.email}`)
        }
      }
      
      await fetchAllUsers(false) // Don't show loading when refreshing after adding participants
      
      setParticipantRows([{
        id: Date.now().toString(),
        name: '',
        email: '',
        role: 'participant',
        nameError: false,
        emailError: false
      }])
      setShowAddSection(false)
      
      if (successCount > 0) {
        console.log(`Successfully added ${successCount} user(s)`)
      }
    } catch (error) {
      console.error('Failed to add users:', error)
      alert('Failed to add some users. Please try again.')
    } finally {
      setIsAddingParticipants(false)
      setAddingProgress({ current: 0, total: 0 })
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Member':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Participant':
        return 'bg-gray-100 text-gray-700 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <UserCheck className="w-4 h-4 text-green-500" />
      case 'Invited':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'New':
        return <AlertCircle className="w-4 h-4 text-gray-400" />
      default:
        return null
    }
  }

  const formatRole = (role: string) => {
    // Remove "org:" prefix if present and capitalize first letter
    const cleanRole = role.replace('org:', '')
    return cleanRole.charAt(0).toUpperCase() + cleanRole.slice(1).toLowerCase()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getDropdownPosition = (rowId: string) => {
    const element = dropdownRefs.current[rowId]
    if (!element) return { top: 0, left: 0, width: 0 }
    
    const rect = element.getBoundingClientRect()
    return {
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width
    }
  }

  if (!organization) {
    return (
      <div className="text-center py-12">
        <p className="text-white/60">No organization selected</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Users</h2>
          <p className="text-white/60 mt-1">Manage your team members and their permissions</p>
        </div>
      </div>

      {/* Add Users Section - Collapsible */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 mb-6 overflow-visible">
        <button
          onClick={() => setShowAddSection(!showAddSection)}
          className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-purple-400" />
            <span className="font-medium text-white">Add Users</span>
          </div>
          {showAddSection ? (
            <ChevronUp className="w-5 h-5 text-white/40" />
          ) : (
            <ChevronDown className="w-5 h-5 text-white/40" />
          )}
        </button>

        {showAddSection && (
          <div className="border-t border-white/10 p-6 overflow-visible relative">
            {/* Header row with labels */}
            <div className="grid grid-cols-12 gap-4 mb-2">
              <div className="col-span-4">
                <label className="block text-sm font-medium text-white/80">Name *</label>
              </div>
              <div className="col-span-4">
                <label className="block text-sm font-medium text-white/80">Email *</label>
              </div>
              <div className="col-span-3">
                <label className="block text-sm font-medium text-white/80">Role</label>
              </div>
              <div className="col-span-1"></div>
            </div>
            
            {/* User rows */}
            <div className="space-y-2 relative" style={{ zIndex: 1 }}>
              {participantRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <input
                      ref={(el) => { nameInputRefs.current[row.id] = el }}
                      type="text"
                      value={row.name}
                      onChange={(e) => updateParticipantRow(row.id, 'name', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id)}
                      placeholder={row.nameError ? 'Name required' : 'John Doe'}
                      disabled={isAddingParticipants}
                      className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors ${
                        row.nameError ? 'border-red-500 placeholder-red-400' : 'border-white/20 placeholder-white/40'
                      } ${isAddingParticipants ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="email"
                      value={row.email}
                      onChange={(e) => updateParticipantRow(row.id, 'email', e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, row.id)}
                      onBlur={(e) => {
                        if (e.target.value && !validateEmail(e.target.value)) {
                          updateParticipantRow(row.id, 'emailError', 'true')
                        }
                      }}
                      placeholder={row.emailError ? 'Email required' : 'john@example.com'}
                      disabled={isAddingParticipants}
                      className={`w-full px-4 py-2 bg-white/10 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors ${
                        row.emailError ? 'border-red-500 placeholder-red-400' : 'border-white/20 placeholder-white/40'
                      } ${isAddingParticipants ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative z-50" ref={(el) => { dropdownRefs.current[row.id] = el }}>
                      <button
                        type="button"
                        onClick={() => setOpenDropdownId(openDropdownId === row.id ? null : row.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            setOpenDropdownId(openDropdownId === row.id ? null : row.id)
                          } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                            e.preventDefault()
                            setOpenDropdownId(row.id)
                          } else if (e.key === 'Tab') {
                            setOpenDropdownId(null)
                          }
                        }}
                        disabled={isAddingParticipants}
                        className={`w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all ${
                          isAddingParticipants ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/20'
                        }`}
                      >
                        <span className="capitalize">
                          {row.role === 'participant' && '✓ Participant'}
                          {row.role === 'member' && 'Member'}
                          {row.role === 'admin' && 'Admin'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform ${
                          openDropdownId === row.id ? 'rotate-180' : ''
                        }`} />
                      </button>
                      
                      {/* Custom Dropdown Menu Portal */}
                      {openDropdownId === row.id && isMounted && createPortal(
                        <div 
                          className="dropdown-menu-portal fixed z-[9999] bg-gray-900/95 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl overflow-hidden"
                          style={{
                            top: getDropdownPosition(row.id).top,
                            left: getDropdownPosition(row.id).left,
                            width: getDropdownPosition(row.id).width,
                            maxHeight: '300px'
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              updateParticipantRow(row.id, 'role', 'participant')
                              setOpenDropdownId(null)
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                              row.role === 'participant' ? 'bg-white/5' : ''
                            }`}
                          >
                            <div>
                              <div className="text-white font-medium">Participant</div>
                              <div className="text-white/60 text-xs mt-0.5">No welcome email</div>
                            </div>
                            {row.role === 'participant' && (
                              <Check className="w-4 h-4 text-purple-400" />
                            )}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              updateParticipantRow(row.id, 'role', 'member')
                              setOpenDropdownId(null)
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between border-t border-white/10 ${
                              row.role === 'member' ? 'bg-white/5' : ''
                            }`}
                          >
                            <div>
                              <div className="text-white font-medium">Member</div>
                              <div className="text-white/60 text-xs mt-0.5">Gets platform access</div>
                            </div>
                            {row.role === 'member' && (
                              <Check className="w-4 h-4 text-blue-400" />
                            )}
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              updateParticipantRow(row.id, 'role', 'admin')
                              setOpenDropdownId(null)
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between border-t border-white/10 ${
                              row.role === 'admin' ? 'bg-white/5' : ''
                            }`}
                          >
                            <div>
                              <div className="text-white font-medium">Admin</div>
                              <div className="text-white/60 text-xs mt-0.5">Full dashboard access</div>
                            </div>
                            {row.role === 'admin' && (
                              <Check className="w-4 h-4 text-orange-400" />
                            )}
                          </button>
                        </div>,
                        document.body
                      )}
                    </div>
                  </div>
                  <div className="col-span-1 flex gap-1">
                    {index === participantRows.length - 1 ? (
                      <button
                        onClick={addParticipantRow}
                        disabled={isAddingParticipants}
                        className={`p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${isAddingParticipants ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Add another user"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => removeParticipantRow(row.id)}
                        disabled={isAddingParticipants}
                        className={`p-2 bg-white/10 text-white/60 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition-colors ${isAddingParticipants ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title="Remove this user"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Help text - Dynamic based on roles */}
            <div className="text-sm text-white/60 mt-4 space-y-1">
              <p>Populate required fields and hit Enter to add a new row, or click the + button</p>
              {participantRows.some(r => r.role === 'participant' && r.name && r.email) && (
                <p className="text-purple-300/80">
                  <span className="font-medium">Participants:</span> Added to assessment pool, no welcome email sent
                </p>
              )}
              {participantRows.some(r => r.role === 'member' && r.name && r.email) && (
                <p className="text-blue-300/80">
                  <span className="font-medium">Members:</span> Will receive welcome email with platform access
                </p>
              )}
              {participantRows.some(r => r.role === 'admin' && r.name && r.email) && (
                <p className="text-orange-300/80">
                  <span className="font-medium">Admins:</span> Will receive welcome email with full dashboard access
                </p>
              )}
            </div>
            
            {/* Submit button and progress */}
            <div className="flex justify-between items-center mt-6">
              {isAddingParticipants && addingProgress.total > 0 && (
                <div className="flex items-center gap-3 text-white/60">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span className="text-sm">
                    Adding user {addingProgress.current} of {addingProgress.total}...
                  </span>
                </div>
              )}
              {!isAddingParticipants && <div />}
              
              <button
                onClick={handleAddParticipants}
                disabled={isAddingParticipants || participantRows.every(row => !row.name || !row.email)}
                className={`px-6 py-2 bg-purple-600 text-white rounded-lg font-medium transition-colors ${
                  isAddingParticipants || participantRows.every(row => !row.name || !row.email)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-purple-700'
                }`}
              >
                {(() => {
                  if (isAddingParticipants) return 'Processing...'
                  const validRows = participantRows.filter(row => row.name && row.email)
                  const participantCount = validRows.filter(r => r.role === 'participant').length
                  const memberCount = validRows.filter(r => r.role === 'member').length
                  const adminCount = validRows.filter(r => r.role === 'admin').length
                  
                  if (validRows.length === 0) return 'Add Users'
                  
                  // If all same type
                  if (participantCount === validRows.length) {
                    return `Add ${participantCount} Participant${participantCount !== 1 ? 's' : ''}`
                  }
                  if (memberCount === validRows.length) {
                    return `Invite ${memberCount} Member${memberCount !== 1 ? 's' : ''}`
                  }
                  if (adminCount === validRows.length) {
                    return `Invite ${adminCount} Admin${adminCount !== 1 ? 's' : ''}`
                  }
                  
                  // Mixed types
                  const parts = []
                  if (participantCount > 0) parts.push(`${participantCount} Participant${participantCount !== 1 ? 's' : ''}`)
                  if (memberCount > 0) parts.push(`${memberCount} Member${memberCount !== 1 ? 's' : ''}`)
                  if (adminCount > 0) parts.push(`${adminCount} Admin${adminCount !== 1 ? 's' : ''}`)
                  
                  return `Add ${parts.join(', ')}`
                })()}
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-white/60">Loading users...</p>
          </div>
        ) : unifiedUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-white/60">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="text-left py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider min-w-[250px]">
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Added
                  </th>
                  <th className="text-right py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {unifiedUsers.map((user) => {
                  const isCurrentUser = user.isClerkUser && membership?.publicUserData?.identifier === user.email
                  
                  // Get initials for avatar (first two letters of first and last name)
                  const getInitials = (name: string) => {
                    const parts = name.split(' ').filter(Boolean)
                    if (parts.length >= 2) {
                      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                    }
                    return name.substring(0, 2).toUpperCase()
                  }
                  
                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium text-sm">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            {isCurrentUser && (
                              <p className="text-xs text-purple-400">You</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className="text-white/80 text-sm">{user.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 min-w-[250px]">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(user.email)
                            setCopiedEmail(user.email)
                            setTimeout(() => setCopiedEmail(null), 2000)
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-all min-w-[120px] ${
                            copiedEmail === user.email 
                              ? 'bg-green-500/20 border border-green-500/40' 
                              : 'bg-white/10 hover:bg-white/20'
                          }`}
                          title="Click to copy email"
                        >
                          {copiedEmail === user.email ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                              <span className="text-green-400 text-sm">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5 text-white/60" />
                              <span className="text-white/80 text-sm truncate">
                                {user.email}
                              </span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-white/40" />
                          <span className="text-white/80 text-sm">
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMember(user.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4 text-white/60 group-hover:text-white" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleRemoveUser(user)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                              title="Remove user"
                            >
                              <Trash2 className="w-4 h-4 text-white/60 group-hover:text-red-400" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}