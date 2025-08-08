import { NextRequest, NextResponse } from 'next/server';
import invitationStorage from '@/lib/invitationStorage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    // Find invitation by code
    const invitation = await invitationStorage.getInvitationByCode(code);
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }
    
    // Return public-safe invitation data
    return NextResponse.json({
      name: invitation.name,
      email: invitation.email,
      company: invitation.company,
      companyLogo: invitation.companyLogo,
      personalMessage: invitation.personalMessage
    });
  } catch (error) {
    console.error('Failed to fetch invitation:', error);
    return NextResponse.json({ error: 'Failed to fetch invitation' }, { status: 500 });
  }
}