'use client'

import { SignIn } from '@clerk/nextjs'
import AuthLeftPanel from '@/components/AuthLeftPanel'

export default function AuthNewPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Full page background image */}
      <img
        src="/purple-sign-in-background.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="relative z-10 w-full max-w-7xl mx-4 flex shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Panel - Translucent white background */}
        <AuthLeftPanel />
        
        {/* Right Panel - Clerk SignIn Component */}
        <div className="flex-1 bg-white p-8 lg:p-16 flex items-center justify-center">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
                card: 'shadow-none',
                headerTitle: 'hidden',
                headerSubtitle: 'hidden',
                footer: 'hidden'
              }
            }}
            routing="hash"
            signUpUrl="/auth-new"
            afterSignInUrl="/dashboard"
            afterSignUpUrl="/onboarding"
          />
        </div>
      </div>
    </div>
  )
}