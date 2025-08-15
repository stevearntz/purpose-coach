import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { inviteCode } = await request.json();
    
    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code required' }, { status: 400 });
    }
    
    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { inviteCode },
      include: { 
        company: true
      }
    });
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Admin model removed - no existing admin check needed
    const existingAdmin = null;
    
    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        name: invitation.name,
        status: invitation.status,
        completedAt: invitation.completedAt,
        company: invitation.company.name,
        companyId: invitation.company.id
      },
      existingAdmin: null // Admin model removed
    });
  } catch (error) {
    console.error('Debug invitation status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check invitation',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}