import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// POST - Invite an admin to a specific organization
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Check if user is system admin
    const adminEmails = ['steve@getcampfire.com'];
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);
    const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { email, name, organizationId, clerkOrgId } = await request.json();
    
    if (!email || !organizationId || !clerkOrgId) {
      return NextResponse.json({ 
        error: 'Email, organization ID, and Clerk org ID are required' 
      }, { status: 400 });
    }
    
    // Check if user already exists in Clerk
    let clerkUser;
    try {
      const users = await client.users.getUserList({
        emailAddress: [email]
      });
      clerkUser = users.data[0];
    } catch (error) {
      console.log('User not found in Clerk, will be created on first sign-in');
    }
    
    // Create an invitation in Clerk organization
    const invitation = await client.invitations.createInvitation({
      emailAddress: email,
      redirectUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/dashboard`,
      publicMetadata: {
        organizationId: clerkOrgId,
        role: 'admin',
        invitedBy: userEmail
      }
    });
    
    // Store invitation in database for tracking
    const dbInvitation = await prisma.invitation.create({
      data: {
        email,
        name: name || null,
        inviteCode: invitation.id,
        inviteUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/sign-up?invitation=${invitation.id}`,
        companyId: organizationId,
        status: 'PENDING',
        sentAt: new Date(),
        metadata: {
          create: {
            role: 'admin'
          }
        }
      }
    });
    
    // If user exists, add them to the organization
    if (clerkUser) {
      try {
        await client.organizations.createOrganizationMembership({
          organizationId: clerkOrgId,
          userId: clerkUser.id,
          role: 'org:admin'
        });
        
        // Update invitation status
        await prisma.invitation.update({
          where: { id: dbInvitation.id },
          data: { status: 'COMPLETED' }
        });
        
        return NextResponse.json({ 
          success: true,
          message: 'User added to organization as admin',
          invitation: dbInvitation,
          userAdded: true
        });
      } catch (error: any) {
        if (error.errors && error.errors[0]?.code === 'already_a_member_in_organization') {
          return NextResponse.json({ 
            error: 'User is already a member of this organization' 
          }, { status: 409 });
        }
        throw error;
      }
    }
    
    // Return invitation details for new user
    return NextResponse.json({ 
      success: true,
      message: 'Invitation created. User will be added as admin when they sign up.',
      invitation: dbInvitation,
      inviteUrl: dbInvitation.inviteUrl,
      userAdded: false
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to create invitation' 
    }, { status: 500 });
  }
}