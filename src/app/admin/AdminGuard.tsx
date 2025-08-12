'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  useEffect(() => {
    checkAdminAuth()
  }, [])
  
  const checkAdminAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      })
      
      if (!response.ok) {
        router.push('/login?redirect=/admin')
        return
      }
      
      const data = await response.json()
      
      // Check if user is from Campfire company (system admin)
      if (data.company?.toLowerCase() === 'campfire') {
        setIsAuthorized(true)
      } else {
        // Not a Campfire admin, redirect to regular dashboard
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login?redirect=/admin')
    } finally {
      setIsLoading(false)
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl">Unauthorized Access</p>
          <p className="text-gray-600 mt-2">This page is restricted to Campfire administrators.</p>
        </div>
      </div>
    )
  }
  
  return <>{children}</>
}