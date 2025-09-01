import { Suspense } from 'react'
import ToolNavigation from './ToolNavigation'

interface ToolNavigationWrapperProps {
  className?: string
  variant?: 'light' | 'dark'
}

// Fallback navigation for loading state
function NavigationFallback({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const textColor = variant === 'light' 
    ? 'text-white/70' 
    : 'text-gray-600'
    
  return (
    <>
      <div className={`absolute top-8 left-8 inline-flex items-center ${textColor}`}>
        <div className="w-5 h-5 mr-2" />
        <span>Back to Plan</span>
      </div>
      <div className={`absolute top-8 right-8 inline-flex items-center ${textColor}`}>
        <span>All Tools</span>
        <div className="w-5 h-5 ml-2" />
      </div>
    </>
  )
}

export default function ToolNavigationWrapper(props: ToolNavigationWrapperProps) {
  return (
    <Suspense fallback={<NavigationFallback variant={props.variant} />}>
      <ToolNavigation {...props} />
    </Suspense>
  )
}