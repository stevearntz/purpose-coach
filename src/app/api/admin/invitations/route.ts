import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import invitationStorage, { type Invitation } from '@/lib/invitationStorage';

export async function GET(request: NextRequest) {
  try {
    // Get all invitations from storage
    const allInvitations = await invitationStorage.getAllInvitations();
    
    // Sort by creation date (newest first)
    allInvitations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return NextResponse.json({ invitations: allInvitations });
  } catch (error) {
    console.error('Failed to fetch invitations:', error);
    return NextResponse.json({ error: 'Failed to fetch invitations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, name, company, companyLogo, personalMessage, sendImmediately } = await request.json();
    
    // Generate unique invitation code
    const inviteCode = nanoid(10);
    const inviteId = nanoid();
    
    // Create invitation URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    const inviteUrl = `${baseUrl}/start?invite=${inviteCode}`;
    
    // Create invitation object
    const invitation: Invitation = {
      id: inviteId,
      email,
      name,
      company,
      companyLogo,
      inviteCode,
      inviteUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
      personalMessage,
      metadata: {}
    };
    
    // Store invitation in persistent storage
    await invitationStorage.saveInvitation(invitation);
    
    // Send email if requested
    if (sendImmediately) {
      // Send invitation email
      await sendInvitationEmail(invitation);
      
      // Update status
      invitation.status = 'sent';
      invitation.sentAt = new Date().toISOString();
      await invitationStorage.saveInvitation(invitation);
    }
    
    return NextResponse.json({ success: true, invitation });
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