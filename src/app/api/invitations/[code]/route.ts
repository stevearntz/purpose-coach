import { NextRequest, NextResponse } from 'next/server';
import invitationStorage from '@/lib/invitationStorage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    console.log('[GET /api/invitations] Looking for invitation with code:', code);
    
    // Find invitation by code
    const invitation = await invitationStorage.getInvitationByCode(code);
    
    console.log('[GET /api/invitations] Found invitation:', invitation ? 'Yes' : 'No');
    
    if (!invitation) {
      console.error('[GET /api/invitations] Invitation not found for code:', code);
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }
    
    // Return public-safe invitation data
    const responseData = {
      name: invitation.name || '',
      email: invitation.email || '',
      company: invitation.company || '',
      companyLogo: invitation.companyLogo || '',
      personalMessage: invitation.personalMessage || ''
    };
    
    console.log('[GET /api/invitations] Returning data:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Failed to fetch invitation:', error);
    return NextResponse.json({ error: 'Failed to fetch invitation' }, { status: 500 });
  }
}