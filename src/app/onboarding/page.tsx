'use client'

import { CreateOrganization, useOrganizationList, useUser } from '@clerk/nextjs'
import ViewportContainer from '@/components/ViewportContainer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [checkAttempts, setCheckAttempts] = useState(0)
  const { userMemberships, setActive, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: false,
    },
  })
  
  // Check for @getcampfire.com users
  const isDomainUser = user?.primaryEmailAddress?.emailAddress?.endsWith('@getcampfire.com')
  
  useEffect(() => {
    // Check if user already belongs to an organization
    if (isLoaded && userMemberships?.data && userMemberships.data.length > 0 && setActive) {
      // User has organizations - set the first one as active and redirect
      const firstOrg = userMemberships.data[0]
      setActive({ organization: firstOrg.organization.id }).then(() => {
        router.push('/dashboard')
      })
    } else if (isLoaded && isDomainUser && checkAttempts < 3) {
      // For domain users, recheck a few times in case webhook is still processing
      const timer = setTimeout(() => {
        setCheckAttempts(prev => prev + 1)
        // Force a re-check
        window.location.reload()
      }, 1500)
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded, userMemberships, setActive, router, isDomainUser, checkAttempts])
  
  // Show loading state for domain users while checking
  if (!isLoaded || (isDomainUser && checkAttempts < 3 && (!userMemberships?.data || userMemberships.data.length === 0))) {
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