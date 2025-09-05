import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    name?: string;
    companyId?: string;
    companyName?: string;
    orgId?: string;
  };
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const { userId, orgId } = await auth();
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Get user details from Clerk
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      
      // Get user's active organization membership
      const orgMemberships = await client.users.getOrganizationMembershipList({ userId });
      const activeOrgMembership = orgMemberships.data.find(m => m.organization);
      
      let companyId: string | undefined;
      let companyName: string | undefined;
      
      if (activeOrgMembership?.organization) {
        const org = activeOrgMembership.organization;
        companyName = org.name;
        
        // Ensure we have a corresponding company in our database
        let company = await prisma.company.findFirst({
          where: { name: org.name }
        });
        
        if (!company) {
          // Create company if it doesn't exist
          company = await prisma.company.create({
            data: {
              name: org.name,
              logo: org.imageUrl || null
            }
          });
        }
        
        companyId = company.id;
      } else {
        // Fallback to email domain if no organization
        const emailDomain = user.primaryEmailAddress?.emailAddress?.split('@')[1];
        if (emailDomain) {
          let company = await prisma.company.findFirst({
            where: { name: emailDomain }
          });
          
          if (!company) {
            company = await prisma.company.create({
              data: {
                name: emailDomain,
                logo: null
              }
            });
          }
          
          companyId = company.id;
          companyName = emailDomain;
        }
      }
      
      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: user.id,
        email: user.primaryEmailAddress?.emailAddress || '',
        name: user.fullName || user.firstName || '',
        companyId,
        companyName,
        orgId
      };
      
      return handler(authenticatedReq);
    } catch (error) {
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      );
    }
  };
}