'use client'

import { useState } from 'react'
import { useUser, useOrganization } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Users, Mail, Send, Check, X, ArrowLeft, Lightbulb } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { ToastProvider } from '@/hooks/useToast'

function InviteCampaignContent() {
  const { user } = useUser()
  const { organization } = useOrganization()
  const router = useRouter()
  const { showSuccess, showError } = useToast()
  const [emails, setEmails] = useState([''])
  const [isInviting, setIsInviting] = useState(false)
  const [inviteResults, setInviteResults] = useState<any[]>([])

  const companyName = organization?.name || 'Your Company'
  const companyId = user?.publicMetadata?.companyId as string

  const handleAddEmail = () => {
    if (emails.length < 50) {
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
      const response = await fetch('/api/campaigns/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: validEmails,
          companyId,
          toolId: 'hr-partnership',
          toolTitle: 'HR Partnership Assessment',
          toolPath: '/hr-partnership'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to send invitations')
      }

      const { results } = await response.json()
      setInviteResults(results)

      const successCount = results.filter((r: any) => 
        r.status === 'invited' || r.status === 'existing_user_invited'
      ).length

      if (successCount > 0) {
        showSuccess(`Successfully invited ${successCount} participant${successCount > 1 ? 's' : ''} to the assessment`)
        
        // Clear successful emails
        const failedEmails = results
          .filter((r: any) => r.status === 'failed')
          .map((r: any) => r.email)
        
        if (failedEmails.length === 0) {
          // All successful - redirect to campaigns page
          setTimeout(() => {
            router.push('/dashboard/campaigns')
          }, 2000)
        } else {
          setEmails(failedEmails)
        }
      }
    } catch (error) {
      console.error('Failed to launch campaign:', error)
      showError('Failed to send invitations. Please try again.')
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        
        <div className="flex items-center gap-4">
          <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-[#30C7C7] to-[#2A74B9] text-white shadow-lg">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Launch HR Partnership Assessment</h1>
            <p className="text-white/70">Invite team members to complete the assessment</p>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2 font-medium">
              Participant Email Addresses
            </label>
            <p className="text-white/60 text-sm mb-4">
              They'll receive an invitation to complete the HR Partnership Assessment
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
                    placeholder="participant@company.com"
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
                
                {index === emails.length - 1 && emails.length < 50 && (
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
                  {(result.status === 'invited' || result.status === 'existing_user_invited') ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <X className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white/80">{result.email}</span>
                  <span className="text-white/60">
                    {result.status === 'invited' && '- Invitation sent'}
                    {result.status === 'existing_user_invited' && '- Added to campaign'}
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
              className="flex-1 py-3 bg-gradient-to-r from-[#30C7C7] to-[#2A74B9] hover:from-[#2A74B9] hover:to-[#206ba0] text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          <strong>What happens next:</strong> Participants will receive an email invitation to complete the HR Partnership Assessment. 
          Once they complete it, you'll be able to view results in the Results tab.
        </p>
      </div>
    </div>
  )
}

export default function InviteCampaignPage() {
  return (
    <ToastProvider>
      <InviteCampaignContent />
    </ToastProvider>
  )
}