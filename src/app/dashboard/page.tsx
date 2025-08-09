'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Plus, Mail, Users, Building, X, Upload, Check, Power } from 'lucide-react'
import ViewportContainer from '@/components/ViewportContainer'
import Footer from '@/components/Footer'
import ToolsLibrary from '@/components/ToolsLibrary'
import ResultsTab from '@/components/ResultsTab'
import RecommendationsTab from '@/components/RecommendationsTab'
import CampaignsTab from '@/components/CampaignsTab'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useToast } from '@/hooks/useToast'
import { ToastProvider } from '@/hooks/useToast'

interface UserData {
  email: string
  name: string
  company?: string
  companyId?: string
  role?: string
}

interface CompanyUser {
  email: string
  firstName: string
  lastName: string
  status: 'active' | 'invited' | 'created' | 'deactivated'
  lastSignIn?: string
  lastAssessment?: string
  invitedAt?: string
}

function DashboardContent() {
  const router = useRouter()
  const analytics = useAnalytics()
  const { showSuccess, showError } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [activeTab, setActiveTab] = useState('users')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteMode, setInviteMode] = useState<'single' | 'bulk'>('single')
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [sendingInvites, setSendingInvites] = useState(false)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    // First try to get authenticated user data
    const loadAuthUser = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include'
        })
        console.log('[dashboard] Auth check response status:', response.status)
        if (response.ok) {
          const authData = await response.json()
          setUserData({
            email: authData.email,
            name: authData.name || authData.email.split('@')[0],
            company: authData.company,
            companyId: authData.companyId,
            role: 'hr_leader' // Default role for now
          })
          
          // Update localStorage with auth data
          localStorage.setItem('campfire_user_email', authData.email)
          localStorage.setItem('campfire_user_name', authData.name || '')
          localStorage.setItem('campfire_user_company', authData.company || '')
          
          loadCompanyUsers(authData.email)
          analytics.trackAction('Dashboard Viewed', {
            user_email: authData.email,
            company: authData.company || 'unknown'
          })
          return
        }
      } catch (error) {
        console.error('[dashboard] Failed to load auth user:', error)
      }
      
      // If not authenticated, redirect to login
      console.log('[dashboard] Not authenticated, redirecting to login')
      router.push('/login')
    }
    
    loadAuthUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadCompanyUsers = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/company/users?email=${userEmail}`)
      if (response.ok) {
        const data = await response.json()
        setCompanyUsers(data.users || [])
      }
    } catch (error) {
      console.error('Failed to load company users:', error)
    }
  }

  const handleAddUsers = () => {
    setShowInviteModal(true)
    analytics.trackAction('Add Users Clicked', {
      user_email: userData?.email,
      company: userData?.company
    })
  }

  const handleCreateUsers = async () => {
    if (!inviteEmails.trim() && !csvFile) {
      showError('Please enter email addresses or upload a CSV file')
      return
    }

    setSendingInvites(true)

    try {
      let emailList: string[] = []

      if (csvFile) {
        // Parse CSV file
        const text = await csvFile.text()
        emailList = text.split(/[\n,]/).map(e => e.trim()).filter(e => e.includes('@'))
      } else {
        // Parse email input
        emailList = inviteEmails.split(/[\n,]/).map(e => e.trim()).filter(e => e.includes('@'))
      }

      if (emailList.length === 0) {
        showError('No valid email addresses found')
        setSendingInvites(false)
        return
      }

      // Send invites
      const response = await fetch('/api/company/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: emailList,
          message: inviteMessage,
          senderEmail: userData?.email,
          company: userData?.company
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to send invitations:', errorData)
        throw new Error(errorData.error || 'Failed to send invitations')
      }

      const result = await response.json()
      console.log('Invitation results:', result)
      
      // Show the invite URLs in console for testing
      if (result.results) {
        result.results.forEach((r: any) => {
          if (r.success) {
            console.log(`✅ Invite URL for ${r.email}: ${r.inviteUrl}`)
          }
        })
      }
      
      showSuccess(`Successfully created ${result.sent} user${result.sent !== 1 ? 's' : ''}`)
      
      // Reload users
      await loadCompanyUsers(userData?.email || '')
      
      // Close modal and reset
      setShowInviteModal(false)
      setInviteEmails('')
      setInviteMessage('')
      setCsvFile(null)

      analytics.trackAction('Invitations Sent', {
        count: result.sent,
        method: csvFile ? 'csv' : 'manual',
        company: userData?.company
      })
    } catch (error) {
      console.error('Failed to send invites:', error)
      showError('Failed to send invitations. Please try again.')
    } finally {
      setSendingInvites(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'text/csv') {
      setCsvFile(file)
      setInviteEmails('') // Clear manual input
    } else {
      showError('Please upload a valid CSV file')
    }
  }

  const copyInviteLink = async () => {
    try {
      // Create a generic company invitation
      const response = await fetch('/api/company/invite-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderEmail: userData?.email,
          company: userData?.company
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to create invite link')
      }
      
      const { inviteUrl } = await response.json()
      
      await navigator.clipboard.writeText(inviteUrl)
      setCopiedLink(true)
      showSuccess('Invite link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 3000)
    } catch (error) {
      console.error('Failed to create/copy invite link:', error)
      showError('Failed to copy link')
    }
  }

  const handleToolClick = (toolId: string, toolTitle: string, toolPath: string) => {
    analytics.trackAction('Tool Selected', {
      tool: toolTitle,
      from_page: 'dashboard',
      user_email: userData?.email
    })
    router.push(toolPath)
  }

  const handleLogout = async () => {
    try {
      // Call logout API to clear auth cookie
      await fetch('/api/auth/logout', {
        method: 'POST'
      })
      
      // Clear local storage
      localStorage.removeItem('campfire_user_email')
      localStorage.removeItem('campfire_user_name')
      localStorage.removeItem('campfire_user_company')
      
      // Redirect to login page
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Even if API fails, clear local data and redirect
      localStorage.clear()
      router.push('/login')
    }
  }

  const getInitials = (name: string) => {
    if (!name || name === 'undefined undefined' || name.trim() === '') {
      return '??'
    }
    
    const parts = name.split(' ').filter(p => p && p !== 'undefined')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    } else if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase()
    }
    return '??'
  }

  if (!userData) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </ViewportContainer>
    )
  }

  return (
    <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-4 py-6 border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {/* Company Logo/Name */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">{userData.company || 'Your Company'}</h1>
                    <p className="text-xs text-white/60">getcampfire.com</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Add Users Button */}
                {activeTab === 'users' && (
                  <button
                    onClick={handleAddUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">EMAIL 0 USERS</span>
                    <span className="sm:hidden">INVITE</span>
                  </button>
                )}

                <button
                  onClick={handleAddUsers}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                >
                  ADD USERS
                </button>

                {/* User Avatar & Logout */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                    {getInitials(userData.name)}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('users')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'users'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Users
                {activeTab === 'users' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('tools')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'tools'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Assessments
                {activeTab === 'tools' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'campaigns'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Campaigns
                {activeTab === 'campaigns' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'results'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Results
                {activeTab === 'results' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('recommendations')}
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === 'recommendations'
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80'
                }`}
              >
                Recommendations
                {activeTab === 'recommendations' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8 max-w-7xl mx-auto">
          {activeTab === 'users' && (
            <div>
              {/* Add Users Section */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Add multiple users</h2>
                <p className="text-white/70 mb-4">
                  Upload a list of people in Campfire using our CSV template. Add as many people as you have, then upload below.
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    UPLOAD CSV
                  </button>
                  <button className="px-4 py-2 text-purple-400 hover:text-purple-300 transition-colors">
                    DOWNLOAD TEMPLATE
                  </button>
                </div>
              </div>

              {/* Add Single User */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-6 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Add a single user</h2>
                <p className="text-white/70 mb-4">
                  Type in their name and email address and add any other info you have about them.
                </p>
                <button
                  onClick={() => {
                    setInviteMode('single')
                    setShowInviteModal(true)
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  CREATE NEW USER
                </button>
              </div>

              {/* Users List */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">{companyUsers.length} users</h2>
                  <input
                    type="text"
                    placeholder="Search for a user..."
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  />
                </div>
                
                {/* Users Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-white/60 text-sm border-b border-white/10">
                        <th className="pb-3 pr-4">NAME</th>
                        <th className="pb-3 pr-4">STATUS</th>
                        <th className="pb-3 pr-4">LAST SIGN IN</th>
                        <th className="pb-3 pr-4">LAST ASSESSMENT</th>
                        <th className="pb-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {companyUsers.map((user, index) => {
                        const displayName = (user.firstName && user.firstName !== 'undefined') 
                          ? `${user.firstName} ${user.lastName || ''}`.trim()
                          : user.email.split('@')[0].replace(/[._-]/g, ' ').split(' ').map(p => 
                              p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
                            ).join(' ')
                        
                        return (
                          <tr key={user.email} className="border-b border-white/5">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                                  {getInitials(displayName)}
                                </div>
                                <div>
                                  <div className="text-white font-medium">{displayName}</div>
                                  <div className="text-white/60 text-sm">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400'
                                  : user.status === 'invited'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {user.status === 'active' ? 'Active' : 
                                 user.status === 'invited' ? 'Invited' : 'Created'}
                              </span>
                            </td>
                            <td className="py-4 pr-4 text-white/60">
                              {user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-4 pr-4 text-white/60">
                              {user.lastAssessment ? new Date(user.lastAssessment).toLocaleDateString() : '-'}
                            </td>
                            <td className="py-4 text-white/60">
                              {user.status === 'created' && (
                                <button className="text-purple-400 hover:text-purple-300 text-sm">
                                  Send Invite
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {companyUsers.length === 0 && (
                    <div className="text-center py-12 text-white/60">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No users yet. Start by adding your first user above.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tools' && (
            <ToolsLibrary onToolClick={handleToolClick} />
          )}

          {activeTab === 'campaigns' && (
            <CampaignsTab />
          )}

          {activeTab === 'results' && (
            <ResultsTab />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsTab />
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInviteModal(false)} />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {inviteMode === 'single' ? 'Create User' : 'Import Users'}
                </h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Mode Toggle */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setInviteMode('single')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    inviteMode === 'single'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Create User
                </button>
                <button
                  onClick={() => setInviteMode('bulk')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    inviteMode === 'bulk'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Import CSV
                </button>
              </div>

              {inviteMode === 'single' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder="user@company.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    A user account will be created with this email. They'll be able to set up their password when they first sign in.
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* CSV Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <label className="cursor-pointer">
                      <span className="text-purple-600 hover:text-purple-700 font-medium">
                        Click to upload CSV
                      </span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    {csvFile && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {csvFile.name}
                      </p>
                    )}
                  </div>

                  <div className="text-center text-gray-500">OR</div>

                  {/* Manual Email Entry */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter email addresses (one per line or comma-separated)
                    </label>
                    <textarea
                      value={inviteEmails}
                      onChange={(e) => setInviteEmails(e.target.value)}
                      placeholder="john@company.com&#10;jane@company.com&#10;team@company.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32"
                      disabled={!!csvFile}
                    />
                  </div>
                </div>
              )}

              {/* Note about invitations */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Users will be created but not invited immediately. 
                  You can send invitations later through campaigns or individually from the user list.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateUsers}
                  disabled={sendingInvites || (!inviteEmails.trim() && !csvFile)}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {sendingInvites ? (
                    'Creating...'
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {inviteMode === 'single' ? 'Create User' : 'Import Users'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </ViewportContainer>
  )
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  )
}