'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Don't scroll to top if there's a hash in the URL (anchor link)
    if (window.location.hash) {
      return
    }

    // Scroll to top when pathname changes
    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0)

    return () => clearTimeout(timer)
  }, [pathname])

  return null
}