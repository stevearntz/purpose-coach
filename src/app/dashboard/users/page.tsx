'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization, useUser } from '@clerk/nextjs'
import { Edit2, Trash2, Mail, Shield, Calendar, CheckCircle, UserCheck, Clock, AlertCircle, Plus, Search, X, AlertTriangle } from 'lucide-react'

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
  status: string
  department?: string
  joinedDate: string
}

interface UnifiedUser {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Member' | 'Participant'
  status: string
  createdAt: string
  isClerkUser: boolean
  clerkUserId?: string  // Add the actual Clerk user ID
  profileImageUrl?: string | null
  department?: string
}

export default function UsersPage() {
  const router = useRouter()
  const { organization, membership } = useOrganization()
  const { user } = useUser()
  const [unifiedUsers, setUnifiedUsers] = useState<UnifiedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const lastOrganizationIdRef = useRef<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; user: UnifiedUser | null }>({ show: false, user: null })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentOrgId = organization?.id
    
    // Only fetch if organization ID has changed and we're not currently fetching
    if (currentOrgId && currentOrgId !== lastOrganizationIdRef.current && !isFetching) {
      lastOrganizationIdRef.current = currentOrgId
      fetchAllUsers()
    }
  }, [organization?.id])

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
          clerkUserId: member.publicUserData.userId,  // Add the actual Clerk user ID
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


  const formatRole = (role: string): string => {
    if (role === 'org:admin' || role === 'admin') return 'Admin'
    if (role === 'org:member' || role === 'member') return 'Member'
    return 'Participant'
  }

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email)
    setCopiedEmail(email)
    setTimeout(() => setCopiedEmail(null), 2000)
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

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  // Filter users based on search query
  const filteredUsers = unifiedUsers.filter(user => {
    const query = searchQuery.toLowerCase()
    return (
      user.name.toLowerCase().includes(query) ||
      user.status.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    )
  })

  const handleRemoveUser = (user: UnifiedUser) => {
    setDeleteModal({ show: true, user })
  }

  const confirmDelete = async () => {
    const userToDelete = deleteModal.user
    if (!userToDelete) return
    
    setIsDeleting(true)
    
    try {
      // Use the new comprehensive delete endpoint
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userToDelete.email,
          clerkUserId: userToDelete.clerkUserId,  // Use the actual Clerk user ID
          membershipId: userToDelete.id,  // Pass the membership ID too
          isClerkUser: userToDelete.isClerkUser
        })
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete user')
      }
      
      // Show success message (you could add a toast notification here)
      console.log(result.message)
      
      // Refresh the list
      await fetchAllUsers(false)
      
      // Close modal
      setDeleteModal({ show: false, user: null })
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(error instanceof Error ? error.message : 'Failed to delete user. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }
  
  const cancelDelete = () => {
    setDeleteModal({ show: false, user: null })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Users</h2>
          <p className="text-white/60 mt-1">Manage your team members and their permissions</p>
        </div>
        <button
          onClick={() => router.push('/dashboard/users/add')}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Users
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
        <div className="flex items-center gap-3 flex-1">
          <Search className="w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search users by name, status, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-white placeholder-white/40 flex-1"
          />
        </div>
        {filteredUsers.length !== unifiedUsers.length && (
          <div className="text-white/60 text-sm">
            {filteredUsers.length} {filteredUsers.length === 1 ? 'participant' : 'participants'}
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-white/60">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
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
                {filteredUsers.map((user) => {
                  const isCurrentUser = user.isClerkUser && membership?.publicUserData?.identifier === user.email
                  
                  return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {user.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt={user.name}
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                              {getInitials(user.name)}
                            </div>
                          )}
                          <span className="font-medium text-white">{user.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(user.status)}
                          <span className="text-white/80 text-sm">{user.status}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => copyEmail(user.email)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all ${
                            copiedEmail === user.email
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-white/10 text-white/80 hover:bg-white/20'
                          }`}
                        >
                          {copiedEmail === user.email ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Mail className="w-3 h-3" />
                              {user.email}
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
                        <div className="flex items-center gap-1 text-white/60 text-sm">
                          <Calendar className="w-4 h-4" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!isCurrentUser && (
                          <button
                            onClick={() => handleRemoveUser(user)}
                            className="p-2 text-white/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && deleteModal.user && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full border border-white/10">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Delete User
                </h3>
                <p className="text-white/70 text-sm">
                  Are you sure you want to delete <span className="font-semibold text-white">{deleteModal.user.name}</span> ({deleteModal.user.email})?
                </p>
              </div>
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-300 text-sm font-medium mb-2">
                This action will permanently delete:
              </p>
              <ul className="text-red-300/80 text-sm space-y-1 list-disc list-inside">
                <li>User profile and all personal data</li>
                <li>Team memberships and associations</li>
                <li>Assessment invitations and results</li>
                <li>Access to the organization</li>
              </ul>
              <p className="text-red-400 text-sm font-semibold mt-3">
                This action cannot be undone!
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}