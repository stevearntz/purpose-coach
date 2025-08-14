/**
 * Wrapper for auth() function that handles initialization issues in production
 * NextAuth v5 beta has issues with middleware initialization
 */

import { auth as nextAuth } from '@/auth'
import type { Session } from 'next-auth'

export async function getAuthSession(): Promise<Session | null> {
  try {
    // Try to get the session normally
    const session = await nextAuth()
    return session
  } catch (error) {
    // If auth fails, log the error but don't crash
    console.error('[auth-wrapper] Failed to get session:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      env: process.env.NODE_ENV,
      hasAuthSecret: !!process.env.AUTH_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET
    })
    
    // Return null session - treat as unauthenticated
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getAuthSession()
  return !!session?.user
}