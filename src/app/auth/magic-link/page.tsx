'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import AuthLeftPanel from '@/components/AuthLeftPanel'

function MagicLinkContent() {
  const { isLoaded: signInLoaded, signIn } = useSignIn()
  const { isLoaded: signUpLoaded, signUp } = useSignUp()
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [useMagicLink] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email') || ''
  const userExists = searchParams.get('exists') === 'true'
  const isLoaded = signInLoaded && signUpLoaded
  
  // We're using verification codes for better conversion rates
  // Based on Clerk's recommendation

  // Send verification code (for both sign-in and sign-up)
  const handleSendVerificationCode = async () => {
    if (!isLoaded || !signIn || !signUp) return

    setError('')
    setIsLoading(true)

    try {
      if (userExists) {
        // Existing user - sign in
        await signIn.create({ identifier: email })
        
        console.log('[Auth] Supported first factors:', signIn.supportedFirstFactors)
        
        // Always use email code for better conversion rates
        const emailCodeFactor = signIn.supportedFirstFactors?.find(
          (factor) => factor.strategy === 'email_code'
        )
        
        if (emailCodeFactor && 'emailAddressId' in emailCodeFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          })
          router.push(`/auth/verify?email=${encodeURIComponent(email)}&exists=${userExists}`)
        } else {
          console.error('[Auth] Email code factor not found. Available factors:', signIn.supportedFirstFactors)
          // Try password-based sign-in if email code isn't available
          const passwordFactor = signIn.supportedFirstFactors?.find(
            (factor) => factor.strategy === 'password'
          )
          if (passwordFactor) {
            console.log('[Auth] Falling back to password authentication')
            router.push(`/auth/manual?email=${encodeURIComponent(email)}`)
          } else {
            throw new Error('No authentication methods available. Check Clerk configuration.')
          }
        }
      } else {
        // New user - use email_code for sign-ups
        // First create the user with a temporary password (Clerk requirement)
        const tempPassword = Math.random().toString(36).slice(-16) + 'Aa1!'
        
        console.log('[Auth] Creating new user with email:', email)
        
        try {
          await signUp.create({
            emailAddress: email,
            password: tempPassword,
          })
          
          console.log('[Auth] User created, preparing email verification')
          
          // Then immediately prepare email verification
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
          router.push(`/auth/verify?email=${encodeURIComponent(email)}&exists=${userExists}`)
        } catch (signUpErr: any) {
          console.error('[Auth] Sign-up error:', signUpErr)
          if (signUpErr.errors?.[0]?.code === 'form_identifier_exists') {
            // User actually exists, redirect to sign-in flow
            console.log('[Auth] User already exists, redirecting to sign-in')
            router.push(`/auth/magic-link?email=${encodeURIComponent(email)}&exists=true`)
          } else {
            throw signUpErr
          }
        }
      }
    } catch (err: any) {
      console.error('Verification code error:', err)
      // Check if it's a CAPTCHA error and provide a cleaner message
      if (err.errors?.[0]?.code === 'captcha_required' || err.message?.includes('CAPTCHA')) {
        setError('Please try again. If the problem persists, use Google sign-in.')
      } else if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        setError('No account found with this email. Please check the email or create a new account.')
      } else if (err.errors?.[0]?.code === 'session_exists') {
        setError('You are already signed in. Redirecting to dashboard...')
        setTimeout(() => router.push('/dashboard'), 1500)
      } else if (err.errors?.[0]?.message?.includes('rate')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError(err.errors?.[0]?.message || 'Unable to send verification code. Please try again.')
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
        <AuthLeftPanel />
        
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
              onClick={handleSendVerificationCode}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isLoading ? 'Sending...' : 'Send Verification Code'}
            </button>

            <p className="text-center text-gray-600 text-sm">
              We'll email you a code to verify your account.
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