'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function StartPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/dashboard-nav-test/start/onboarding')
  }, [router])
  
  return null
}