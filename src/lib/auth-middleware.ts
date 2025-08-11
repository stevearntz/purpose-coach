/**
 * Production-grade authentication middleware
 * Uses NextAuth.js for secure session management
 */

import { auth } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

// Initialize rate limiter (use Redis in production)
const ratelimit = new Ratelimit({
  redis: kv,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'ratelimit',
});

// Session validation schema
const SessionSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
    name: z.string().optional(),
    companyId: z.string().optional(),
    companyName: z.string().optional(),
  }),
  expires: z.string(),
});

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
 * Ensures user is authenticated and rate limited
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
      // 1. Check authentication
      const session = await auth();
      
      if (!session?.user?.email) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // Validate session structure
      const validatedSession = SessionSchema.safeParse(session);
      if (!validatedSession.success) {
        console.error('[auth-middleware] Invalid session structure:', validatedSession.error);
        return NextResponse.json(
          { error: 'Invalid session' },
          { status: 401 }
        );
      }

      // 2. Rate limiting
      if (options.rateLimit !== false) {
        const identifier = session.user.email;
        const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
        
        if (!success) {
          return NextResponse.json(
            { 
              error: 'Too many requests',
              retryAfter: Math.round((reset - Date.now()) / 1000)
            },
            { 
              status: 429,
              headers: {
                'X-RateLimit-Limit': limit.toString(),
                'X-RateLimit-Remaining': remaining.toString(),
                'X-RateLimit-Reset': new Date(reset).toISOString(),
              }
            }
          );
        }
      }

      // 3. Check admin permission if required
      if (options.requireAdmin) {
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        try {
          const admin = await prisma.admin.findUnique({
            where: { email: session.user.email }
          });
          
          if (!admin) {
            return NextResponse.json(
              { error: 'Admin access required' },
              { status: 403 }
            );
          }
        } finally {
          await prisma.$disconnect();
        }
      }

      // 4. Add user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: session.user.id || '',
        email: session.user.email,
        name: session.user.name,
        companyId: session.user.companyId,
        companyName: session.user.companyName,
      };

      // 5. Call the handler
      return await handler(authenticatedReq);
      
    } catch (error) {
      console.error('[auth-middleware] Error:', error);
      
      // Don't expose internal errors
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

/**
 * CORS middleware for API routes
 */
export function withCORS(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_BASE_URL || '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const response = await handler(req);
    
    // Add CORS headers to response
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_BASE_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  };
}

/**
 * Combine multiple middleware
 */
export function withMiddleware(
  ...middlewares: Array<(handler: any) => any>
) {
  return (handler: any) => {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}