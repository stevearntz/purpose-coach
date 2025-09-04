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
    
    console.log('[Manual Org Assign] Processing user:', email);
    
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
    
    if (!matchingCompany || !matchingCompany.clerkOrgId) {
      return NextResponse.json({ 
        message: `No organization found for domain ${emailDomain}`,
        needsManualCreation: true 
      });
    }
    
    // Check current memberships
    const memberships = await client.users.getOrganizationMembershipList({ userId });
    const isMember = memberships.data.some((m: any) => m.organization.id === matchingCompany.clerkOrgId);
    
    if (isMember) {
      // Already a member, just activate the org
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          organizationId: matchingCompany.clerkOrgId,
          companyName: matchingCompany.name,
          onboardingComplete: true
        }
      });
      
      return NextResponse.json({ 
        success: true,
        message: `Already member of ${matchingCompany.name}`,
        organizationId: matchingCompany.clerkOrgId,
        redirect: '/dashboard'
      });
    }
    
    // Add user to organization
    console.log('[Manual Org Assign] Adding user to:', matchingCompany.name);
    
    await client.organizations.createOrganizationMembership({
      organizationId: matchingCompany.clerkOrgId,
      userId: userId,
      role: 'org:member'
    });
    
    // Update user metadata
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        organizationId: matchingCompany.clerkOrgId,
        companyName: matchingCompany.name,
        onboardingComplete: true
      }
    });
    
    console.log('[Manual Org Assign] Successfully assigned to:', matchingCompany.name);
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully assigned to ${matchingCompany.name}`,
      organizationId: matchingCompany.clerkOrgId,
      redirect: '/dashboard'
    });
    
  } catch (error: any) {
    console.error('[Manual Org Assign] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to assign organization',
      details: error.message 
    }, { status: 500 });
  }
}