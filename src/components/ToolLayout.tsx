'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ToolLayoutProps {
  children: React.ReactNode
  gradient: string // e.g., "from-[#FFA62A] to-[#DB4839]"
  isLight?: boolean // true for subsequent pages, false for intro
  showBackButton?: boolean
  backUrl?: string
  backText?: string
}

export default function ToolLayout({ 
  children, 
  gradient,
  isLight = false,
  showBackButton = true,
  backUrl = "/?screen=4",
  backText = "Back to Plan"
}: ToolLayoutProps) {
  const gradientClass = isLight 
    ? `bg-gradient-to-br ${gradient}/10` // Light version for working pages
    : `bg-gradient-to-br ${gradient}` // Full vibrant for intro pages
    
  const textColor = isLight
    ? "text-iris-500 hover:text-iris-700"
    : "text-white/70 hover:text-white"
  
  return (
    <div className={`min-h-screen ${gradientClass} flex flex-col items-center justify-center p-4`}>
      {showBackButton && (
        <Link 
          href={backUrl} 
          className={`absolute top-8 left-8 inline-flex items-center ${textColor} transition-colors`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {backText}
        </Link>
      )}
      {children}
    </div>
  )
}