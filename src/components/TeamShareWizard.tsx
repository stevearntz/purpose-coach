'use client'

import React, { useState, useEffect } from 'react'
import { X, Users, Check, Copy, Link, CheckCircle, UserCheck } from 'lucide-react'
import { useUser } from '@clerk/nextjs'

interface TeamMember {
  id: string
  name: string
  email: string | null
  role: string | null
}

interface TeamShareWizardProps {
  toolId: string
  toolTitle: string
  toolPath: string
  toolGradient: string
  toolIcon: React.ReactNode
  onClose: () => void
}

export default function TeamShareWizard({
  toolId,
  toolTitle,
  toolPath,
  toolGradient,
  toolIcon,
  onClose
}: TeamShareWizardProps) {
  const { user } = useUser()
  const [currentStep, setCurrentStep] = useState(1)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)
  
  // Fetch team members on mount
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team/members', {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setTeamMembers(data.teamMembers || [])
        }
      } catch (error) {
        console.error('Error fetching team members:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTeamMembers()
  }, [])
  
  const handleSelectAll = () => {
    if (selectedMembers.length === teamMembers.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(teamMembers.map(m => m.id))
    }
  }
  
  const toggleMember = (memberId: string) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId))
    } else {
      setSelectedMembers([...selectedMembers, memberId])
    }
  }
  
  const handleCopyLink = (link: string, linkId: string) => {
    navigator.clipboard.writeText(link)
    setCopiedLink(linkId)
    setTimeout(() => setCopiedLink(null), 2000)
  }
  
  const handleShare = () => {
    if (selectedMembers.length > 0) {
      setCurrentStep(2)
    }
  }
  
  // Generate the sharing links with tracking parameters
  // These links will track that they came from team sharing
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || ''
  const encodedEmail = encodeURIComponent(userEmail)
  
  const globalLink = `${window.location.origin}${toolPath}?team_share=true&owner=${encodedEmail}&team_id=${toolId}`
  const memberLinks = selectedMembers.map(memberId => {
    const member = teamMembers.find(m => m.id === memberId)
    return {
      memberId,
      memberName: member?.name || 'Unknown',
      link: `${window.location.origin}${toolPath}?team_share=true&owner=${encodedEmail}&member_id=${memberId}`
    }
  })
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-white/20">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${toolGradient} text-white`}>
              {toolIcon}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Share {toolTitle}</h2>
              <p className="text-sm text-white/60">
                {currentStep === 1 ? 'Select team members' : 'Share links'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="px-6 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              currentStep === 1 ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60'
            }`}>
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Select Members</span>
            </div>
            <div className="w-8 h-px bg-white/20" />
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
              currentStep === 2 ? 'bg-purple-600 text-white' : 'bg-white/10 text-white/60'
            }`}>
              <Link className="w-4 h-4" />
              <span className="text-sm font-medium">Share Links</span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {currentStep === 1 ? (
            // Step 1: Select Team Members
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-white/80">
                  Choose which team members should receive this assessment
                </p>
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors"
                >
                  {selectedMembers.length === teamMembers.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : teamMembers.length > 0 ? (
                <div className="space-y-2">
                  {teamMembers.map(member => (
                    <button
                      key={member.id}
                      onClick={() => toggleMember(member.id)}
                      className={`w-full p-4 rounded-lg border transition-all text-left ${
                        selectedMembers.includes(member.id)
                          ? 'bg-purple-600/20 border-purple-500 hover:bg-purple-600/30'
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            selectedMembers.includes(member.id)
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/10 text-white/60'
                          }`}>
                            {selectedMembers.includes(member.id) ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-medium">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="text-white font-medium">{member.name}</p>
                            {member.role && (
                              <p className="text-white/60 text-sm">{member.role}</p>
                            )}
                          </div>
                        </div>
                        {member.email && (
                          <span className="text-white/40 text-sm">{member.email}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                  <Users className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/60">No team members found</p>
                  <p className="text-white/40 text-sm mt-1">Add team members in your profile settings</p>
                </div>
              )}
            </div>
          ) : (
            // Step 2: Share Links
            <div className="space-y-6">
              {/* Global Link */}
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Team Link
                    </h3>
                    <p className="text-white/60 text-sm mt-1">
                      Share this link with all selected team members at once
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyLink(globalLink, 'global')}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors flex items-center gap-2"
                  >
                    {copiedLink === 'global' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <div className="bg-black/20 rounded-lg px-3 py-2">
                  <code className="text-purple-300 text-xs break-all">{globalLink}</code>
                </div>
              </div>
              
              {/* Individual Links */}
              <div>
                <h3 className="text-white font-semibold mb-3">Individual Links</h3>
                <div className="space-y-2">
                  {memberLinks.map(({ memberId, memberName, link }) => (
                    <div key={memberId} className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-white font-medium">{memberName}</p>
                        <button
                          onClick={() => handleCopyLink(link, memberId)}
                          className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors flex items-center gap-1"
                        >
                          {copiedLink === memberId ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <div className="bg-black/20 rounded px-2 py-1">
                        <code className="text-white/40 text-xs break-all">{link}</code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  💡 Tip: You can share these links via email, Slack, or any messaging app. 
                  Team members will be able to complete the assessment at their own pace.
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          {currentStep === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleShare}
                disabled={selectedMembers.length === 0}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Share Links
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}