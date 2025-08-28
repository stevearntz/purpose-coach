'use client'

import { useRouter } from 'next/navigation'
import { useOrganization } from '@clerk/nextjs'
import { useEffect } from 'react'
import StartTab from '@/components/StartTab'

export default function StartPage() {
  const router = useRouter()
  const { membership } = useOrganization()
  
  // Check if user is a member (not admin)
  const isMember = membership?.role === 'org:member'
  
  // If member, redirect to dashboard sub-page
  useEffect(() => {
    if (isMember) {
      router.push('/dashboard/start/dashboard')
    }
  }, [isMember, router])
  
  // For admins, show the full Start tab
  const handleNavigate = (tab: string) => {
    if (tab === 'onboarding') {
      router.push('/dashboard/onboarding')
    }
  }
  
  return <StartTab onNavigate={handleNavigate} />
}