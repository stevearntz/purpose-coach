'use client'

import { useRouter } from 'next/navigation'
import OnboardingTab from '@/components/OnboardingTab'

export default function OnboardingPage() {
  const router = useRouter()
  
  const handleNavigate = (tab: string) => {
    // Map the tab names to actual routes
    const routes: Record<string, string> = {
      users: '/dashboard/users',
      participants: '/dashboard/users', // Keep for backward compatibility
      assessments: '/dashboard/assessments',
      recommendations: '/dashboard/recommendations'
    }
    
    if (routes[tab]) {
      router.push(routes[tab])
    }
  }
  
  return <OnboardingTab onNavigate={handleNavigate} />
}