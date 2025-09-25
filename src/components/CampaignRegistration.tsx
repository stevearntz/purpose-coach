'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Sparkles, ArrowRight, Users, AlertCircle } from 'lucide-react'

interface CampaignData {
  id: string
  name: string
  toolPath: string
  toolName: string
  company: {
    name: string
  }
}

interface CampaignRegistrationProps {
  onComplete?: () => void
}

export default function CampaignRegistration({ onComplete }: CampaignRegistrationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isSignedIn, isLoaded } = useUser()
  const [campaignCode] = useState(searchParams.get('campaign'))
  const [campaignData, setCampaignData] = useState<CampaignData | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')
  
  // Validate campaign code on mount
  useEffect(() => {
    if (!campaignCode) {
      setError('No campaign code provided')
      setLoading(false)
      return
    }
    
    const validateCampaign = async () => {
      try {
        const response = await fetch(`/api/campaigns/register?code=${campaignCode}`)
        const data = await response.json()
        
        if (data.valid) {
          setCampaignData(data.campaign)
        } else {
          setError(data.error || 'Invalid campaign code')
        }
      } catch (err) {
        setError('Failed to validate campaign')
      } finally {
        setLoading(false)
      }
    }
    
    validateCampaign()
  }, [campaignCode])
  
  // Auto-register if user is signed in
  useEffect(() => {
    if (isLoaded && isSignedIn && campaignData && !registering) {
      handleRegistration()
    }
  }, [isLoaded, isSignedIn, campaignData])
  
  const handleRegistration = async () => {
    if (!campaignCode || !user) return
    
    setRegistering(true)
    setError('')
    
    try {
      const response = await fetch('/api/campaigns/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          campaignCode,
          email: user.emailAddresses?.[0]?.emailAddress,
          firstName: user.firstName,
          lastName: user.lastName
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Registration successful, redirect to the tool
        if (onComplete) {
          onComplete()
        } else {
          // Remove campaign param and continue to tool
          const newUrl = new URL(window.location.href)
          newUrl.searchParams.delete('campaign')
          router.replace(newUrl.pathname + newUrl.search)
        }
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Failed to register for campaign')
    } finally {
      setRegistering(false)
    }
  }
  
  const handleSignIn = () => {
    // Store the campaign code in session storage for after sign-in
    if (campaignCode) {
      sessionStorage.setItem('pendingCampaign', campaignCode)
    }
    // Redirect to sign in
    router.push(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 animate-pulse mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-white/80 text-lg">Validating invitation...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Invalid Invitation</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    )
  }
  
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 animate-pulse mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-white/80 text-lg">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isSignedIn && campaignData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 mb-4">
              <Users className="w-8 h-8 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You're Invited!</h2>
            <p className="text-white/70">
              {campaignData.company.name} has invited you to complete:
            </p>
            <p className="text-xl font-semibold text-purple-300 mt-2">
              {campaignData.toolName}
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Sign in or create a free account</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Complete the assessment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-400 mt-0.5">•</span>
                  <span>Your results will be shared with your team leader</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={handleSignIn}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            >
              Sign In to Continue
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  if (registering) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/90 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-600/20 animate-pulse mb-4">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <p className="text-white/80 text-lg">Setting up your access...</p>
        </div>
      </div>
    )
  }
  
  // Should not reach here if auto-registration works
  return null
}