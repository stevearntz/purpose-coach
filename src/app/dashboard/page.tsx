'use client'

import { useRouter } from 'next/navigation'
import { useOrganization } from '@clerk/nextjs'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { membership, isLoaded } = useOrganization()
  
  useEffect(() => {
    if (isLoaded) {
      const isMember = membership?.role === 'org:member'
      if (isMember) {
        router.replace('/dashboard/member/start/dashboard')
      } else {
        router.replace('/dashboard/start')
      }
    }
  }, [isLoaded, membership, router])
  
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  )
}