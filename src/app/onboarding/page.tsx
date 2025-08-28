'use client'

import { CreateOrganization, OrganizationList, useOrganizationList, useUser } from '@clerk/nextjs'
import ViewportContainer from '@/components/ViewportContainer'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isCheckingDomain, setIsCheckingDomain] = useState(false)
  const hasSetOrg = useRef(false) // Prevent multiple redirects
  const { userMemberships, setActive, isLoaded } = useOrganizationList({
    userMemberships: {
      infinite: false,
    },
  })
  
  useEffect(() => {
    // Check if user already belongs to an organization
    if (!hasSetOrg.current && userMemberships?.data && userMemberships.data.length > 0 && setActive) {
      hasSetOrg.current = true
      // User has organizations - set the first one as active and redirect
      const firstOrg = userMemberships.data[0]
      console.log('Setting active organization:', firstOrg.organization.name)
      setActive({ organization: firstOrg.organization.id }).then(() => {
        console.log('Organization set, redirecting to dashboard')
        // Force a hard navigation to ensure session is updated
        window.location.href = '/dashboard'
      })
    }
  }, [userMemberships, setActive])
  
  useEffect(() => {
    // For domain-matched users, check if webhook has added them to org
    const emailDomain = user?.primaryEmailAddress?.emailAddress?.split('@')[1]
    const isDomainUser = emailDomain === 'getcampfire.com'
    
    if (isDomainUser && isLoaded && !hasSetOrg.current) {
      setIsCheckingDomain(true)
      
      let attempts = 0
      const maxAttempts = 8
      
      // Poll for organization membership
      const checkForMembership = async () => {
        const checkInterval = setInterval(async () => {
          attempts++
          console.log(`Checking for org membership (attempt ${attempts}/${maxAttempts})...`)
          
          try {
            // Force a fresh fetch of memberships
            if (userMemberships?.revalidate) {
              await userMemberships.revalidate()
            }
          } catch (error) {
            console.error('Error checking memberships:', error)
          }
          
          // Check if memberships are now available
          const memberships = userMemberships?.data || []
          if (memberships.length > 0 && !hasSetOrg.current) {
            console.log('Organization membership found!', memberships[0].organization.name)
            clearInterval(checkInterval)
            setIsCheckingDomain(false)
            // The other useEffect will handle setting active org and redirect
          } else if (attempts >= maxAttempts) {
            console.log('Max attempts reached, showing create org screen')
            clearInterval(checkInterval)
            setIsCheckingDomain(false)
          }
        }, 2000) // Check every 2 seconds
        
        return () => clearInterval(checkInterval)
      }
      
      // Start checking after a brief delay to let webhook process
      setTimeout(checkForMembership, 1000)
    }
  }, [user, isLoaded, userMemberships])
  
  // Show loading state while checking domain
  if (isCheckingDomain || !isLoaded) {
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