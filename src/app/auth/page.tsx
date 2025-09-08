'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSignIn, useSignUp, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthLeftPanel from '@/components/AuthLeftPanel'

function AuthEmailContent() {
  const { isLoaded: signInLoaded, signIn } = useSignIn()
  const { isLoaded: signUpLoaded, signUp } = useSignUp()
  const { isSignedIn, isLoaded: userLoaded } = useUser()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get('redirect_url')

  const isLoaded = signInLoaded && signUpLoaded && userLoaded

  // Check for errors from SSO callback
  useEffect(() => {
    const storedError = sessionStorage.getItem('authError')
    if (storedError) {
      setError(storedError)
      sessionStorage.removeItem('authError')
    }
  }, [])

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn && userLoaded) {
      // If we have a redirect URL (e.g., from assessment), go there
      if (redirectUrl) {
        console.log('[Auth] User signed in, redirecting to:', redirectUrl)
        window.location.href = redirectUrl
      } else {
        router.push('/dashboard')
      }
    }
  }, [isSignedIn, userLoaded, router, redirectUrl])
  
  // Show loading state while checking auth status
  if (!userLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  // If signed in but not redirected yet, show loading
  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  // Check if email exists and determine next step
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn || !signUp) return

    setError('')
    setIsLoading(true)

    try {
      // Try to create a sign-in - this will tell us if user exists
      try {
        await signIn.create({
          identifier: email,
        })
        // If we get here, user exists
        const redirectParam = redirectUrl ? `&redirect_url=${encodeURIComponent(redirectUrl)}` : ''
        router.push(`/auth/magic-link?email=${encodeURIComponent(email)}&exists=true${redirectParam}`)
      } catch (err: any) {
        // Check if error is because user doesn't exist
        if (err.errors?.[0]?.code === 'form_identifier_not_found') {
          // User doesn't exist - they need to sign up
          const redirectParam = redirectUrl ? `&redirect_url=${encodeURIComponent(redirectUrl)}` : ''
          router.push(`/auth/magic-link?email=${encodeURIComponent(email)}&exists=false${redirectParam}`)
        } else {
          // Some other error
          throw err
        }
      }
    } catch (err: any) {
      console.error('Email check error:', err)
      setError('Please enter a valid email address')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return
    
    // If already signed in, just redirect
    if (isSignedIn) {
      router.push('/dashboard')
      return
    }
    
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/dashboard'
      })
    } catch (err: any) {
      console.error('Google sign in error:', err)
      setError('Failed to sign in with Google. Please try again.')
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
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access your leadership tools
            </h2>
            <p className="text-gray-700 text-base font-medium">
              Sign in or create an account below!
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                WORK EMAIL
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="name@workemail.com"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
            >
              {isLoading ? 'Loading...' : 'Next'}
            </button>
          </form>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              WITH GOOGLE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <AuthEmailContent />
    </Suspense>
  )
}