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

    // Immediately try to scroll
    window.scrollTo(0, 0)
    
    // Also scroll after a short delay to handle dynamic content
    const timer1 = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 0)
    
    // And once more after a slightly longer delay for slower content
    const timer2 = setTimeout(() => {
      window.scrollTo(0, 0)
    }, 100)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [pathname])

  return null
}