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
  
  // If member, redirect to dashboard sub-page
  useEffect(() => {
    if (isLoaded && isMember) {
      router.push('/dashboard/start/dashboard')
    }
  }, [isLoaded, isMember, router])
  
  // Show loading while checking membership
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }
  
  // If member, show loading while redirecting
  if (isMember) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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