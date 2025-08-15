/**
 * Authentication helpers for API routes
 * Uses Clerk for authentication
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  companyId?: string;
  companyName?: string;
  role?: string;
}

/**
 * Get the current authenticated user in an API route
 * This works with Clerk authentication
 */
export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      console.log('[auth-helpers] No userId found');
      return null;
    }
    
    const user = await currentUser();
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      console.log('[auth-helpers] No user email found');
      return null;
    }
    
    const publicMetadata = user.publicMetadata as any;
    
    return {
      id: user.id,
      email: user.primaryEmailAddress.emailAddress,
      name: user.fullName || user.firstName || undefined,
      companyId: publicMetadata?.companyId,
      companyName: publicMetadata?.companyName,
      role: publicMetadata?.role
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
      const user = await getCurrentAuthUser();
      
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
  const user = await getCurrentAuthUser();
  return !!user;
}

/**
 * Get user email from session (with fallback to localStorage approach)
 * This is useful for gradual migration
 */
export async function getUserEmail(req: NextRequest): Promise<string | null> {
  // First try to get from session
  const user = await getCurrentAuthUser();
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

/**
 * Get company information for the authenticated user
 * Uses Clerk metadata instead of Admin table lookup
 */
export async function getUserCompany(): Promise<{ id: string; name: string } | null> {
  try {
    const user = await getCurrentAuthUser();
    
    if (!user?.companyId) {
      console.log('[auth-helpers] No companyId in user metadata');
      return null;
    }
    
    return {
      id: user.companyId,
      name: user.companyName || 'Unknown Company'
    };
  } catch (error) {
    console.error('[auth-helpers] Error getting company info:', error);
    return null;
  }
}