import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, event, timestamp, metadata } = await request.json();
    
    // Find invitation in database
    const invitation = await prisma.invitation.findUnique({
      where: { inviteCode },
      include: { metadata: true }
    });
    
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }
    
    // Update based on event type
    const updateData: any = {};
    const now = new Date();
    
    switch (event) {
      case 'opened':
        if (!invitation.openedAt) {
          updateData.openedAt = now;
          updateData.status = 'OPENED';
        }
        break;
        
      case 'started':
        updateData.startedAt = now;
        updateData.status = 'STARTED';
        updateData.currentStage = 'Role Selection';
        break;
        
      case 'progress':
        updateData.currentStage = metadata?.stage || invitation.currentStage;
        break;
        
      case 'completed':
        updateData.completedAt = now;
        updateData.status = 'COMPLETED';
        updateData.currentStage = 'Completed';
        break;
    }
    
    // Update invitation
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: updateData
    });
    
    // Update or create metadata if needed
    if (metadata?.role || metadata?.challenges || metadata?.tool) {
      if (!invitation.metadata) {
        await prisma.invitationMetadata.create({
          data: {
            invitationId: invitation.id,
            role: metadata.role,
            challenges: metadata.challenges || [],
            toolsAccessed: metadata.tool ? [metadata.tool] : []
          }
        });
      } else {
        const metadataUpdate: any = {};
        if (metadata.role) metadataUpdate.role = metadata.role;
        if (metadata.challenges) metadataUpdate.challenges = metadata.challenges;
        if (metadata.tool) {
          const currentTools = invitation.metadata.toolsAccessed || [];
          if (!currentTools.includes(metadata.tool)) {
            metadataUpdate.toolsAccessed = [...currentTools, metadata.tool];
          }
        }
        
        await prisma.invitationMetadata.update({
          where: { invitationId: invitation.id },
          data: metadataUpdate
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track invitation:', error);
    return NextResponse.json({ error: 'Failed to track invitation' }, { status: 500 });
  }
}