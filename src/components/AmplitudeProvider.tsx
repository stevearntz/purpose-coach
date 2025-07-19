'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initAmplitude, trackPageView } from '@/lib/amplitude'

function AmplitudeProviderInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize Amplitude on mount
  useEffect(() => {
    try {
      initAmplitude()
    } catch (error) {
      console.warn('Failed to initialize Amplitude:', error)
    }
  }, [])

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      try {
        // Get a friendly page name from the pathname
        const pageName = pathname === '/' 
          ? 'Home' 
          : pathname.split('/').filter(Boolean).map(part => 
              part.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')
            ).join(' - ')
        
        trackPageView(pageName, {
          referrer: document.referrer,
          search_params: Object.fromEntries(searchParams.entries()),
        })
      } catch (error) {
        console.warn('Failed to track page view:', error)
      }
    }
  }, [pathname, searchParams])

  return <>{children}</>
}

export default function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<>{children}</>}>
      <AmplitudeProviderInner>{children}</AmplitudeProviderInner>
    </Suspense>
  )
}