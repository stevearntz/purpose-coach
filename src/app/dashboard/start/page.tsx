'use client'

import { useRouter } from 'next/navigation'
import StartTab from '@/components/StartTab'

export default function StartPage() {
  const router = useRouter()
  
  const handleNavigate = (tab: string) => {
    if (tab === 'onboarding') {
      router.push('/dashboard/onboarding')
    }
  }
  
  return <StartTab onNavigate={handleNavigate} />
}