'use client'

import { useEffect } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk()
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback({
          redirectUrl: '/dashboard',
          fallbackRedirectUrl: '/dashboard',
          afterSignUpUrl: '/onboarding'
        })
      } catch (error: any) {
        console.error('SSO callback error:', error)
        // Store error message in session storage to display on auth page
        if (error?.errors?.[0]?.code === 'invalid_magic_link') {
          sessionStorage.setItem('authError', 'This magic link has expired or already been used. Please request a new one.')
        } else if (error?.errors?.[0]?.code === 'session_exists') {
          // Already signed in, just redirect
          router.push('/dashboard')
          return
        } else {
          sessionStorage.setItem('authError', error?.errors?.[0]?.message || 'Unable to complete sign in. Please try again.')
        }
        router.push('/auth')
      }
    }
    
    handleCallback()
  }, [handleRedirectCallback, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}