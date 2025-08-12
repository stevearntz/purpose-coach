/**
 * Authentication helpers for API routes
 * Properly handles NextAuth sessions in API routes
 */

import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  companyId?: string;
  companyName?: string;
}

/**
 * Get the current session in an API route
 * This works with both JWT and database sessions
 */
export async function getServerSession(): Promise<AuthUser | null> {
  try {
    // Import headers to ensure cookies are forwarded properly
    const { headers: getHeaders } = await import('next/headers');
    
    // Get headers to ensure cookies are included
    const headersList = await getHeaders();
    
    // Use the auth() function which handles cookie parsing
    const session = await auth();
    
    console.log('[auth-helpers] Session check:', {
      hasSession: !!session,
      userEmail: session?.user?.email,
      cookies: headersList.get('cookie')?.substring(0, 50) + '...'
    });
    
    if (!session?.user?.email) {
      console.log('[auth-helpers] No session found');
      return null;
    }
    
    return {
      id: session.user.id || '',
      email: session.user.email,
      name: session.user.name || undefined,
      companyId: session.user.companyId,
      companyName: session.user.companyName,
    };
  } catch (error) {
    console.error('[auth-helpers] Error getting session:', error);
    return null;
  }
}

/**
 * Middleware wrapper for protected API routes
 * Use this instead of withAuth for better reliability
 */
export function withAuthentication(
  handler: (req: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const user = await getServerSession();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Call the handler with the authenticated user
      return handler(req, user);
    } catch (error) {
      console.error('[withAuthentication] Error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}

/**
 * Check if a user is authenticated without throwing errors
 * Useful for optional auth routes
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getServerSession();
  return !!user;
}

/**
 * Get user email from session (with fallback to localStorage approach)
 * This is useful for gradual migration
 */
export async function getUserEmail(req: NextRequest): Promise<string | null> {
  // First try to get from session
  const user = await getServerSession();
  if (user?.email) {
    return user.email;
  }
  
  // Fallback: check URL params (for backwards compatibility)
  const url = new URL(req.url);
  const emailParam = url.searchParams.get('email');
  if (emailParam) {
    return emailParam;
  }
  
  return null;
}