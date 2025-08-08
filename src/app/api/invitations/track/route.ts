import { NextRequest, NextResponse } from 'next/server';
import invitationStorage from '@/lib/invitationStorage';

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, event, timestamp, metadata } = await request.json();
    
    // Track the event using the storage service
    await invitationStorage.trackInvitationEvent(inviteCode, event, metadata);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to track invitation:', error);
    return NextResponse.json({ error: 'Failed to track invitation' }, { status: 500 });
  }
}