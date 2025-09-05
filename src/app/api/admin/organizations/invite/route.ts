import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

// POST - Invite an admin to a specific organization
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Get the base URL from the request headers (works in both local and production)
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;
    
    // Check if user is system admin
    const adminEmails = ['steve@getcampfire.com'];
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);
    const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { email, name, organizationId, clerkOrgId, resend } = await request.json();
    
    if (!email || !organizationId || !clerkOrgId) {
      console.error('Missing required fields:', { email, organizationId, clerkOrgId });
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
    
    // If this is a resend and the user already exists, just send the email
    if (resend && clerkUser) {
      // Check if they're already in the organization
      try {
        const memberships = await client.users.getOrganizationMembershipList({ 
          userId: clerkUser.id 
        });
        const isMember = memberships.data.some(m => m.organization.id === clerkOrgId);
        
        if (isMember) {
          return NextResponse.json({ 
            success: true,
            message: 'User is already a member of this organization',
            alreadyMember: true
          });
        }
      } catch (error) {
        console.log('Could not check membership:', error);
      }
    }
    
    // Create an invitation in Clerk organization (skip if resending for existing user)
    let invitation;
    if (!resend || !clerkUser) {
      try {
        invitation = await client.invitations.createInvitation({
          emailAddress: email,
          redirectUrl: `${baseUrl}/dashboard`,
          publicMetadata: {
            organizationId: clerkOrgId,
            role: 'admin',
            invitedBy: userEmail
          }
        });
      } catch (error) {
        console.error('Failed to create Clerk invitation:', error);
        // Continue without Clerk invitation - we can still track in our database
      }
    }
    
    // Store invitation in database for tracking (or update if resending)
    let dbInvitation;
    if (resend) {
      // Try to find existing invitation
      const existingInvite = await prisma.invitation.findFirst({
        where: {
          email,
          companyId: organizationId,
          status: 'PENDING'
        }
      });
      
      if (existingInvite) {
        // Update the sent date AND regenerate the URL with the correct domain
        dbInvitation = await prisma.invitation.update({
          where: { id: existingInvite.id },
          data: { 
            sentAt: new Date(),
            inviteUrl: `${baseUrl}/sign-up${invitation ? `?invitation=${invitation.id}` : ''}`
          }
        });
      } else {
        // Create new invitation record
        dbInvitation = await prisma.invitation.create({
          data: {
            email,
            name: name || null,
            inviteCode: invitation?.id || 'resend',
            inviteUrl: `${baseUrl}/sign-up${invitation ? `?invitation=${invitation.id}` : ''}`,
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
      }
    } else {
      dbInvitation = await prisma.invitation.create({
        data: {
          email,
          name: name || null,
          inviteCode: invitation?.id || 'pending',
          inviteUrl: `${baseUrl}/sign-up${invitation ? `?invitation=${invitation.id}` : ''}`,
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
    }
    
    // Get the organization name for the email
    const organization = await prisma.company.findUnique({
      where: { id: organizationId },
      select: { name: true }
    });
    
    // If user exists, add them to the organization
    if (clerkUser) {
      try {
        await client.organizations.createOrganizationMembership({
          organizationId: clerkOrgId,
          userId: clerkUser.id,
          role: 'org:admin'
        });
        
        // Update invitation status if we have a db record
        if (dbInvitation) {
          await prisma.invitation.update({
            where: { id: dbInvitation.id },
            data: { status: 'COMPLETED' }
          });
        }
        
        // Send notification email that they've been added
        try {
          await sendEmail({
            to: email,
            subject: `You've been added as an admin to ${organization?.name || 'an organization'} on Campfire`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome to ${organization?.name || 'Campfire'}!</h2>
                <p>Hi ${name || 'there'},</p>
                <p>You've been added as an administrator to ${organization?.name || 'an organization'} on Campfire.</p>
                <p>You can access your dashboard here:</p>
                <a href="${baseUrl}/dashboard" 
                   style="display: inline-block; background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                  Go to Dashboard
                </a>
                <p>As an admin, you can:</p>
                <ul>
                  <li>Invite team members</li>
                  <li>Launch assessment campaigns</li>
                  <li>View team results and insights</li>
                  <li>Access all Campfire tools</li>
                </ul>
                <p>If you have any questions, feel free to reach out.</p>
                <p>Best regards,<br>The Campfire Team</p>
              </div>
            `,
            text: `Welcome to ${organization?.name || 'Campfire'}! You've been added as an administrator. Access your dashboard at ${baseUrl}/dashboard`
          });
          console.log(`Sent admin notification email to ${email}`);
        } catch (emailError) {
          console.error('Failed to send notification email:', emailError);
          // Don't fail the whole operation if email fails
        }
        
        return NextResponse.json({ 
          success: true,
          message: 'User added to organization as admin',
          invitation: dbInvitation,
          userAdded: true,
          emailSent: true
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
    
    // Send invitation email (for new user or resend) - only if we have an invitation URL
    if (dbInvitation?.inviteUrl) {
      try {
        const emailSubject = resend 
          ? `Reminder: You're invited to join ${organization?.name || 'an organization'} on Campfire as an admin`
          : `You're invited to join ${organization?.name || 'an organization'} on Campfire as an admin`;
          
        await sendEmail({
          to: email,
          subject: emailSubject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>You're Invited to ${organization?.name || 'Campfire'}!</h2>
              <p>Hi ${name || 'there'},</p>
              <p>${userEmail} has invited you to join ${organization?.name || 'an organization'} as an administrator on Campfire.</p>
              <p>Campfire is a platform for team assessments and insights that help organizations build better cultures and improve performance.</p>
              <a href="${dbInvitation.inviteUrl}" 
                 style="display: inline-block; background-color: #9333ea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Accept Invitation
              </a>
              <p>As an admin, you'll be able to:</p>
              <ul>
                <li>Invite and manage team members</li>
                <li>Launch assessment campaigns</li>
                <li>View comprehensive team insights</li>
                <li>Access all Campfire tools and features</li>
              </ul>
              <p>This invitation link is unique to you. Please don't share it with others.</p>
              <p>If you have any questions, feel free to reach out.</p>
              <p>Best regards,<br>The Campfire Team</p>
            </div>
          `,
          text: `You're invited to join ${organization?.name || 'an organization'} on Campfire as an admin. Accept your invitation here: ${dbInvitation.inviteUrl}`
        });
        console.log(`Sent invitation email to ${email}`);
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't fail the whole operation if email fails, but log it
      }
    } else {
      console.log('No invitation URL available, skipping email');
    }
    
    // Return invitation details for new user
    return NextResponse.json({ 
      success: true,
      message: dbInvitation ? 'Invitation created and email sent. User will be added as admin when they sign up.' : 'Invitation processed but email could not be sent.',
      invitation: dbInvitation || null,
      inviteUrl: dbInvitation?.inviteUrl || null,
      userAdded: false,
      emailSent: !!dbInvitation?.inviteUrl
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Failed to create invitation' 
    }, { status: 500 });
  }
}