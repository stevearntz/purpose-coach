'use client'

import { useRouter } from 'next/navigation'
import { useOrganization, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { membership, isLoaded: orgLoaded } = useOrganization()
  const { user, isLoaded: userLoaded } = useUser()
  const [profileStatus, setProfileStatus] = useState<'checking' | 'ready' | 'error'>('checking')
  const [profileData, setProfileData] = useState<any>(null)
  
  useEffect(() => {
    // Wait for both Clerk org and user to be fully loaded
    if (!orgLoaded || !userLoaded) {
      return
    }
    
    if (!user) {
      return
    }
    
    const isMember = membership?.role === 'org:member'
    
    if (isMember) {
      // Check and potentially create profile with retry logic
      const ensureProfileExists = async () => {
        let retries = 0
        const maxRetries = 3
        const retryDelay = 1000 // 1 second
        
        while (retries < maxRetries) {
          try {
            console.log(`[Dashboard] Checking profile (attempt ${retries + 1})...`)
            const response = await fetch('/api/user/profile')
            
            if (response.ok) {
              const data = await response.json()
              
              if (data.profile) {
                console.log('[Dashboard] Profile found:', data.profile)
                setProfileData(data.profile)
                setProfileStatus('ready')
                
                // Check if user is trying to access an assessment (has redirect_url)
                const urlParams = new URLSearchParams(window.location.search)
                const redirectUrl = urlParams.get('redirect_url')
                
                // If coming from an assessment, let them continue there
                if (redirectUrl && redirectUrl.includes('/people-leader-needs')) {
                  console.log('[Dashboard] User came from assessment, not redirecting')
                  // Don't redirect, let the original flow continue
                  window.location.href = redirectUrl
                  return
                }
                
                // Always redirect to dashboard - users will see onboarding card in Next Up if needed
                console.log('[Dashboard] Redirecting to dashboard...')
                router.replace('/dashboard/member/start/dashboard')
                return
              } else {
                console.log('[Dashboard] Profile is null, retrying...')
                // Profile might still be creating, wait and retry
                if (retries < maxRetries - 1) {
                  await new Promise(resolve => setTimeout(resolve, retryDelay))
                  retries++
                  continue
                }
              }
            }
            
            // If we get here after all retries, profile still doesn't exist
            // This shouldn't happen with our new auto-create logic, but just in case
            console.log('[Dashboard] Profile not found after retries, redirecting to dashboard anyway')
            router.replace('/dashboard/member/start/dashboard')
            return
            
          } catch (error) {
            console.error(`[Dashboard] Error checking profile (attempt ${retries + 1}):`, error)
            retries++
            
            if (retries < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, retryDelay))
            } else {
              // After all retries failed, default to dashboard
              console.error('[Dashboard] Failed to check profile after all retries')
              setProfileStatus('error')
              router.replace('/dashboard/member/start/dashboard')
              return
            }
          }
        }
      }
      
      ensureProfileExists()
    } else if (orgLoaded) {
      // Admin or no membership
      router.replace('/dashboard/start')
    }
  }, [orgLoaded, userLoaded, membership, user, router])
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60 mb-2">Setting up your workspace...</p>
        <p className="text-white/40 text-sm">
          {!orgLoaded && 'Loading organization...'}
          {!userLoaded && 'Loading user data...'}
          {orgLoaded && userLoaded && profileStatus === 'checking' && 'Creating your profile...'}
        </p>
      </div>
    </div>
  )
}