'use client'

import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function MemberStartPage() {
  const router = useRouter()
  const { user } = useUser()
  
  // Redirect to appropriate sub-page based on onboarding status
  useEffect(() => {
    if (user) {
      // Check onboarding status
      const onboardingComplete = user?.publicMetadata?.onboardingComplete
      
      if (onboardingComplete) {
        // If onboarding is complete, go to profile
        router.replace('/dashboard/member/start/profile')
      } else {
        // If not complete, go to onboarding
        router.replace('/dashboard/member/start/onboarding')
      }
    }
  }, [user, router])
  
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