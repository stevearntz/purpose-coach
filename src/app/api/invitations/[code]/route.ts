import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const params = await context.params;
    const code = params.code;
    
    console.log('[GET /api/invitations] Looking for invitation with code:', code);
    
    // Find invitation by code in database
    const invitation = await prisma.invitation.findUnique({
      where: { inviteCode: code },
      include: { company: true }
    });
    
    console.log('[GET /api/invitations] Found invitation:', invitation ? 'Yes' : 'No');
    
    if (!invitation) {
      console.error('[GET /api/invitations] Invitation not found for code:', code);
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 });
    }
    
    // Return public-safe invitation data
    const responseData = {
      name: invitation.name || '',
      email: invitation.email || '',
      company: invitation.company.name || '',
      companyLogo: invitation.company.logo || '',
      personalMessage: invitation.personalMessage || ''
    };
    
    console.log('[GET /api/invitations] Returning data:', responseData);
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Failed to fetch invitation:', error);
    // Return more detailed error in development
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ 
        error: 'Failed to fetch invitation',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to fetch invitation' }, { status: 500 });
  }
}