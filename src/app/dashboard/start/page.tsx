'use client'

import { useRouter } from 'next/navigation'
import { useOrganization } from '@clerk/nextjs'
import { useEffect } from 'react'
import StartTab from '@/components/StartTab'

export default function StartPage() {
  const router = useRouter()
  const { membership, isLoaded } = useOrganization()
  
  // Check if user is a member (not admin)
  const isMember = membership?.role === 'org:member'
  
  // Redirect members to their area
  useEffect(() => {
    if (isLoaded && isMember) {
      router.replace('/dashboard/member/start')
    }
  }, [isLoaded, isMember, router])
  
  // Show loading while checking membership
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading...</p>
        </div>
      </div>
    )
  }
  
  // If member, show loading while redirecting
  if (isMember) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Redirecting...</p>
        </div>
      </div>
    )
  }
  
  // For admins, show the full Start tab
  const handleNavigate = (tab: string) => {
    if (tab === 'onboarding') {
      router.push('/dashboard/onboarding')
    }
  }
  
  return <StartTab onNavigate={handleNavigate} />
}