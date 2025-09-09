'use client'

import { useRouter } from 'next/navigation'
import { useOrganization, useUser } from '@clerk/nextjs'
import { useEffect, useState, ReactNode } from 'react'

interface AuthLoadingGuardProps {
  children: ReactNode
  requireAuth?: boolean
  redirectTo?: string
  onProfileReady?: (profile: any) => void
  loadingMessage?: string
}

export default function AuthLoadingGuard({
  children,
  requireAuth = true,
  redirectTo = '/sign-in',
  onProfileReady,
  loadingMessage = 'Setting up your workspace...'
}: AuthLoadingGuardProps) {
  const router = useRouter()
  const { membership, isLoaded: orgLoaded } = useOrganization()
  const { user, isLoaded: userLoaded, isSignedIn } = useUser()
  const [profileStatus, setProfileStatus] = useState<'checking' | 'ready' | 'error'>('checking')
  const [profileData, setProfileData] = useState<any>(null)
  
  useEffect(() => {
    // Wait for both Clerk org and user to be fully loaded
    if (!orgLoaded || !userLoaded) {
      return
    }
    
    // If auth is required and user is not signed in, redirect
    if (requireAuth && !isSignedIn) {
      const returnUrl = typeof window !== 'undefined' 
        ? window.location.pathname + window.location.search
        : ''
      const signInUrl = `${redirectTo}?redirect_url=${encodeURIComponent(returnUrl)}`
      router.push(signInUrl)
      return
    }
    
    if (!user) {
      return
    }
    
    // Check and potentially create profile with retry logic
    const ensureProfileExists = async () => {
      let retries = 0
      const maxRetries = 3
      const retryDelay = 1000 // 1 second
      
      while (retries < maxRetries) {
        try {
          console.log(`[AuthLoadingGuard] Checking profile (attempt ${retries + 1})...`)
          const response = await fetch('/api/user/profile')
          
          if (response.ok) {
            const data = await response.json()
            
            if (data.profile) {
              console.log('[AuthLoadingGuard] Profile found:', data.profile)
              setProfileData(data.profile)
              setProfileStatus('ready')
              
              // Call the callback if provided
              if (onProfileReady) {
                onProfileReady(data.profile)
              }
              
              return
            } else {
              console.log('[AuthLoadingGuard] Profile is null, retrying...')
              // Profile might still be creating, wait and retry
              if (retries < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, retryDelay))
                retries++
                continue
              }
            }
          }
          
          // If we get here after all retries, profile still doesn't exist
          console.log('[AuthLoadingGuard] Profile not found after retries')
          setProfileStatus('ready') // Still set to ready to show content
          return
          
        } catch (error) {
          console.error(`[AuthLoadingGuard] Error checking profile (attempt ${retries + 1}):`, error)
          retries++
          
          if (retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay))
          } else {
            // After all retries failed
            console.error('[AuthLoadingGuard] Failed to check profile after all retries')
            setProfileStatus('error')
            return
          }
        }
      }
    }
    
    if (isSignedIn) {
      ensureProfileExists()
    } else {
      // Not signed in and not requiring auth, just show content
      setProfileStatus('ready')
    }
  }, [orgLoaded, userLoaded, user, isSignedIn, requireAuth, redirectTo, router, onProfileReady])
  
  // Show loading state while checking
  if (!userLoaded || !orgLoaded || profileStatus === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 mb-2">{loadingMessage}</p>
          <p className="text-white/40 text-sm">
            {!orgLoaded && 'Loading organization...'}
            {!userLoaded && 'Loading user data...'}
            {orgLoaded && userLoaded && profileStatus === 'checking' && 'Creating your profile...'}
          </p>
        </div>
      </div>
    )
  }
  
  // Show error state
  if (profileStatus === 'error') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-400 mb-2">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }
  
  // Ready - render children with profile data available
  return <>{children}</>
}