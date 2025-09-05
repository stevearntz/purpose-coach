import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET - Fetch all admins for an organization
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: organizationId } = await context.params;
    
    // Check if user is system admin
    const adminEmails = ['steve@getcampfire.com'];
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);
    const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get the organization
    const organization = await prisma.company.findUnique({
      where: { id: organizationId }
    });
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    const admins = [];
    
    // If organization has Clerk integration, fetch members from Clerk
    if (organization.clerkOrgId) {
      try {
        const memberships = await client.organizations.getOrganizationMembershipList({
          organizationId: organization.clerkOrgId,
          limit: 100
        });
        
        for (const membership of memberships.data) {
          // Check if user has admin role
          if (membership.role === 'org:admin' || membership.role === 'admin') {
            const memberUser = await client.users.getUser(membership.userId);
            const email = memberUser.emailAddresses.find(
              e => e.id === memberUser.primaryEmailAddressId
            )?.emailAddress;
            
            if (email) {
              admins.push({
                email,
                name: memberUser.fullName || memberUser.firstName || '',
                inviteStatus: 'accepted',
                joinedAt: membership.createdAt
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch Clerk members:', error);
      }
    }
    
    // Also check for pending invitations in our database
    const pendingInvites = await prisma.invitation.findMany({
      where: {
        companyId: organizationId,
        status: 'PENDING'
      },
      include: {
        metadata: true
      }
    });
    
    // Add pending invitations to the admins list
    for (const invite of pendingInvites) {
      // Check if metadata indicates admin role
      const isAdmin = invite.metadata?.role === 'admin';
      if (isAdmin) {
        admins.push({
          email: invite.email,
          name: invite.name || '',
          inviteStatus: 'pending',
          invitedAt: invite.sentAt
        });
      }
    }
    
    return NextResponse.json({ 
      success: true,
      admins,
      organization: {
        id: organization.id,
        name: organization.name,
        hasClerkIntegration: !!organization.clerkOrgId
      }
    });
    
  } catch (error: any) {
    console.error('Failed to fetch organization admins:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fetch admins' 
    }, { status: 500 });
  }
}