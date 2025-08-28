'use client'

import { useState, Suspense } from 'react'
import { useSignIn, useSignUp } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthLeftPanel from '@/components/AuthLeftPanel'

function VerifyContent() {
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn()
  const { isLoaded: signUpLoaded, signUp } = useSignUp()
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSettingUpOrg, setIsSettingUpOrg] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const email = searchParams.get('email') || ''
  const userExists = searchParams.get('exists') === 'true'
  const isLoaded = signInLoaded && signUpLoaded

  // Verify magic link code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn || !signUp) return

    setError('')
    setIsLoading(true)

    try {
      if (userExists) {
        // Existing user - verify sign-in
        const result = await signIn.attemptFirstFactor({
          strategy: 'email_code',
          code: verificationCode,
        })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          router.push('/dashboard')
        }
      } else {
        // New user - verify sign-up
        const result = await signUp.attemptEmailAddressVerification({
          code: verificationCode,
        })

        if (result.status === 'complete') {
          await setActive({ session: result.createdSessionId })
          
          // For domain users, give webhook time to add them to org
          const userEmail = email.toLowerCase()
          if (userEmail.endsWith('@getcampfire.com')) {
            // Show loading state and wait for webhook
            setIsSettingUpOrg(true)
            setIsLoading(false)
            setError('') // Clear any errors
            // Wait 5 seconds for webhook to process
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
          
          router.push('/onboarding')
        } else {
          // Sign-up not complete - log what's missing
          console.error('Sign-up incomplete:', result)
          setError(`Sign-up incomplete: ${result.status}. Please try again.`)
        }
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      
      // Handle specific error cases
      if (err.errors?.[0]?.code === 'verification_already_verified' || 
          err.errors?.[0]?.message?.includes('already been verified')) {
        // The verification was already completed, try to redirect
        if (userExists) {
          router.push('/dashboard')
        } else {
          router.push('/onboarding')
        }
      } else if (err.errors?.[0]?.code === 'form_code_incorrect') {
        setError('Invalid verification code. Please check and try again.')
      } else if (err.errors?.[0]?.code === 'verification_expired') {
        setError('This code has expired. Please go back and request a new one.')
      } else {
        setError(err.errors?.[0]?.message || 'Invalid code')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state when setting up organization
  if (isSettingUpOrg) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <img
          src="/purple-sign-in-background.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-10 w-full max-w-7xl mx-4 flex shadow-2xl rounded-3xl overflow-hidden">
          <AuthLeftPanel />
          
          <div className="flex-1 bg-white p-8 lg:p-16 flex flex-col justify-center max-w-md mx-auto w-full">
            <div className="text-center">
              <img
                src="/campfire-logo-new.png"
                alt="Campfire"
                className="h-10 w-auto mb-8 mx-auto"
              />
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Finding your organization...</h2>
              <p className="text-gray-600">Setting up your Campfire workspace</p>
            </div>
          </div>
        </div>
      </div>
    )
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
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h2>
            <p className="text-gray-600 text-sm">
              We've sent a verification code to
            </p>
            <p className="text-gray-900 font-medium mt-2">
              {email}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                VERIFICATION CODE
              </label>
              <input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-center text-lg font-mono"
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isLoading ? 'Verifying...' : userExists ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}