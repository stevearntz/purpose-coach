'use client'

import { CreateOrganization, OrganizationList, useOrganizationList, useUser } from '@clerk/nextjs'
import ViewportContainer from '@/components/ViewportContainer'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const { organizationList, setActive } = useOrganizationList()
  
  useEffect(() => {
    // Check if user already belongs to an organization
    if (organizationList && organizationList.length > 0) {
      // User has organizations - set the first one as active and redirect
      const firstOrg = organizationList[0]
      setActive({ organization: firstOrg.organization.id }).then(() => {
        router.push('/dashboard')
      })
    }
    
    // Also check if user email domain matches an existing org (for @getcampfire.com users)
    if (user?.primaryEmailAddress?.emailAddress?.endsWith('@getcampfire.com')) {
      // This user should already be in Campfire org via webhook
      // If they're here, something went wrong - redirect them to dashboard anyway
      router.push('/dashboard')
    }
  }, [organizationList, user, router, setActive])
  
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