'use client'

import { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const { isLoaded, signIn } = useSignIn()
  const [email, setEmail] = useState('')
  const [resetCode, setResetCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [stage, setStage] = useState<'email' | 'code-sent' | 'reset'>('email')
  const router = useRouter()

  // Send password reset code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    setError('')
    setIsLoading(true)

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setStage('code-sent')
    } catch (err: any) {
      console.error('Reset password error:', err)
      setError(err.errors?.[0]?.message || 'Failed to send reset code')
    } finally {
      setIsLoading(false)
    }
  }

  // Verify code and reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      })

      if (result.status === 'complete') {
        // Password reset successful, sign them in
        await signIn.setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      } else {
        setError('Password reset failed. Please try again.')
      }
    } catch (err: any) {
      console.error('Password reset error:', err)
      setError(err.errors?.[0]?.message || 'Invalid code or password')
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
        
        {/* Right Panel - Reset Password Form */}
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
                  Reset your password
                </h2>
                <p className="text-gray-600 text-sm">
                  Enter your email and we'll send you a code to reset your password
                </p>
              </>
            )}

            {/* Stage 2: Code Sent */}
            {stage === 'code-sent' && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Check your email
                </h2>
                <p className="text-gray-600 text-sm">
                  We've sent a password reset code to
                </p>
                <p className="text-gray-900 font-medium mt-2">
                  {email}
                </p>
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
            <form onSubmit={handleSendResetCode} className="space-y-4">
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
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </button>

              <p className="text-center text-sm text-gray-600">
                Remember your password?{' '}
                <Link href="/auth" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* Stage 2: Enter Code and New Password */}
          {stage === 'code-sent' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  RESET CODE
                </label>
                <input
                  id="code"
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-center text-lg font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  NEW PASSWORD
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                  CONFIRM PASSWORD
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                  placeholder="Re-enter your password"
                  minLength={8}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStage('email')}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Use a different email
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}