/**
 * Simplified authentication middleware for NextAuth
 * Without rate limiting (no Vercel KV dependency)
 */

import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name?: string;
    companyId?: string;
    companyName?: string;
  };
}

/**
 * Authentication middleware for API routes
 * Ensures user is authenticated using NextAuth
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: {
    requireAdmin?: boolean;
    rateLimit?: boolean;
    maxRequests?: number;
    windowMs?: string;
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Check authentication using NextAuth
      const session = await auth();
      
      console.log('[auth-middleware-simple] Session check:', {
        hasSession: !!session,
        userEmail: session?.user?.email,
        path: req.nextUrl.pathname
      });
      
      if (!session?.user?.email) {
        console.log('[auth-middleware-simple] No session found');
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Check admin permission if required
      if (options.requireAdmin) {
        // For now, any authenticated user can access admin endpoints
        // This can be restricted later based on specific requirements
        console.log('[auth-middleware-simple] Admin access granted to:', session.user.email);
      }

      // Attach user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: session.user.id || '',
        email: session.user.email,
        name: session.user.name || undefined,
        companyId: session.user.companyId || undefined,
        companyName: session.user.companyName || undefined,
      };

      // Call the handler
      return handler(authenticatedReq);
      
    } catch (error) {
      console.error('[auth-middleware-simple] Error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}