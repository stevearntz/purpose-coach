'use client'

import { useRouter } from 'next/navigation'
import { useOrganization, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { membership, isLoaded } = useOrganization()
  const { user } = useUser()
  const [checkingProfile, setCheckingProfile] = useState(false)
  
  useEffect(() => {
    if (isLoaded && user) {
      const isMember = membership?.role === 'org:member'
      
      if (isMember) {
        // Check if member has completed onboarding
        const checkOnboarding = async () => {
          if (checkingProfile) return
          setCheckingProfile(true)
          
          try {
            const response = await fetch('/api/user/profile')
            if (response.ok) {
              const data = await response.json()
              
              // If onboarding is not complete, redirect to onboarding
              if (data.profile && data.profile.onboardingComplete === false) {
                router.replace('/dashboard/member/start/onboarding')
              } else {
                router.replace('/dashboard/member/start/dashboard')
              }
            } else {
              // If profile doesn't exist, redirect to onboarding
              router.replace('/dashboard/member/start/onboarding')
            }
          } catch (error) {
            console.error('Error checking profile:', error)
            // Default to dashboard on error
            router.replace('/dashboard/member/start/dashboard')
          }
        }
        
        checkOnboarding()
      } else {
        router.replace('/dashboard/start')
      }
    }
  }, [isLoaded, membership, user, router, checkingProfile])
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  )
}