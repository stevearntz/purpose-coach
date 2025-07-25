'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ViewportContainer from './ViewportContainer'

interface ToolLayoutProps {
  children: React.ReactNode
  gradient: string // e.g., "from-[#FFA62A] to-[#DB4839]"
  isLight?: boolean // true for subsequent pages, false for intro
  showBackButton?: boolean
  backUrl?: string
  backText?: string
  showAllTools?: boolean // Show "All Tools" link on the right
}

export default function ToolLayout({ 
  children, 
  gradient,
  isLight = false,
  showBackButton = true,
  backUrl = "/?screen=4",
  backText = "Back to Plan",
  showAllTools = false
}: ToolLayoutProps) {
  const gradientClass = isLight 
    ? `bg-gradient-to-br ${gradient}/10` // Light version for working pages
    : `bg-gradient-to-br ${gradient}` // Full vibrant for intro pages
    
  const textColor = isLight
    ? "text-iris-500 hover:text-iris-700"
    : "text-white/70 hover:text-white"
  
  return (
    <ViewportContainer className={`${gradientClass} flex items-center justify-center p-4 relative`}>
      {showBackButton && (
        <Link 
          href={backUrl} 
          className={`absolute top-8 left-8 inline-flex items-center ${textColor} transition-colors`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {backText}
        </Link>
      )}
      {showAllTools && (
        <Link 
          href="/toolkit" 
          className={`absolute top-8 right-8 inline-flex items-center ${textColor} transition-colors`}
        >
          All Tools
          <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
        </Link>
      )}
      {children}
    </ViewportContainer>
  )
}