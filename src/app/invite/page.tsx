'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Users, Mail, Send, Check, X, ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { ToastProvider } from '@/hooks/useToast'

function InviteTeamContent() {
  const { user } = useUser()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [emails, setEmails] = useState([''])
  const [isInviting, setIsInviting] = useState(false)
  const [inviteResults, setInviteResults] = useState<any[]>([])

  const companyName = user?.publicMetadata?.companyName as string || 'Your Company'
  const companyId = user?.publicMetadata?.companyId as string

  const handleAddEmail = () => {
    if (emails.length < 20) {
      setEmails([...emails, ''])
    }
  }

  const handleRemoveEmail = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index))
  }

  const handleEmailChange = (index: number, value: string) => {
    const newEmails = [...emails]
    newEmails[index] = value
    setEmails(newEmails)
  }

  const handleInvite = async () => {
    const validEmails = emails.filter(email => {
      const trimmed = email.trim()
      return trimmed && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
    })

    if (validEmails.length === 0) {
      showError('Please enter at least one valid email address')
      return
    }

    setIsInviting(true)
    setInviteResults([])

    try {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: validEmails,
          companyId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitations')
      }

      const { results } = await response.json()
      setInviteResults(results)

      const successCount = results.filter((r: any) => 
        r.status === 'invited' || r.status === 'existing_user_updated'
      ).length

      if (successCount > 0) {
        showSuccess(`Successfully invited ${successCount} team member${successCount > 1 ? 's' : ''}`)
        
        // Clear successful emails
        const failedEmails = results
          .filter((r: any) => r.status === 'failed')
          .map((r: any) => r.email)
        
        setEmails(failedEmails.length > 0 ? failedEmails : [''])
      }
    } catch (error) {
      console.error('Failed to invite team:', error)
      showError('Failed to send invitations. Please try again.')
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-6">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700" />
      </div>
      
      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Invite Your Team</h1>
              <p className="text-white/70">Add team members to {companyName}</p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2 font-medium">
                  Team Member Email Addresses
                </label>
                <p className="text-white/60 text-sm mb-4">
                  They'll receive an invitation to join your Campfire workspace
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {emails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-3.5 w-5 h-5 text-white/40" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all"
                      />
                    </div>
                    
                    {emails.length > 1 && (
                      <button
                        onClick={() => handleRemoveEmail(index)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                    
                    {index === emails.length - 1 && emails.length < 20 && (
                      <button
                        onClick={handleAddEmail}
                        className="px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                      >
                        Add +
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Results */}
              {inviteResults.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  {inviteResults.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {(result.status === 'invited' || result.status === 'existing_user_updated') ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <X className="w-4 h-4 text-red-400" />
                      )}
                      <span className="text-white/80">{result.email}</span>
                      <span className="text-white/60">
                        {result.status === 'invited' && '- Invitation sent'}
                        {result.status === 'existing_user_updated' && '- Added to team'}
                        {result.status === 'failed' && `- ${result.error || 'Failed'}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => router.back()}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  disabled={isInviting}
                  className="flex-1 py-3 bg-gradient-to-r from-[#BF4C74] to-purple-600 hover:from-[#A63D5F] hover:to-purple-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isInviting ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Invitations
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>How it works:</strong> Team members will receive an email invitation to create their account. 
            Once they sign up, they'll automatically be added to {companyName} with access to all tools and assessments.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function InviteTeamPage() {
  return (
    <ToastProvider>
      <InviteTeamContent />
    </ToastProvider>
  )
}