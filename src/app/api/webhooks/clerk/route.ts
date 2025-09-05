import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  console.log('[Webhook] Received webhook request');
  
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no Svix headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log('[Webhook] Event type:', eventType);
  
  // Handle organization events to keep database in sync
  if (eventType === 'organization.created') {
    const orgData = evt.data;
    console.log('🔴 [WEBHOOK] Organization created event received:', {
      name: orgData.name,
      id: orgData.id,
      slug: orgData.slug,
      createdAt: new Date().toISOString()
    });
    
    // Create or update the company in our database
    await prisma.company.upsert({
      where: { clerkOrgId: orgData.id },
      update: { 
        name: orgData.name,
        updatedAt: new Date()
      },
      create: {
        name: orgData.name,
        clerkOrgId: orgData.id,
        domains: [] // Will be updated when admin sets them
      }
    });
    
    console.log('🔴 [WEBHOOK] Organization saved to database:', {
      name: orgData.name,
      clerkOrgId: orgData.id,
      timestamp: new Date().toISOString()
    });
  }
  
  if (eventType === 'organization.updated') {
    const orgData = evt.data;
    
    // Update the company in our database
    await prisma.company.update({
      where: { clerkOrgId: orgData.id },
      data: { 
        name: orgData.name,
        updatedAt: new Date()
      }
    });
    
    console.log('Organization updated in database:', {
      name: orgData.name,
      clerkOrgId: orgData.id
    });
  }
  
  if (eventType === 'organization.deleted') {
    const orgData = evt.data;
    
    // Optionally delete or mark as inactive in database
    // For now, we'll keep it for historical data but you might want to handle differently
    console.log('Organization deleted in Clerk (keeping in database):', {
      clerkOrgId: orgData.id
    });
  }
  
  if (eventType === 'user.created' || eventType === 'user.updated' || eventType === 'session.created') {
    const client = await clerkClient();
    
    // Get user data
    let userId: string;
    let userEmail: string | undefined;
    
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const userData = evt.data;
      userId = userData.id;
      userEmail = userData.email_addresses.find(e => e.id === userData.primary_email_address_id)?.email_address;
    } else {
      // session.created event
      const sessionData = evt.data as any;
      userId = sessionData.user_id;
      const user = await client.users.getUser(userId);
      userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    }
    
    if (!userEmail) {
      return NextResponse.json({ received: true });
    }
    
    // Extract domain from email
    const emailDomain = '@' + userEmail.split('@')[1];
    
    // Check if any organization has this domain
    const matchingCompany = await prisma.company.findFirst({
      where: {
        domains: {
          has: emailDomain
        }
      }
    });
    
    console.log('Webhook processing:', {
      userEmail,
      emailDomain,
      matchingCompany: matchingCompany ? matchingCompany.name : 'NOT FOUND',
      clerkOrgId: matchingCompany?.clerkOrgId
    });
    
    if (matchingCompany && matchingCompany.clerkOrgId) {
      try {
        // Check if user is already a member
        const memberships = await client.organizations.getOrganizationMembershipList({
          organizationId: matchingCompany.clerkOrgId,
          limit: 100
        });
        
        const isMember = memberships.data.some((m: any) => m.userId === userId);
        console.log('Webhook: Checking membership for', userEmail, {
          organizationId: matchingCompany.clerkOrgId,
          organizationName: matchingCompany.name,
          isMember,
          userId
        });
        
        if (!isMember) {
          // Add user to the organization as a member (not admin)
          console.log('Webhook: Adding user to organization...');
          await client.organizations.createOrganizationMembership({
            organizationId: matchingCompany.clerkOrgId,
            userId: userId,
            role: 'org:member'
          });
          console.log('Webhook: Successfully added user to', matchingCompany.name);
        } else {
          console.log('Webhook: User already member of', matchingCompany.name);
        }
        
        // Update user's metadata to include the organization
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            organizationId: matchingCompany.clerkOrgId,
            companyName: matchingCompany.name,
            onboardingComplete: true
          }
        });
        
        // IMPORTANT: Set this as their active organization
        // This requires the user to sign in again to pick up the change
        // Or we need to handle it in the onboarding flow
        
      } catch (error: any) {
        // Log the error for debugging
        console.error('Webhook error:', {
          error: error.message,
          userId,
          userEmail,
          matchingCompany: matchingCompany.name,
          clerkOrgId: matchingCompany.clerkOrgId
        });
        // Don't throw - return success so webhook doesn't retry
      }
    }
  }

  return NextResponse.json({ received: true });
}