import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, assessmentType } = await request.json();
    
    if (!inviteCode) {
      return NextResponse.json(
        { error: 'Invite code is required' },
        { status: 400 }
      );
    }
    
    console.log('[invitation-complete] Marking invitation as completed:', {
      inviteCode,
      assessmentType
    });
    
    // Find the invitation by invite code
    const invitation = await prisma.invitation.findFirst({
      where: { inviteCode }
    });
    
    if (!invitation) {
      console.warn('[invitation-complete] Invitation not found:', inviteCode);
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }
    
    // Update the invitation status to COMPLETED
    const updated = await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    // TODO: Add lastAssessment field once migration is applied
    // lastAssessment: assessmentType || 'Assessment',
    
    console.log('[invitation-complete] Invitation marked as completed:', {
      id: updated.id,
      email: updated.email,
      status: updated.status
    });
    
    return NextResponse.json({
      success: true,
      invitation: {
        id: updated.id,
        email: updated.email,
        status: updated.status
      }
    });
    
  } catch (error) {
    console.error('[invitation-complete] Error updating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to update invitation status' },
      { status: 500 }
    );
  }
}