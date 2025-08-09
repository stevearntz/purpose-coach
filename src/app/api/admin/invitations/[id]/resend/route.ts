import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendInvitationEmail, isEmailServiceConfigured } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find invitation by ID with company info
    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: { company: true }
    });
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Send the invitation email
    let emailSent = false;
    if (isEmailServiceConfigured()) {
      const emailResult = await sendInvitationEmail({
        to: invitation.email,
        recipientName: invitation.name || undefined,
        companyName: invitation.company.name,
        companyLogo: invitation.company.logo || undefined,
        inviteUrl: invitation.inviteUrl,
        personalMessage: invitation.personalMessage || undefined
      });
      
      emailSent = emailResult.success;
      if (!emailSent) {
        console.error('Failed to resend invitation email:', emailResult.error);
      } else {
        console.log('Invitation email resent successfully to:', invitation.email);
      }
    } else {
      console.warn('Email service not configured - cannot resend email');
      console.log('To enable email sending, set RESEND_API_KEY in environment variables');
    }
    
    // Update invitation status and timestamps
    const updatedInvitation = await prisma.invitation.update({
      where: { id },
      data: {
        status: emailSent ? 'SENT' : invitation.status,
        sentAt: emailSent ? new Date() : invitation.sentAt,
        resentAt: new Date()
      },
      include: { company: true }
    });
    
    // Transform for response
    const response = {
      id: updatedInvitation.id,
      email: updatedInvitation.email,
      name: updatedInvitation.name,
      company: updatedInvitation.company.name,
      inviteUrl: updatedInvitation.inviteUrl,
      status: updatedInvitation.status.toLowerCase(),
      sentAt: updatedInvitation.sentAt?.toISOString(),
      resentAt: updatedInvitation.resentAt?.toISOString(),
      emailSent
    };
    
    return NextResponse.json({ success: true, invitation: response, emailSent });
  } catch (error) {
    console.error('Failed to resend invitation:', error);
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
  }
}