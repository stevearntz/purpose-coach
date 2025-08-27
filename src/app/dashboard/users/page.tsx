'use client'

import { useState, useEffect } from 'react'
import { useOrganization } from '@clerk/nextjs'
import { Edit2, Trash2, UserPlus, Mail, Shield, Calendar, CheckCircle, UserCheck, Clock, AlertCircle } from 'lucide-react'

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

export default function UsersPage() {
  const { organization, membership } = useOrganization()
  const [unifiedUsers, setUnifiedUsers] = useState<UnifiedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  useEffect(() => {
    fetchAllUsers()
  }, [organization])

  const fetchAllUsers = async () => {
    if (!organization) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Fetch Clerk members
      const membershipList = await organization.getMemberships({
        limit: 100,
      })
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
      await fetchAllUsers()
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Users</h2>
          <p className="text-white/60 mt-1">Manage your team members and their permissions</p>
        </div>
        
        <button
          onClick={() => {/* TODO: Add invite modal */}}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{unifiedUsers.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Admins</p>
              <p className="text-3xl font-bold text-white mt-1">
                {unifiedUsers.filter(u => u.role === 'Admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Participants</p>
              <p className="text-3xl font-bold text-white mt-1">
                {unifiedUsers.filter(u => u.role === 'Participant').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
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