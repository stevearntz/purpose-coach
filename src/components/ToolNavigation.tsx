import Link from 'next/link'
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
  const textColor = variant === 'light' 
    ? 'text-white/70 hover:text-white' 
    : 'text-gray-600 hover:text-gray-900'

  return (
    <>
      <Link 
        href={toolNavigation.backToPlan.href}
        className={`absolute top-8 left-8 inline-flex items-center ${textColor} transition-colors ${className}`}
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        {toolNavigation.backToPlan.label}
      </Link>
      
      <Link 
        href={toolNavigation.allTools.href}
        className={`absolute top-8 right-8 inline-flex items-center ${textColor} transition-colors ${className}`}
      >
        {toolNavigation.allTools.label}
        <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
      </Link>
    </>
  )
}