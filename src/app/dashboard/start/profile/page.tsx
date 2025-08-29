'use client'

import { useUser } from '@clerk/nextjs'
import { User, Briefcase, Users, Building2, Target, Sparkles, Edit2, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface UserProfileData {
  firstName: string | null
  lastName: string | null
  role: string | null
  department: string | null
  teamSize: string | null
  teamPurpose: string | null
  teamEmoji: string | null
  company: {
    name: string
  } | null
}

export default function ProfilePage() {
  const { user } = useUser()
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState<UserProfileData | null>(null)
  const [saving, setSaving] = useState(false)
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setProfile(data.profile)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [])
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header - No Container */}
      <div className="flex items-center gap-6 mb-8">
        {/* Avatar */}
        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full border-2 border-white/30 flex items-center justify-center flex-shrink-0">
          {user?.imageUrl ? (
            <img 
              src={user.imageUrl} 
              alt="Profile" 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-white" />
          )}
        </div>
        
        {/* Name and Role Display */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white">
                {profile?.firstName || user?.firstName || 'First'} {profile?.lastName || user?.lastName || 'Last'}
              </h1>
              {profile?.role && (
                <div className="flex items-center gap-2 mt-2">
                  <Briefcase className="w-4 h-4 text-white/60" />
                  <p className="text-white/80 text-lg">{profile.role}</p>
                </div>
              )}
              {profile?.company && (
                <p className="text-white/60 text-sm mt-1">
                  at {profile.company.name}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                setEditData(profile)
                setShowEditModal(true)
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center gap-2 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </button>
          </div>
        </div>
        
      </div>
      
      {/* Profile Information Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Professional Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Professional Info
          </h2>
          <div className="space-y-4">
            {loading ? (
              <div className="h-32 bg-white/5 rounded-lg border border-white/10 animate-pulse" />
            ) : (
              <>
                {profile?.role && (
                  <div>
                    <p className="text-white/60 text-sm mb-1">Role</p>
                    <p className="text-white text-lg">{profile.role}</p>
                  </div>
                )}
                {profile?.department && (
                  <div>
                    <p className="text-white/60 text-sm mb-1">Department</p>
                    <p className="text-white text-lg">{profile.department}</p>
                  </div>
                )}
                {profile?.company && (
                  <div>
                    <p className="text-white/60 text-sm mb-1">Organization</p>
                    <p className="text-white text-lg">{profile.company.name}</p>
                  </div>
                )}
                {!profile?.role && !profile?.department && !profile?.company && (
                  <div className="h-24 flex items-center justify-center">
                    <p className="text-white/40 text-sm">No professional info added yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Team Info */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Your Team
            </h2>
            {profile?.teamEmoji && (
              <div className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>
                {profile.teamEmoji}
              </div>
            )}
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="h-32 bg-white/5 rounded-lg border border-white/10 animate-pulse" />
            ) : (
              <>
                {profile?.teamSize && (
                  <div>
                    <p className="text-white/60 text-sm mb-1">Team Size</p>
                    <p className="text-white text-lg">{profile.teamSize} people</p>
                  </div>
                )}
                {profile?.teamPurpose && (
                  <div>
                    <p className="text-white/60 text-sm mb-1">Team Purpose</p>
                    <p className="text-white text-sm leading-relaxed">{profile.teamPurpose}</p>
                  </div>
                )}
                {!profile?.teamSize && !profile?.teamPurpose && (
                  <div className="h-24 flex items-center justify-center">
                    <p className="text-white/40 text-sm">No team info added yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditData(null)
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">First Name</label>
                      <input
                        type="text"
                        value={editData.firstName || ''}
                        onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={editData.lastName || ''}
                        onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Role</label>
                      <input
                        type="text"
                        value={editData.role || ''}
                        onChange={(e) => setEditData({...editData, role: e.target.value})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                        placeholder="e.g., Product Manager"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Department</label>
                      <input
                        type="text"
                        value={editData.department || ''}
                        onChange={(e) => setEditData({...editData, department: e.target.value})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                        placeholder="e.g., Engineering"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Team Information */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Team Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Team Size</label>
                      <input
                        type="text"
                        value={editData.teamSize || ''}
                        onChange={(e) => setEditData({...editData, teamSize: e.target.value})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all"
                        placeholder="e.g., 8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Team Purpose</label>
                      <textarea
                        value={editData.teamPurpose || ''}
                        onChange={(e) => setEditData({...editData, teamPurpose: e.target.value})}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:bg-white/15 transition-all resize-none"
                        placeholder="What does your team do?"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-1">Team Emoji</label>
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{editData.teamEmoji || '🎯'}</span>
                        <button
                          type="button"
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
                          onClick={() => {
                            // For now, just cycle through a few emojis
                            const emojis = ['🚀', '💪', '🌟', '🎯', '🎨', '🧠', '💡', '🦁', '🔥', '⚡', '🏆']
                            const currentIndex = emojis.indexOf(editData.teamEmoji || '🎯')
                            const nextIndex = (currentIndex + 1) % emojis.length
                            setEditData({...editData, teamEmoji: emojis[nextIndex]})
                          }}
                        >
                          Change Emoji
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditData(null)
                }}
                className="px-6 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSaving(true)
                  try {
                    const response = await fetch('/api/user/profile', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(editData),
                    })
                    
                    if (response.ok) {
                      setProfile(editData)
                      setShowEditModal(false)
                      setEditData(null)
                    }
                  } catch (error) {
                    console.error('Error saving profile:', error)
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}