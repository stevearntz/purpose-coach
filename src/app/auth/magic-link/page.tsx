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
  const redirectUrl = searchParams.get('redirect_url')
  const isLoaded = signInLoaded && signUpLoaded
  
  // Add state for name collection
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [showNameCollection, setShowNameCollection] = useState(false)
  
  // We're using verification codes for better conversion rates
  // Based on Clerk's recommendation

  // Check if email exists (called when "Send Verification Code" is clicked)
  const handleCheckEmail = async () => {
    if (!isLoaded || !signIn) return

    setError('')
    setIsLoading(true)

    try {
      // Try to create a sign-in to check if user exists
      console.log('[Auth] Checking if user exists for email:', email)
      
      await signIn.create({ identifier: email })
      
      // If we get here, user exists - send verification code
      console.log('[Auth] User exists, sending verification code')
      
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
        const redirectParam = redirectUrl ? `&redirect_url=${encodeURIComponent(redirectUrl)}` : ''
        router.push(`/auth/verify?email=${encodeURIComponent(email)}&exists=true${redirectParam}`)
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
    } catch (err: any) {
      // Check if error is because user doesn't exist
      if (err.errors?.[0]?.code === 'form_identifier_not_found') {
        // User doesn't exist - show name collection form
        console.log('[Auth] User does not exist, showing name collection form')
        setShowNameCollection(true)
        setIsLoading(false)
        return
      }
      
      // Handle other errors
      console.error('Email check error:', err)
      if (err.errors?.[0]?.code === 'captcha_required' || err.message?.includes('CAPTCHA')) {
        setError('Please try again. If the problem persists, use Google sign-in.')
      } else if (err.errors?.[0]?.code === 'session_exists') {
        setError('You are already signed in. Redirecting to dashboard...')
        setTimeout(() => router.push('/dashboard'), 1500)
      } else if (err.errors?.[0]?.message?.includes('rate')) {
        setError('Too many attempts. Please wait a moment and try again.')
      } else {
        setError(err.errors?.[0]?.message || 'Unable to process request. Please try again.')
      }
      setIsLoading(false)
    }
  }

  // Handle name submission and account creation for new users
  const handleNameSubmit = async () => {
    if (!isLoaded || !signUp) return
    
    setError('')
    setIsLoading(true)
    
    try {
      // Create account with names
      const tempPassword = Math.random().toString(36).slice(-16) + 'Aa1!'
      
      console.log('[Auth] Creating new user with email and names:', email, firstName, lastName)
      
      await signUp.create({
        emailAddress: email,
        password: tempPassword,
        firstName: firstName,
        lastName: lastName,
      })
      
      console.log('[Auth] User created with names, preparing email verification')
      
      // Then immediately prepare email verification
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      const redirectParam = redirectUrl ? `&redirect_url=${encodeURIComponent(redirectUrl)}` : ''
      const nameParams = `&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`
      router.push(`/auth/verify?email=${encodeURIComponent(email)}&exists=false${redirectParam}${nameParams}`)
    } catch (signUpErr: any) {
      console.error('[Auth] Sign-up error:', signUpErr)
      if (signUpErr.errors?.[0]?.code === 'form_identifier_exists') {
        // User actually exists, redirect to verification
        console.log('[Auth] User already exists, sending to verification')
        setShowNameCollection(false)
        await handleCheckEmail() // Try the sign-in flow again
      } else {
        setError(signUpErr.errors?.[0]?.message || 'Unable to create account. Please try again.')
        setIsLoading(false)
      }
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
              Welcome to Campfire!
            </h2>
            <p className="text-gray-600 text-sm">
              Let's get you signed in with
            </p>
            <p className="text-gray-900 font-medium mt-2">
              {email}
            </p>
            <p className="text-gray-600 text-sm mt-4">
              Click below to continue
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {!showNameCollection ? (
              <>
                <button
                  onClick={handleCheckEmail}
                  disabled={isLoading}
                  className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                >
                  {isLoading ? 'Checking...' : 'Continue'}
                </button>

                <p className="text-center text-gray-600 text-sm">
                  We'll check if you have an account and guide you through the next steps.
                </p>

                {/* Hidden CAPTCHA element for Clerk to use when needed */}
                {!userExists && <div id="clerk-captcha" style={{ display: 'none' }} />}

                {userExists && (
                  <p className="text-center text-gray-600 text-sm">
                    Or you can{' '}
                    <Link
                      href={`/auth/manual?email=${encodeURIComponent(email)}${redirectUrl ? `&redirect_url=${encodeURIComponent(redirectUrl)}` : ''}`}
                      className="text-purple-600 hover:text-purple-700 font-medium underline"
                    >
                      sign in manually instead.
                    </Link>
                  </p>
                )}
              </>
            ) : (
              <>
                {/* Name Collection Form for New Users */}
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Almost there!</strong> We just need your name to complete your account setup.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      FIRST NAME
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Jane"
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      LAST NAME
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                      placeholder="Doe"
                      required
                    />
                  </div>
                  
                  <button
                    onClick={handleNameSubmit}
                    disabled={isLoading || !firstName.trim() || !lastName.trim()}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account & Send Code'}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowNameCollection(false)
                      setFirstName('')
                      setLastName('')
                    }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                </div>
              </>
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