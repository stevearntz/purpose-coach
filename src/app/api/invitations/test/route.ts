import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Find all invitations for test company
    const invitations = await prisma.invitation.findMany({
      where: {
        email: {
          contains: 'acmetest.example'
        }
      },
      include: {
        company: true
      },
      take: 5
    });
    
    return NextResponse.json({
      success: true,
      count: invitations.length,
      invitations: invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        name: inv.name,
        inviteCode: inv.inviteCode,
        company: inv.company.name,
        status: inv.status
      }))
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}