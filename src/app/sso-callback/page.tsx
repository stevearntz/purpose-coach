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
          afterSignInUrl: '/dashboard',
          afterSignUpUrl: '/onboarding'
        })
      } catch (error) {
        console.error('SSO callback error:', error)
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