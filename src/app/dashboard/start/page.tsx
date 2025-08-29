'use client'

import { useRouter } from 'next/navigation'
import { useOrganization, useUser } from '@clerk/nextjs'
import { useEffect } from 'react'
import StartTab from '@/components/StartTab'

export default function StartPage() {
  const router = useRouter()
  const { user } = useUser()
  const { membership, isLoaded } = useOrganization()
  
  // Check if user is a member (not admin)
  const isMember = membership?.role === 'org:member'
  const isAdmin = membership?.role === 'org:admin'
  
  // Redirect to appropriate sub-page
  useEffect(() => {
    if (isLoaded && user) {
      // Check onboarding status
      const onboardingComplete = user?.publicMetadata?.onboardingComplete
      
      if (onboardingComplete) {
        // If onboarding is complete, go to profile
        router.replace('/dashboard/start/profile')
      } else {
        // If not complete, go to onboarding
        router.replace('/dashboard/start/onboarding')
      }
    }
  }, [isLoaded, user, router])
  
  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  )
}