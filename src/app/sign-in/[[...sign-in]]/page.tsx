'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState<'email' | 'existing' | 'magic-sent' | 'manual'>('email')
  const [verificationCode, setVerificationCode] = useState('')
  const router = useRouter()

  // Check if email exists and determine next step
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    setError('')
    setIsLoading(true)

    try {
      // For now, we'll assume existing users and show the magic link option
      setStage('existing')
    } catch (err: any) {
      setError('Please enter a valid email address')
    } finally {
      setIsLoading(false)
    }
  }

  // Send magic link
  const handleSendMagicLink = async () => {
    if (!isLoaded || !signIn) return

    setError('')
    setIsLoading(true)

    try {
      await signIn.create({
        strategy: 'email_code',
        identifier: email,
      })
      setStage('magic-sent')
    } catch (err: any) {
      console.error('Magic link error:', err)
      setError(err.errors?.[0]?.message || 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify magic link code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    setError('')
    setIsLoading(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code: verificationCode,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Verification error:', err)
      setError(err.errors?.[0]?.message || 'Invalid code')
    } finally {
      setIsLoading(false)
    }
  }

  // Manual sign in with password
  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    setError('')
    setIsLoading(true)

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      setError(err.errors?.[0]?.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    if (!isLoaded || !signIn) return
    
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
        <div 
          className="hidden lg:block flex-1" 
          style={{ 
            backgroundColor: '#ffffff80'
          }}
        >
          {/* Empty for now - just the translucent panel */}
        </div>
        
        {/* Right Panel - Sign In Form */}
        <div className="flex-1 bg-white p-8 lg:p-16 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="mb-8 text-center">
            <img
              src="/campfire-logo-new.png"
              alt="Campfire"
              className="h-10 w-auto mb-8 mx-auto"
            />
            
            {/* Stage 1: Email Entry */}
            {stage === 'email' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Access your leadership tools
                </h2>
                <p className="text-gray-600 text-sm">
                  Sign in or create an account below!
                </p>
                <p className="text-purple-600 text-xs mt-2">
                  Free 30-day trial. No credit card required.
                </p>
              </>
            )}

            {/* Stage 2: Existing User - Magic Link Option */}
            {stage === 'existing' && (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Welcome back!
                </h2>
                <p className="text-gray-600 text-sm">
                  It seems you already have an account associated with
                </p>
                <p className="text-gray-900 font-medium mt-2">
                  {email}
                </p>
                <p className="text-gray-600 text-sm mt-4">
                  Choose an option below to sign in.
                </p>
              </>
            )}

            {/* Stage 3: Magic Link Sent */}
            {stage === 'magic-sent' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Check your email
                </h2>
                <p className="text-gray-600 text-sm">
                  We've sent a verification code to
                </p>
                <p className="text-gray-900 font-medium mt-2">
                  {email}
                </p>
              </>
            )}

            {/* Stage 4: Manual Sign In */}
            {stage === 'manual' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sign in to your account
                </h2>
              </>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          {/* Stage 1: Email Entry Form */}
          {stage === 'email' && (
            <>
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
                    placeholder="me@company.com"
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

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleGoogleSignIn}
                  className="flex-1 py-3 px-4 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors flex items-center justify-center gap-3"
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
            </>
          )}

          {/* Stage 2: Magic Link Option */}
          {stage === 'existing' && (
            <div className="space-y-4">
              <button
                onClick={handleSendMagicLink}
                disabled={isLoading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </button>

              <p className="text-center text-gray-600 text-sm">
                We'll email you a code for a<br />
                password free sign in.
              </p>

              <p className="text-center text-gray-600 text-sm">
                Or you can{' '}
                <button
                  onClick={() => setStage('manual')}
                  className="text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  sign in manually instead.
                </button>
              </p>

              <button
                onClick={() => setStage('email')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Use a different email
              </button>
            </div>
          )}

          {/* Stage 3: Enter Verification Code */}
          {stage === 'magic-sent' && (
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
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </button>

              <button
                type="button"
                onClick={() => setStage('existing')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back
              </button>
            </form>
          )}

          {/* Stage 4: Manual Sign In */}
          {stage === 'manual' && (
            <form onSubmit={handleManualSignIn} className="space-y-4">
              <div>
                <label htmlFor="manual-email" className="block text-sm font-medium text-gray-700 mb-1">
                  WORK EMAIL
                </label>
                <input
                  id="manual-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="me@company.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  PASSWORD
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <p className="text-center">
                <Link href="/forgot-password" className="text-purple-600 hover:text-purple-700 text-sm">
                  Forgot password
                </Link>
              </p>

              <button
                type="button"
                onClick={() => setStage('existing')}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to magic link
              </button>
            </form>
          )}

          {/* Sign up link at bottom */}
          {(stage === 'email' || stage === 'manual') && (
            <p className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign up for free
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}