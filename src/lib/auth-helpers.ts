/**
 * Authentication helpers for API routes
 * Uses Clerk Organizations for multi-tenancy
 */

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  orgId?: string;
  orgName?: string;
  orgRole?: string;
}

/**
 * Get the current authenticated user with organization context
 */
export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  try {
    const { userId, orgId, orgRole } = await auth();
    
    if (!userId) {
      console.log('[auth-helpers] No userId found');
      return null;
    }
    
    const user = await currentUser();
    
    if (!user?.primaryEmailAddress?.emailAddress) {
      console.log('[auth-helpers] No user email found');
      return null;
    }
    
    // Get organization details if user is in one
    let orgName: string | undefined;
    if (orgId) {
      try {
        const client = await clerkClient();
        const org = await client.organizations.getOrganization({ organizationId: orgId });
        orgName = org.name;
      } catch (error) {
        console.error('[auth-helpers] Error fetching organization:', error);
      }
    }
    
    return {
      id: user.id,
      email: user.primaryEmailAddress.emailAddress,
      name: user.fullName || user.firstName || undefined,
      orgId,
      orgName,
      orgRole: orgRole || undefined
    };
  } catch (error) {
    console.error('[auth-helpers] Error getting session:', error);
    return null;
  }
}

/**
 * Middleware wrapper for protected API routes requiring organization
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
      
      // For dashboard/company routes, require organization
      if (req.url.includes('/api/company') || req.url.includes('/api/campaigns')) {
        if (!user.orgId) {
          return NextResponse.json(
            { error: 'Organization membership required' },
            { status: 403 }
          );
        }
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
 * Get company information for the authenticated user's organization
 * Maps Clerk Organization to Company in database
 */
export async function getUserCompany(): Promise<{ id: string; name: string } | null> {
  try {
    const user = await getCurrentAuthUser();
    
    if (!user?.orgId || !user?.orgName) {
      console.log('[auth-helpers] No organization found for user');
      return null;
    }
    
    // Check if company exists in database for this org
    let company = await prisma.company.findFirst({
      where: { 
        name: user.orgName 
      }
    });
    
    // If company doesn't exist, create it
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: user.orgName
        }
      });
      console.log('[auth-helpers] Created new company for organization:', user.orgName);
    }
    
    return {
      id: company.id,
      name: company.name
    };
  } catch (error) {
    console.error('[auth-helpers] Error getting company info:', error);
    return null;
  }
}