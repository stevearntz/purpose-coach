'use client'

import { useState, useEffect } from 'react'
import { useOrganization } from '@clerk/nextjs'
import { Edit2, Trash2, UserPlus, MoreVertical, Mail, Shield, Calendar, Clock } from 'lucide-react'

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

export default function UsersPage() {
  const { organization, membership } = useOrganization()
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null)

  useEffect(() => {
    fetchMembers()
  }, [organization])

  const fetchMembers = async () => {
    if (!organization) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const membershipList = await organization.getMemberships({
        limit: 100,
      })
      
      setMembers(membershipList.data as unknown as OrganizationMember[])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    if (!organization) return
    
    if (!confirm('Are you sure you want to remove this user?')) return
    
    try {
      await organization.removeMember(userId)
      await fetchMembers()
    } catch (error) {
      console.error('Error removing member:', error)
      alert('Failed to remove member')
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'member':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
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
              <p className="text-3xl font-bold text-white mt-1">{members.length}</p>
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
                {members.filter(m => m.role === 'admin').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm">Active This Month</p>
              <p className="text-3xl font-bold text-white mt-1">
                {members.filter(m => {
                  const createdDate = new Date(m.createdAt)
                  const oneMonthAgo = new Date()
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
                  return createdDate > oneMonthAgo
                }).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-400" />
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
        ) : members.length === 0 ? (
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
                    Email
                  </th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Added
                  </th>
                  <th className="text-left py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Last Sign In
                  </th>
                  <th className="text-right py-4 px-6 text-white/80 font-medium text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {members.map((member) => {
                  const fullName = [
                    member.publicUserData.firstName,
                    member.publicUserData.lastName
                  ].filter(Boolean).join(' ') || 'No name'
                  
                  const isCurrentUser = membership?.publicUserData?.userId === member.publicUserData.userId
                  
                  return (
                    <tr key={member.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {member.publicUserData.profileImageUrl ? (
                            <img
                              src={member.publicUserData.profileImageUrl}
                              alt={fullName}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{fullName}</p>
                            {isCurrentUser && (
                              <p className="text-xs text-purple-400">You</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(member.publicUserData.identifier)
                            setCopiedEmail(member.publicUserData.identifier)
                            setTimeout(() => setCopiedEmail(null), 2000)
                          }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors group relative"
                          title="Click to copy email"
                        >
                          <Mail className="w-3.5 h-3.5 text-white/60 group-hover:text-white" />
                          <span className="text-white/80 group-hover:text-white text-sm">
                            {member.publicUserData.identifier}
                          </span>
                          {copiedEmail === member.publicUserData.identifier && (
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-green-500 text-white text-xs rounded whitespace-nowrap">
                              Copied!
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.role)}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-white/40" />
                          <span className="text-white/80 text-sm">
                            {formatDate(member.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white/60 text-sm">—</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedMember(member.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4 text-white/60 group-hover:text-white" />
                          </button>
                          {!isCurrentUser && (
                            <button
                              onClick={() => handleRemoveMember(member.publicUserData.userId)}
                              className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                              title="Remove user"
                            >
                              <Trash2 className="w-4 h-4 text-white/60 group-hover:text-red-400" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedMember(member.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                          >
                            <MoreVertical className="w-4 h-4 text-white/60 group-hover:text-white" />
                          </button>
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