'use client'

import { useRouter } from 'next/navigation'
import { useOrganization } from '@clerk/nextjs'
import StartTab from '@/components/StartTab'

export default function StartPage() {
  const router = useRouter()
  const { membership } = useOrganization()
  
  // Check if user is a member (not admin)
  const isMember = membership?.role === 'org:member'
  
  // If member, show simple Hello World
  if (isMember) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-4xl font-bold text-white">Hello World</h1>
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