'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface AuthenticatedToolNavigationProps {
  className?: string
  variant?: 'light' | 'dark'
}

export default function AuthenticatedToolNavigation({ 
  className = '', 
  variant = 'light' 
}: AuthenticatedToolNavigationProps) {
  const textColor = variant === 'light' 
    ? 'text-white/70 hover:text-white' 
    : 'text-gray-600 hover:text-gray-900'

  return (
    <>
      {/* Left Navigation - My Dashboard */}
      <Link 
        href="/dashboard/member/start/dashboard"
        className={`absolute top-8 left-8 inline-flex items-center ${textColor} transition-colors ${className}`}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        <span>My Dashboard</span>
      </Link>
      
      {/* No right navigation for authenticated assessments */}
    </>
  )
}