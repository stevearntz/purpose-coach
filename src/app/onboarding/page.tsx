'use client'

import { CreateOrganization, useOrganizationList, useUser } from '@clerk/nextjs'
import ViewportContainer from '@/components/ViewportContainer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded: userLoaded } = useUser()
  
  // Use sessionStorage to persist attempts across reloads
  const [checkAttempts, setCheckAttempts] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('onboarding-check-attempts')
      return stored ? parseInt(stored, 10) : 0
    }
    return 0
  })
  
  const { userMemberships, setActive, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: false,
    },
  })
  
  // Check for @getcampfire.com users
  const emailAddress = user?.primaryEmailAddress?.emailAddress || ''
  const isDomainUser = emailAddress.endsWith('@getcampfire.com')
  
  useEffect(() => {
    // Check if user already belongs to an organization
    if (isLoaded && userMemberships?.data && userMemberships.data.length > 0 && setActive) {
      // User has organizations - set the first one as active and redirect
      const firstOrg = userMemberships.data[0]
      // Clear the attempts counter
      sessionStorage.removeItem('onboarding-check-attempts')
      setActive({ organization: firstOrg.organization.id }).then(() => {
        router.push('/dashboard')
      })
    } else if (isLoaded && userLoaded && isDomainUser && checkAttempts < 5) {
      // For domain users, recheck several times in case webhook is still processing
      const timer = setTimeout(() => {
        const newAttempts = checkAttempts + 1
        sessionStorage.setItem('onboarding-check-attempts', newAttempts.toString())
        setCheckAttempts(newAttempts)
        // Force a re-check
        window.location.reload()
      }, 1500) // Give it a bit more time between checks
      
      return () => clearTimeout(timer)
    } else if (checkAttempts >= 5) {
      // Max attempts reached, clear the counter
      sessionStorage.removeItem('onboarding-check-attempts')
    }
  }, [isLoaded, userLoaded, userMemberships, setActive, router, isDomainUser, checkAttempts])
  
  // ALWAYS show loading state while we figure out if user is a domain user
  // or while we're checking their membership status
  const shouldShowLoading = 
    !userLoaded || // Still loading user data
    !isLoaded || // Still loading memberships
    (isDomainUser && checkAttempts < 5 && (!userMemberships?.data || userMemberships.data.length === 0)) // Domain user still being processed
  
  if (shouldShowLoading) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
        
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Setting up your organization...</p>
            <p className="text-white/60 text-sm mt-2">This will just take a moment</p>
          </div>
        </div>
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

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <CreateOrganization 
          appearance={{
            elements: {
              card: "shadow-2xl",
              formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            }
          }}
          routing="hash"
          afterCreateOrganizationUrl="/dashboard"
          skipInvitationScreen={false}
        />
      </div>
    </ViewportContainer>
  )
}