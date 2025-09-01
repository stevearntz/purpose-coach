'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toolNavigation } from '@/lib/navigationConfig'

interface ToolNavigationProps {
  className?: string
  variant?: 'light' | 'dark'
}

export default function ToolNavigation({ 
  className = '', 
  variant = 'light' 
}: ToolNavigationProps) {
  const searchParams = useSearchParams()
  const context = searchParams.get('context')
  const returnUrl = searchParams.get('returnUrl')
  
  const textColor = variant === 'light' 
    ? 'text-white/70 hover:text-white' 
    : 'text-gray-600 hover:text-gray-900'

  // Determine navigation based on context
  let leftNav = {
    href: toolNavigation.backToPlan.href,
    label: toolNavigation.backToPlan.label
  }
  let rightNav = {
    href: toolNavigation.allTools.href, 
    label: toolNavigation.allTools.label
  }

  // Customize navigation based on context
  if (context === 'member-dashboard' && returnUrl) {
    leftNav = {
      href: returnUrl,
      label: 'Back to Dashboard'
    }
    // Hide right navigation for member dashboard context
    rightNav = null as any
  } else if (context === 'admin-dashboard' && returnUrl) {
    leftNav = {
      href: returnUrl,
      label: 'Back to Campaigns'
    }
    rightNav = {
      href: '/dashboard/admin/start/assessments',
      label: 'All Assessments'
    }
  }

  return (
    <>
      <Link 
        href={leftNav.href}
        className={`absolute top-8 left-8 inline-flex items-center ${textColor} transition-colors ${className}`}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {leftNav.label}
      </Link>
      
      {rightNav && (
        <Link 
          href={rightNav.href}
          className={`absolute top-8 right-8 inline-flex items-center ${textColor} transition-colors ${className}`}
        >
          {rightNav.label}
          <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
        </Link>
      )}
    </>
  )
}