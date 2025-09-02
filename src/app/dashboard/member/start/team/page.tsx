'use client'

import { useUser } from '@clerk/nextjs'
import { Users, Mail, UserCircle, Edit2, X, Plus, Trash2, Star } from 'lucide-react'
import { useState, useEffect } from 'react'
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

export default function TeamPage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [teamPurpose, setTeamPurpose] = useState('')
  const [editedMembers, setEditedMembers] = useState<TeamMember[]>([])
  const [savingTeam, setSavingTeam] = useState(false)
  
  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
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
          setProfile(data.profile)
          setTeamName(data.profile?.teamName || '')
          setTeamPurpose(data.profile?.teamPurpose || '')
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
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        return true
      }
      return false
    } catch (error) {
      console.error('Error saving team info:', error)
      return false
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
              <h1 className="text-4xl font-bold text-white">
                {profile?.teamName || 'Your Team'}
              </h1>
              {profile?.teamPurpose && (
                <p className="text-white/80 text-lg mt-2">{profile.teamPurpose}</p>
              )}
              <div className="flex items-center gap-4 mt-3">
                <span className="text-white/60 text-sm">
                  {teamMembers.length + 1} team member{(teamMembers.length + 1) !== 1 ? 's' : ''} • {teamMembers.length > 0 ? `${teamMembers.length} direct reports` : 'No direct reports yet'}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setEditedMembers([...teamMembers].sort((a, b) => a.name.localeCompare(b.name)))
                setShowEditModal(true)
              }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Edit2 className="w-5 h-5 text-white" />
            </button>
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
        ) : (
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
        )}
        
        
        {/* Add Team Members Button - Show when no team members (leader is always shown) */}
        {teamMembers.length === 0 && (
          <div className="mt-6 text-center py-8 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/60 text-sm mb-4">Add your team members to collaborate and track progress together</p>
            <button
              onClick={() => {
                setEditedMembers([{ id: Date.now().toString(), name: '', email: '', role: '', status: 'PENDING', createdAt: new Date().toISOString() }])
                setShowEditModal(true)
              }}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Add Team Members
            </button>
          </div>
        )}
      </div>

      {/* Edit Team Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Edit Team</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditedMembers([])
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="px-6 py-4 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Team Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Team Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Team Name</label>
                    <input
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g., Product Team, Engineering Squad"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-1">Team Purpose</label>
                    <input
                      type="text"
                      value={teamPurpose}
                      onChange={(e) => setTeamPurpose(e.target.value)}
                      placeholder="What is your team's mission?"
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                    />
                  </div>
                </div>
              </div>
              
              {/* Team Members Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Team Members</h3>
                  <button
                    onClick={() => {
                      setEditedMembers([...editedMembers, { 
                        id: `new-${Date.now()}`, 
                        name: '', 
                        email: '', 
                        role: '', 
                        status: 'PENDING',
                        createdAt: new Date().toISOString()
                      }])
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </button>
                </div>
                
                <div className="space-y-3">
                  {editedMembers.map((member, index) => (
                    <div key={member.id} className="grid grid-cols-12 gap-3">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => {
                          const updated = [...editedMembers]
                          updated[index] = { ...updated[index], name: e.target.value }
                          setEditedMembers(updated)
                        }}
                        placeholder="Name"
                        className="col-span-4 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                      />
                      <input
                        type="email"
                        value={member.email || ''}
                        onChange={(e) => {
                          const updated = [...editedMembers]
                          updated[index] = { ...updated[index], email: e.target.value }
                          setEditedMembers(updated)
                        }}
                        placeholder="Email (optional)"
                        className="col-span-4 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                      />
                      <input
                        type="text"
                        value={member.role || ''}
                        onChange={(e) => {
                          const updated = [...editedMembers]
                          updated[index] = { ...updated[index], role: e.target.value }
                          setEditedMembers(updated)
                        }}
                        placeholder="Role (optional)"
                        className="col-span-3 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                      />
                      <button
                        onClick={() => {
                          setEditedMembers(editedMembers.filter((_, i) => i !== index))
                        }}
                        className="col-span-1 p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  {editedMembers.length === 0 && (
                    <div className="text-center py-8 bg-white/5 rounded-lg border border-white/10">
                      <p className="text-white/50 text-sm">No team members added yet</p>
                      <p className="text-white/40 text-xs mt-1">Click "Add Member" to start building your team</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditedMembers([])
                }}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
                disabled={savingTeam}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSavingTeam(true)
                  try {
                    // Save team info
                    const saveSuccess = await handleSaveTeamInfo()
                    if (!saveSuccess) {
                      console.error('Failed to save team info')
                    }
                    
                    // Delete all existing team members
                    await fetch('/api/team/members/all', {
                      method: 'DELETE',
                      credentials: 'include'
                    })
                    
                    // Save new team members
                    const validMembers = editedMembers.filter(m => m.name.trim())
                    if (validMembers.length > 0) {
                      const response = await fetch('/api/team/members', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ members: validMembers })
                      })
                      
                      if (response.ok) {
                        const data = await response.json()
                        setTeamMembers(data.teamMembers)
                      }
                    } else {
                      setTeamMembers([])
                    }
                    
                    // Refresh the page data to show the updated team name
                    const profileResponse = await fetch('/api/user/profile', {
                      credentials: 'include'
                    })
                    if (profileResponse.ok) {
                      const data = await profileResponse.json()
                      setProfile(data.profile)
                      setTeamName(data.profile?.teamName || '')
                      setTeamPurpose(data.profile?.teamPurpose || '')
                    }
                    
                    setShowEditModal(false)
                    setEditedMembers([])
                  } catch (error) {
                    console.error('Error saving team:', error)
                  } finally {
                    setSavingTeam(false)
                  }
                }}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                disabled={savingTeam}
              >
                {savingTeam ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}