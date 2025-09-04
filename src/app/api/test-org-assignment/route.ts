import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    
    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }
    
    // Extract domain from email
    const emailDomain = '@' + email.split('@')[1];
    
    // Check if any organization has this domain
    const matchingCompany = await prisma.company.findFirst({
      where: {
        domains: {
          has: emailDomain
        }
      }
    });
    
    const result: any = {
      userId,
      email,
      emailDomain,
      matchingCompany: matchingCompany ? {
        name: matchingCompany.name,
        clerkOrgId: matchingCompany.clerkOrgId,
        domains: matchingCompany.domains
      } : null,
      shouldAutoAssign: !!matchingCompany
    };
    
    // Check current organization memberships
    const memberships = await client.users.getOrganizationMembershipList({ userId });
    result.currentOrganizations = memberships.data.map((m: any) => ({
      id: m.organization.id,
      name: m.organization.name,
      role: m.role
    }));
    
    // If should auto-assign and not already member, do it now
    if (matchingCompany?.clerkOrgId && !memberships.data.some((m: any) => m.organization.id === matchingCompany.clerkOrgId)) {
      try {
        await client.organizations.createOrganizationMembership({
          organizationId: matchingCompany.clerkOrgId,
          userId: userId,
          role: 'org:member'
        });
        result['assigned'] = true;
        result['message'] = `Successfully added to ${matchingCompany.name} organization`;
        
        // Update user's metadata
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            organizationId: matchingCompany.clerkOrgId,
            companyName: matchingCompany.name,
            onboardingComplete: true
          }
        });
        
      } catch (error: any) {
        result['assigned'] = false;
        result['error'] = error.message;
      }
    } else if (matchingCompany) {
      result['message'] = `Already a member of ${matchingCompany.name}`;
    } else {
      result['message'] = `No organization found for domain ${emailDomain}`;
    }
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to check organization assignment',
      details: error.message 
    }, { status: 500 });
  }
}