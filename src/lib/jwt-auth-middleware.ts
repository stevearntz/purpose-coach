/**
 * JWT-based authentication middleware
 * Compatible with our campfire-auth cookie system
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export interface JWTAuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name?: string;
    companyId: string;
    companyName?: string;
    isAdmin?: boolean;
  };
}

/**
 * JWT Authentication middleware for API routes
 * Verifies JWT token from campfire-auth cookie
 */
export function withJWTAuth(
  handler: (req: JWTAuthenticatedRequest) => Promise<NextResponse>,
  options: {
    requireAdmin?: boolean;
    requireCampfireCompany?: boolean;
  } = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // 1. Get JWT token from cookie
      const token = getAuthToken(req);
      
      if (!token) {
        console.log('[jwt-auth-middleware] No auth token found');
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      // 2. Verify JWT token
      const payload = verifyToken(token);
      if (!payload) {
        console.log('[jwt-auth-middleware] Invalid token');
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      // 3. Get admin details from database
      const admin = await prisma.admin.findUnique({
        where: { 
          id: payload.userId,
          isActive: true 
        },
        include: {
          company: true
        }
      });

      if (!admin) {
        console.log('[jwt-auth-middleware] Admin not found or inactive');
        return NextResponse.json(
          { error: 'Admin account not found or inactive' },
          { status: 401 }
        );
      }

      // 4. Check if Campfire company is required
      if (options.requireCampfireCompany) {
        if (admin.company.name.toLowerCase() !== 'campfire') {
          console.log('[jwt-auth-middleware] Not a Campfire admin');
          return NextResponse.json(
            { error: 'This action requires Campfire admin privileges' },
            { status: 403 }
          );
        }
      }

      // 5. Check if admin privileges are required
      if (options.requireAdmin) {
        // For now, all authenticated users in Admin table are admins
        // In future, you might add role-based checks here
      }

      // 6. Attach user to request
      const authenticatedReq = req as JWTAuthenticatedRequest;
      authenticatedReq.user = {
        id: admin.id,
        email: admin.email,
        name: admin.name || undefined,
        companyId: admin.companyId,
        companyName: admin.company.name,
        isAdmin: true
      };

      // 7. Call the handler
      return handler(authenticatedReq);
      
    } catch (error) {
      console.error('[jwt-auth-middleware] Error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}