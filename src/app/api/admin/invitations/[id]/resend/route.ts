import { NextRequest, NextResponse } from 'next/server';
import invitationStorage from '@/lib/invitationStorage';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Find invitation by ID
    const invitation = await invitationStorage.getInvitationById(id);
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Resend the invitation email
    console.log('Resending invitation to:', invitation.email);
    console.log('Invitation link:', invitation.inviteUrl);
    
    // Update invitation status
    invitation.status = 'sent';
    invitation.sentAt = new Date().toISOString();
    invitation.resentAt = new Date().toISOString();
    await invitationStorage.saveInvitation(invitation);
    
    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error('Failed to resend invitation:', error);
    return NextResponse.json({ error: 'Failed to resend invitation' }, { status: 500 });
  }
}