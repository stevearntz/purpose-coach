'use client'

import { CreateOrganization, OrganizationList } from '@clerk/nextjs'
import ViewportContainer from '@/components/ViewportContainer'

export default function OnboardingPage() {
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