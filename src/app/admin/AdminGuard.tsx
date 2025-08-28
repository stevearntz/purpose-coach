'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  useEffect(() => {
    if (!isLoaded) return
    
    if (!user) {
      router.push('/sign-in?redirect_url=/admin')
      return
    }
    
    // Check if user is a Campfire admin by email
    const adminEmails = ['steve@getcampfire.com']
    const userEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase()
    
    if (userEmail && adminEmails.includes(userEmail)) {
      setIsAuthorized(true)
    } else {
      // Not a Campfire admin, redirect to regular dashboard
      router.push('/dashboard')
    }
  }, [user, isLoaded, router])
  
  if (!isLoaded) {
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