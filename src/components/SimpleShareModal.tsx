'use client'

import React, { useState, useEffect } from 'react'
import { X, Copy, CheckCircle, Users, Sparkles, ArrowRight } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface SimpleShareModalProps {
  toolId: string
  toolTitle: string
  toolPath: string
  toolGradient: string
  toolIcon: React.ReactNode
  onClose: () => void
}

export default function SimpleShareModal({
  toolId,
  toolTitle,
  toolPath,
  toolGradient,
  toolIcon,
  onClose
}: SimpleShareModalProps) {
  const { user } = useUser()
  const [shareLink, setShareLink] = useState('')
  const [campaignCode, setCampaignCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [creating, setCreating] = useState(true)
  const [hasCreated, setHasCreated] = useState(false)
  
  useEffect(() => {
    // Prevent duplicate creation
    if (hasCreated || !isOpen) {
      return
    }
    
    // Create a campaign and get the share link
    const createCampaign = async () => {
      // Mark as created immediately to prevent duplicate calls
      setHasCreated(true)
      try {
        const response = await fetch('/api/campaigns/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            toolId,
            toolTitle,
            toolPath
          })
        })
        
        if (response.ok) {
          const data = await response.json()
          setCampaignCode(data.campaignCode)
          setShareLink(data.shareLink)
        } else {
          // API call failed, use fallback
          console.error('Campaign creation failed:', await response.text())
          const userEmail = user?.emailAddresses?.[0]?.emailAddress || ''
          const encodedEmail = encodeURIComponent(userEmail)
          setShareLink(`${window.location.origin}${toolPath}?share=true&from=${encodedEmail}`)
        }
      } catch (error) {
        console.error('Error creating campaign:', error)
        // Fallback to a basic share link
        const userEmail = user?.emailAddresses?.[0]?.emailAddress || ''
        const encodedEmail = encodeURIComponent(userEmail)
        setShareLink(`${window.location.origin}${toolPath}?share=true&from=${encodedEmail}`)
      } finally {
        setCreating(false)
      }
    }
    
    createCampaign()
  }, [toolId, toolTitle, toolPath, user, isOpen, hasCreated])
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 rounded-2xl shadow-2xl max-w-lg w-full border border-white/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${toolGradient} text-white`}>
                {toolIcon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Share {toolTitle}</h2>
                <p className="text-sm text-white/60">Get a link to share with your team</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {creating ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 animate-pulse mb-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-white/80">Creating your share link...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Share Link Section */}
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-300" />
                    <h3 className="text-white font-semibold">Team Share Link</h3>
                  </div>
                  {campaignCode && (
                    <span className="text-xs text-purple-300 bg-purple-600/20 px-2 py-1 rounded">
                      Code: {campaignCode}
                    </span>
                  )}
                </div>
                
                <p className="text-white/60 text-sm mb-4">
                  Share this link with your team members. They'll be able to complete the assessment and you'll see their results.
                </p>
                
                <div className="bg-black/30 rounded-lg p-3 mb-3">
                  <code className="text-purple-300 text-sm break-all">{shareLink}</code>
                </div>
                
                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
              
              {/* Instructions */}
              <div className="space-y-3">
                <h4 className="text-white font-medium">How it works:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      1
                    </div>
                    <p className="text-white/70 text-sm">
                      Copy the link above and share it via email, Slack, or any messaging app
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      2
                    </div>
                    <p className="text-white/70 text-sm">
                      Team members click the link and complete the assessment
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                      3
                    </div>
                    <p className="text-white/70 text-sm">
                      View aggregated results and insights in your dashboard
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Note */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-300 text-xs">
                  💡 Tip: Team members who use this link will automatically be registered as Team Members in your organization
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!creating && (
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}