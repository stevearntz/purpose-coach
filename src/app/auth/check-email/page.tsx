'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import AuthLeftPanel from '@/components/AuthLeftPanel'

function CheckEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

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
        
        {/* Right Panel - Check Email Message */}
        <div className="flex-1 bg-white p-8 lg:p-16 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="text-center">
            <img
              src="/campfire-logo-new.png"
              alt="Campfire"
              className="h-10 w-auto mb-8 mx-auto"
            />
            
            <div className="mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check your email
              </h2>
              <p className="text-gray-600 text-sm">
                We've sent a magic link to
              </p>
              <p className="text-gray-900 font-medium mt-2">
                {email}
              </p>
              <p className="text-gray-600 text-sm mt-4">
                Click the link in your email to sign in instantly.
              </p>
              <p className="text-gray-500 text-xs mt-2">
                The link will expire in 15 minutes.
              </p>
            </div>

            <div className="border-t pt-6">
              <p className="text-gray-600 text-sm">
                Didn't receive the email?
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Check your spam folder or go back to try again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  )
}