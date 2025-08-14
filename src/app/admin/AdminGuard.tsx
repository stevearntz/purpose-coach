'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isAuthorized, setIsAuthorized] = useState(false)
  
  useEffect(() => {
    // TEMPORARY: In production, bypass auth for admin
    const isProduction = process.env.NODE_ENV === 'production' || 
                        window.location.hostname === 'tools.getcampfire.com'
    
    if (isProduction) {
      // Temporary bypass for production
      setIsAuthorized(true)
      return
    }
    
    // Normal auth flow for development
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login?callbackUrl=/admin')
      return
    }
    
    // Check if user is from Campfire company (system admin)
    if (session.user?.companyName?.toLowerCase() === 'campfire') {
      setIsAuthorized(true)
    } else {
      // Not a Campfire admin, redirect to regular dashboard
      router.push('/dashboard')
    }
  }, [session, status, router])
  
  if (status === 'loading') {
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