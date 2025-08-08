'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send, Check, Users, Mail, Copy, ExternalLink } from 'lucide-react'
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
}

function InviteContent({ params }: { params: Promise<{ toolId: string }> }) {
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [toolId, setToolId] = useState<string>('')
  const [companyUsers, setCompanyUsers] = useState<CompanyUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
  const [personalMessage, setPersonalMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [toolLink, setToolLink] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  useEffect(() => {
    params.then(p => {
      setToolId(p.toolId)
      // Generate tool link
      const baseUrl = window.location.origin
      const tool = toolsData[p.toolId]
      if (tool) {
        setToolLink(`${baseUrl}${tool.path}`)
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

  const tool = toolsData[toolId]

  if (!tool) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white">Tool not found</div>
      </ViewportContainer>
    )
  }

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
    if (selectedUsers.size === companyUsers.length) {
      setSelectedUsers(new Set())
    } else {
      setSelectedUsers(new Set(companyUsers.map(u => u.email)))
    }
  }

  const handleSendInvitations = async () => {
    if (selectedUsers.size === 0) {
      showError('Please select at least one user to invite')
      return
    }

    setSending(true)
    try {
      // Create tool invitations
      const response = await fetch('/api/tools/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          toolName: tool.title,
          toolPath: tool.path,
          users: Array.from(selectedUsers),
          message: personalMessage,
          senderEmail: localStorage.getItem('campfire_user_email')
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitations')
      }

      const result = await response.json()
      showSuccess(`Successfully invited ${result.sent} user${result.sent !== 1 ? 's' : ''} to ${tool.title}`)
      
      // Clear selections
      setSelectedUsers(new Set())
      setPersonalMessage('')
      
      // Redirect back to dashboard after a moment
      setTimeout(() => {
        router.push('/dashboard?tab=tools')
      }, 2000)
    } catch (error) {
      console.error('Failed to send invitations:', error)
      showError('Failed to send invitations. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(toolLink)
      setCopiedLink(true)
      showSuccess('Link copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 3000)
    } catch (error) {
      showError('Failed to copy link')
    }
  }

  return (
    <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="px-4 py-6 border-b border-white/10 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard?tab=tools')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Tools
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 py-8 max-w-4xl mx-auto">
          {/* Tool Info */}
          <div className={`bg-gradient-to-br ${tool.gradient} rounded-2xl p-8 mb-8`}>
            <h1 className="text-3xl font-bold text-white mb-2">
              Invite Team to {tool.title}
            </h1>
            <p className="text-white/90 text-lg mb-4">{tool.subtitle}</p>
            <p className="text-white/80">{tool.description}</p>
          </div>

          {/* Direct Link Section */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 mb-8 border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-4">
              Share Direct Link
            </h2>
            <p className="text-white/70 mb-4">
              Share this link with anyone you want to use this tool:
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                value={toolLink}
                readOnly
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-mono text-sm"
              />
              <button
                onClick={copyLink}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center gap-2"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
              <a
                href={toolLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
            </div>
          </div>

          {/* User Selection */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                Select Users to Invite
              </h2>
              <button
                onClick={selectAll}
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                {selectedUsers.size === companyUsers.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {companyUsers.length === 0 ? (
              <div className="text-center py-12 text-white/60">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No users in your organization yet.</p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="mt-4 text-purple-400 hover:text-purple-300"
                >
                  Add Users First
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
                  {companyUsers.map((user) => (
                    <label
                      key={user.email}
                      className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.email)}
                        onChange={() => toggleUser(user.email)}
                        className="w-5 h-5 rounded border-white/30 bg-white/10 text-purple-500 focus:ring-purple-500"
                      />
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-white/60 text-sm">{user.email}</div>
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

                {/* Personal Message */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={personalMessage}
                    onChange={(e) => setPersonalMessage(e.target.value)}
                    placeholder="Add a personal note about why you're inviting them to use this tool..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-purple-500 h-24"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center">
                  <div className="text-white/60">
                    {selectedUsers.size} user{selectedUsers.size !== 1 ? 's' : ''} selected
                  </div>
                  <button
                    onClick={handleSendInvitations}
                    disabled={sending || selectedUsers.size === 0}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sending ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Invitations
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </ViewportContainer>
  )
}

export default function InvitePage({ params }: { params: Promise<{ toolId: string }> }) {
  return (
    <ToastProvider>
      <InviteContent params={params} />
    </ToastProvider>
  )
}