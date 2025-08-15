'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function MagicLinkContent() {
  const { isLoaded: signInLoaded, signIn } = useSignIn()
  const { isLoaded: signUpLoaded, signUp } = useSignUp()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email') || ''
  const userExists = searchParams.get('exists') === 'true'
  const isLoaded = signInLoaded && signUpLoaded

  // Send magic link (for both sign-in and sign-up)
  const handleSendMagicLink = async () => {
    if (!isLoaded || !signIn || !signUp) return

    setError('')
    setIsLoading(true)

    try {
      if (userExists) {
        // Existing user - sign in with TRUE magic link (email_link)
        await signIn.create({
          strategy: 'email_link',
          identifier: email,
          redirectUrl: `${window.location.origin}/sso-callback`,
        })
        // Show success message and let them know to check email
        router.push(`/auth/check-email?email=${encodeURIComponent(email)}`)
      } else {
        // New user - For sign-ups, we need to use email_code since Clerk doesn't support email_link for sign-ups
        // First create the user with a temporary password (Clerk requirement)
        const tempPassword = Math.random().toString(36).slice(-16) + 'Aa1!'
        
        await signUp.create({
          emailAddress: email,
          password: tempPassword,
        })
        
        // Then immediately prepare email verification
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
        router.push(`/auth/verify?email=${encodeURIComponent(email)}&exists=${userExists}`)
      }
    } catch (err: any) {
      console.error('Magic link error:', err)
      // Check if it's a CAPTCHA error and provide a cleaner message
      if (err.errors?.[0]?.code === 'captcha_required' || err.message?.includes('CAPTCHA')) {
        setError('Please try again. If the problem persists, use Google sign-in.')
      } else {
        setError(err.errors?.[0]?.message || 'Failed to send magic link')
      }
    } finally {
      setIsLoading(false)
    }
  }

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
        <div 
          className="hidden lg:block flex-1" 
          style={{ 
            backgroundColor: '#ffffff80'
          }}
        >
          {/* Empty for now - just the translucent panel */}
        </div>
        
        {/* Right Panel - Auth Form */}
        <div className="flex-1 bg-white p-8 lg:p-16 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8 text-center">
            <img
              src="/campfire-logo-new.png"
              alt="Campfire"
              className="h-10 w-auto mb-8 mx-auto"
            />
            
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {userExists ? 'Welcome back!' : 'Welcome to Campfire!'}
            </h2>
            <p className="text-gray-600 text-sm">
              {userExists 
                ? 'It seems you already have an account associated with' 
                : "Let's create your account with"}
            </p>
            <p className="text-gray-900 font-medium mt-2">
              {email}
            </p>
            <p className="text-gray-600 text-sm mt-4">
              {userExists 
                ? 'Choose an option below to sign in.'
                : 'Click below to get started!'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleSendMagicLink}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isLoading ? 'Sending...' : (userExists ? 'Send Magic Link' : 'Send Verification Code')}
            </button>

            <p className="text-center text-gray-600 text-sm">
              {userExists 
                ? "We'll email you a link for instant sign in."
                : "We'll email you a code to verify your account."}
            </p>

            {/* Hidden CAPTCHA element for Clerk to use when needed */}
            {!userExists && <div id="clerk-captcha" style={{ display: 'none' }} />}

            {userExists && (
              <p className="text-center text-gray-600 text-sm">
                Or you can{' '}
                <Link
                  href={`/auth/manual?email=${encodeURIComponent(email)}`}
                  className="text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  sign in manually instead.
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  )
}