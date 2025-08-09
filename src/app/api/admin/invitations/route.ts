import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching invitations from database...');
    console.log('Database URL configured:', process.env.DATABASE_URL ? 'Yes' : 'No');
    
    // Ensure Prisma is connected
    await prisma.$connect();
    
    // Get all invitations from database
    const invitations = await prisma.invitation.findMany({
      include: {
        company: true,
        metadata: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${invitations.length} invitations`);
    
    // Transform for compatibility with existing code
    const transformedInvitations = invitations.map(inv => ({
      id: inv.id,
      email: inv.email,
      name: inv.name,
      company: inv.company.name,
      companyLogo: inv.company.logo,
      inviteCode: inv.inviteCode,
      inviteUrl: inv.inviteUrl,
      status: inv.status.toLowerCase(),
      createdAt: inv.createdAt.toISOString(),
      sentAt: inv.sentAt?.toISOString(),
      openedAt: inv.openedAt?.toISOString(),
      startedAt: inv.startedAt?.toISOString(),
      completedAt: inv.completedAt?.toISOString(),
      currentStage: inv.currentStage,
      personalMessage: inv.personalMessage,
      resentAt: inv.resentAt?.toISOString(),
      metadata: inv.metadata ? {
        role: inv.metadata.role,
        challenges: inv.metadata.challenges || [],
        toolsAccessed: inv.metadata.toolsAccessed || [],
        accountCreated: inv.metadata.accountCreated,
        accountEmail: inv.metadata.accountEmail,
        isGenericLink: inv.metadata.isGenericLink
      } : undefined
    }));
    
    return NextResponse.json({ invitations: transformedInvitations });
  } catch (error: any) {
    console.error('Failed to fetch invitations:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    });
    return NextResponse.json({ 
      error: 'Failed to fetch invitations',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, companyId, personalMessage, sendImmediately } = await request.json();
    
    if (!email || !companyId) {
      return NextResponse.json({ 
        error: 'Email and company ID are required' 
      }, { status: 400 });
    }
    
    // Check for existing invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: { 
        email,
        companyId 
      },
      include: {
        company: true
      }
    });
    
    if (existingInvitation) {
      // Return existing invitation with duplicate flag
      return NextResponse.json({ 
        success: false,
        duplicate: true,
        invitation: {
          id: existingInvitation.id,
          email: existingInvitation.email,
          name: existingInvitation.name,
          company: existingInvitation.company.name,
          companyLogo: existingInvitation.company.logo,
          inviteCode: existingInvitation.inviteCode,
          inviteUrl: existingInvitation.inviteUrl,
          status: existingInvitation.status.toLowerCase(),
          createdAt: existingInvitation.createdAt.toISOString(),
          sentAt: existingInvitation.sentAt?.toISOString()
        },
        message: `An invitation already exists for ${email}`
      }, { status: 409 });
    }
    
    // Generate unique invitation code
    const inviteCode = nanoid(10);
    
    // Create invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   request.headers.get('origin') || 
                   'http://localhost:3000';
    const inviteUrl = `${baseUrl}/start?invite=${inviteCode}`;
    
    // Create invitation in database
    const invitation = await prisma.invitation.create({
      data: {
        email,
        name,
        inviteCode,
        inviteUrl,
        personalMessage,
        companyId,
        status: sendImmediately ? 'SENT' : 'PENDING',
        sentAt: sendImmediately ? new Date() : undefined
      },
      include: {
        company: true
      }
    });
    
    // Send email if requested
    if (sendImmediately) {
      await sendInvitationEmail({
        email,
        name,
        inviteUrl,
        company: invitation.company.name
      });
    }
    
    // Transform for compatibility
    const transformedInvitation = {
      id: invitation.id,
      email: invitation.email,
      name: invitation.name,
      company: invitation.company.name,
      companyLogo: invitation.company.logo,
      inviteCode: invitation.inviteCode,
      inviteUrl: invitation.inviteUrl,
      status: invitation.status.toLowerCase(),
      createdAt: invitation.createdAt.toISOString(),
      sentAt: invitation.sentAt?.toISOString(),
      personalMessage: invitation.personalMessage
    };
    
    return NextResponse.json({ success: true, invitation: transformedInvitation });
  } catch (error) {
    console.error('Failed to create invitation:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}

// Helper function to send invitation email
async function sendInvitationEmail(invitation: any) {
  // In production, integrate with an email service (SendGrid, AWS SES, etc.)
  // For now, we'll just log the email
  console.log('Sending invitation email to:', invitation.email);
  console.log('Invitation link:', invitation.inviteUrl);
  
  // Simulate email sending
  return new Promise((resolve) => setTimeout(resolve, 1000));
}