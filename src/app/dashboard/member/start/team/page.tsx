'use client'

import { useUser } from '@clerk/nextjs'
import { Users, Mail, UserCircle, Edit2, X, Plus, Star, Save } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface UserProfileData {
  firstName: string | null
  lastName: string | null
  role: string | null
  teamName: string | null
  teamEmoji: string | null
  teamPurpose: string | null
  teamSize: string | null
}

interface TeamMember {
  id: string
  name: string
  email: string | null
  role: string | null
  status: string
  createdAt: string
}

interface EditableMember {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  firstNameError?: boolean
  lastNameError?: boolean
}

export default function TeamPage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [teamPurpose, setTeamPurpose] = useState('')
  const [editableMembers, setEditableMembers] = useState<EditableMember[]>([])
  const [savingTeam, setSavingTeam] = useState(false)
  const nameInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
  
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
  }
  
  const startEditing = () => {
    // Convert existing team members to editable format
    const editable = teamMembers.map(member => {
      const nameParts = member.name.split(' ')
      return {
        id: member.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: member.email || '',
        role: member.role || '',
      }
    })
    
    // If no members, start with one empty row
    if (editable.length === 0) {
      editable.push({
        id: `new-${Date.now()}`,
        firstName: '',
        lastName: '',
        email: '',
        role: '',
      })
    }
    
    setEditableMembers(editable)
    setIsEditing(true)
  }
  
  const addTeamMember = () => {
    setEditableMembers([...editableMembers, {
      id: `new-${Date.now()}`,
      firstName: '',
      lastName: '',
      email: '',
      role: '',
    }])
  }
  
  const removeTeamMember = (id: string) => {
    setEditableMembers(editableMembers.filter(m => m.id !== id))
  }
  
  const updateTeamMember = (id: string, field: keyof EditableMember, value: string) => {
    setEditableMembers(prev => prev.map(member => 
      member.id === id 
        ? { ...member, [field]: value, [`${field}Error`]: false }
        : member
    ))
  }
  
  const cancelEditing = () => {
    setIsEditing(false)
    setEditableMembers([])
    // Reset team info
    setTeamName(profile?.teamName || '')
    setTeamPurpose(profile?.teamPurpose || '')
  }
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user profile for team info
        const profileResponse = await fetch('/api/user/profile', {
          credentials: 'include'
        })
        if (profileResponse.ok) {
          const data = await profileResponse.json()
          // Handle both old and new API response formats
          const profileData = data.data?.profile || data.profile
          setProfile(profileData)
          setTeamName(profileData?.teamName || '')
          setTeamPurpose(profileData?.teamPurpose || '')
        }
        
        // Fetch team members
        const teamResponse = await fetch('/api/team/members', {
          credentials: 'include'
        })
        if (teamResponse.ok) {
          const teamData = await teamResponse.json()
          setTeamMembers(teamData.teamMembers || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [])
  
  const handleSaveTeamInfo = async () => {
    try {
      console.log('[Team Page] Saving team info:', { teamName, teamPurpose })
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          teamName,
          teamPurpose,
          partialUpdate: true
        })
      })
      
      console.log('[Team Page] Save response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('[Team Page] Profile after save:', data.profile)
        setProfile(data.profile)
        return true
      } else {
        const errorData = await response.text()
        console.error('[Team Page] Save failed:', errorData)
      }
      return false
    } catch (error) {
      console.error('Error saving team info:', error)
      return false
    }
  }
  
  const saveChanges = async () => {
    setSavingTeam(true)
    try {
      // Validate at least one member has a name
      const validMembers = editableMembers.filter(m => m.firstName.trim() || m.lastName.trim())
      
      // Save team info
      await handleSaveTeamInfo()
      
      // Delete all existing team members
      await fetch('/api/team/members/all', {
        method: 'DELETE',
        credentials: 'include'
      })
      
      // Save new team members
      if (validMembers.length > 0) {
        const membersToSave = validMembers.map(m => ({
          id: m.id,
          name: `${m.firstName.trim()} ${m.lastName.trim()}`.trim(),
          email: m.email || '',
          role: m.role || '',
          status: 'ACTIVE'
        }))
        
        const response = await fetch('/api/team/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ members: membersToSave })
        })
        
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data.teamMembers)
        }
      } else {
        setTeamMembers([])
      }
      
      setIsEditing(false)
      setEditableMembers([])
    } catch (error) {
      console.error('Error saving team:', error)
    } finally {
      setSavingTeam(false)
    }
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Team Header */}
      <div className="flex items-center gap-6 mb-8">
        {/* Team Emoji Avatar */}
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30 flex items-center justify-center flex-shrink-0">
          {profile?.teamEmoji ? (
            <span className="text-6xl animate-bounce-slow">{profile.teamEmoji}</span>
          ) : (
            <Users className="w-12 h-12 text-white" />
          )}
        </div>
        
        {/* Team Name and Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {!isEditing ? (
                <>
                  <h1 className="text-4xl font-bold text-white">
                    {profile?.teamName || 'Your Team'}
                  </h1>
                  {profile?.teamPurpose && (
                    <p className="text-white/80 text-lg mt-2">{profile.teamPurpose}</p>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Team Name"
                    className="text-4xl font-bold bg-transparent border-b-2 border-white/30 text-white placeholder-white/40 focus:outline-none focus:border-white/60 transition-colors pb-1"
                  />
                  <input
                    type="text"
                    value={teamPurpose}
                    onChange={(e) => setTeamPurpose(e.target.value)}
                    placeholder="Team Purpose (optional)"
                    className="text-lg bg-transparent border-b border-white/20 text-white/80 placeholder-white/40 focus:outline-none focus:border-white/40 transition-colors pb-1 w-full"
                  />
                </div>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span className="text-white/60 text-sm">
                  {teamMembers.length + 1} team member{(teamMembers.length + 1) !== 1 ? 's' : ''} • {teamMembers.length > 0 ? `${teamMembers.length} direct reports` : 'No direct reports yet'}
                </span>
              </div>
            </div>
            {!isEditing ? (
              <button
                onClick={startEditing}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelEditing}
                  className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                  disabled={savingTeam}
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={savingTeam}
                >
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">{savingTeam ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
            <Users className="w-6 h-6" />
            Team Members
          </h2>
        </div>
        
        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-white/5 rounded-lg" />
            ))}
          </div>
        ) : !isEditing ? (
          <div className="space-y-3">
            {/* Leader Card - Always First */}
            <Link
              href="/dashboard/member/start/profile"
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm border-2 border-purple-500/30 rounded-lg p-4 hover:from-purple-500/30 hover:to-pink-500/30 transition-all group block"
            >
              <div className="flex items-center gap-4">
                {/* Leader Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 relative">
                  {user?.imageUrl ? (
                    <img 
                      src={user.imageUrl} 
                      alt="Leader" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {((profile?.firstName || user?.firstName || 'L')[0] + 
                        (profile?.lastName || user?.lastName || 'L')[0]).toUpperCase()}
                    </span>
                  )}
                  {/* Star indicator */}
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Star className="w-2.5 h-2.5 text-yellow-900 fill-yellow-900" />
                  </div>
                </div>
                
                {/* Leader Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium text-lg group-hover:text-purple-300 transition-colors">
                      {profile?.firstName || user?.firstName || 'First'} {profile?.lastName || user?.lastName || 'Last'}
                    </p>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30">
                      Team Leader
                    </span>
                  </div>
                  {profile?.role && (
                    <p className="text-white/60 text-sm">{profile.role}</p>
                  )}
                </div>
                
                {/* View Profile indicator */}
                <div className="text-purple-300 group-hover:text-purple-200 transition-colors">
                  <UserCircle className="w-5 h-5" />
                </div>
              </div>
            </Link>

            {/* Team Members */}
            {teamMembers.length > 0 && teamMembers
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((member) => (
                <div
                  key={member.id}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    
                    {/* Member Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-medium text-lg">{member.name}</p>
                        {member.status === 'ACTIVE' && (
                          <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" title="Active" />
                        )}
                      </div>
                      {member.role && (
                        <p className="text-white/60 text-sm">{member.role}</p>
                      )}
                    </div>
                    
                    {/* Email Pill */}
                    {member.email && (
                      <button
                        onClick={() => handleCopyEmail(member.email!)}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
                      >
                        <Mail className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 text-sm font-medium">
                          {copiedEmail === member.email ? 'Copied!' : member.email}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Inline Editing Mode */
          <div className="space-y-4">
            {/* Header row */}
            <div className="grid grid-cols-12 gap-3 px-1">
              <div className="col-span-3 text-xs font-medium text-white/60">First Name *</div>
              <div className="col-span-3 text-xs font-medium text-white/60">Last Name *</div>
              <div className="col-span-3 text-xs font-medium text-white/60">Email (optional)</div>
              <div className="col-span-2 text-xs font-medium text-white/60">Role (optional)</div>
              <div className="col-span-1"></div>
            </div>
            
            {/* Editable team member rows */}
            <div className="space-y-2">
              {editableMembers.map((member, index) => (
                <div key={member.id} className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-3">
                    <input
                      ref={(el) => { nameInputRefs.current[`${member.id}-firstName`] = el }}
                      type="text"
                      value={member.firstName}
                      onChange={(e) => updateTeamMember(member.id, 'firstName', e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          nameInputRefs.current[`${member.id}-lastName`]?.focus()
                        }
                      }}
                      placeholder="Jane"
                      className={`w-full px-3 py-2 bg-white/10 border ${
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
                            if (index === editableMembers.length - 1) {
                              addTeamMember()
                            } else {
                              nameInputRefs.current[`${editableMembers[index + 1].id}-firstName`]?.focus()
                            }
                          }
                        }
                      }}
                      placeholder="Smith"
                      className={`w-full px-3 py-2 bg-white/10 border ${
                        member.lastNameError ? 'border-red-500' : 'border-white/20'
                      } rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all`}
                    />
                  </div>
                  <div className="col-span-3">
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => updateTeamMember(member.id, 'email', e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                      placeholder="Designer"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    {index === editableMembers.length - 1 ? (
                      <button
                        onClick={addTeamMember}
                        className="w-9 h-9 flex items-center justify-center bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                        title="Add team member"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    ) : (
                      editableMembers.length > 1 && (
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="w-9 h-9 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
                          title="Remove team member"
                        >
                          <X className="w-4 h-4 text-white/60 hover:text-white" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {editableMembers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-white/50 text-sm mb-3">No team members added yet</p>
                <button
                  onClick={addTeamMember}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                >
                  Add First Member
                </button>
              </div>
            )}
          </div>
        )}
        
        
        {/* Add Team Members Button - Show when no team members (leader is always shown) */}
        {!isEditing && teamMembers.length === 0 && (
          <div className="mt-6 text-center py-8 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/60 text-sm mb-4">Add your team members to collaborate and track progress together</p>
            <button
              onClick={startEditing}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add Team Members
            </button>
          </div>
        )}
      </div>
    </div>
  )
}