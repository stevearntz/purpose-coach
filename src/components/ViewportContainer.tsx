import React from 'react'

interface ViewportContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * ViewportContainer - A component that properly handles viewport height on iOS Safari
 * 
 * iOS Safari has issues with dynamic viewport units that change as the user scrolls.
 * This component uses a combination of techniques to ensure content fills the viewport
 * without extra space above/below.
 */
export default function ViewportContainer({ children, className = '' }: ViewportContainerProps) {
  return (
    <div 
      className={`
        min-h-screen
        ${className}
      `}
      style={{
        minHeight: '100vh',
        minHeight: '100dvh', // Dynamic viewport height - supported in newer browsers
        height: '100%'
      }}
    >
      {children}
    </div>
  )
}