'use client'

import { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

// This component is kept for backwards compatibility
// Clerk is now handled in the root layout
export default function Providers({ children }: ProvidersProps) {
  return <>{children}</>
}