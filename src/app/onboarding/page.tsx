'use client'

import { CreateOrganization, useOrganizationList, useUser } from '@clerk/nextjs'
import ViewportContainer from '@/components/ViewportContainer'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isLoaded: userLoaded } = useUser()
  const [showOrgCreation, setShowOrgCreation] = useState(false)
  const [waitingForWebhook, setWaitingForWebhook] = useState(false)
  const { userMemberships, setActive, isLoaded: membershipsLoaded } = useOrganizationList({
    userMemberships: {
      infinite: false,
    },
  })
  
  // Check if this is a domain user
  const email = user?.emailAddresses?.[0]?.emailAddress
  const isDomainUser = email?.includes('@getcampfire.com')
  
  useEffect(() => {
    // Once everything is loaded, check if user has an org
    if (userLoaded && membershipsLoaded && userMemberships?.data?.length > 0) {
      // They have an org! Set it active and go to dashboard
      const firstOrg = userMemberships.data[0]
      setActive({ organization: firstOrg.organization.id }).then(() => {
        router.push('/dashboard')
      })
    }
  }, [userLoaded, membershipsLoaded, userMemberships, setActive, router])
  
  useEffect(() => {
    // If user is loaded and has no memberships, decide when to show org creation
    if (userLoaded && membershipsLoaded && (!userMemberships?.data || userMemberships.data.length === 0)) {
      if (isDomainUser) {
        // For domain users, wait before showing org creation
        setWaitingForWebhook(true)
        
        // Wait 4 seconds then reload once to check if webhook has processed
        const timer = setTimeout(() => {
          window.location.reload()
        }, 4000)
        
        // Fallback: if we're still here after 8 seconds, show org creation
        const fallbackTimer = setTimeout(() => {
          setWaitingForWebhook(false)
          setShowOrgCreation(true)
        }, 8000)
        
        return () => {
          clearTimeout(timer)
          clearTimeout(fallbackTimer)
        }
      } else {
        // For non-domain users, show org creation immediately
        setShowOrgCreation(true)
      }
    }
  }, [userLoaded, membershipsLoaded, userMemberships, isDomainUser])
  
  // Show loading while Clerk loads
  if (!userLoaded || !membershipsLoaded) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading...</p>
          </div>
        </div>
      </ViewportContainer>
    )
  }
  
  // For domain users waiting for webhook
  if (waitingForWebhook || (isDomainUser && !showOrgCreation && (!userMemberships?.data || userMemberships.data.length === 0))) {
    return (
      <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
        <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Finding your organization...</p>
            <p className="text-white/70 text-sm mt-2">Setting up your Campfire account</p>
          </div>
        </div>
      </ViewportContainer>
    )
  }
  
  // Only show org creation if explicitly allowed
  if (!showOrgCreation) {
    return null // This shouldn't happen but prevents flicker
  }
  
  // Show organization creation screen
  return (
    <ViewportContainer className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
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