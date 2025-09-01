import { NextRequest, NextResponse } from 'next/server';
import { invitationStorage } from '@/lib/invitationStorage';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    // Create a test invitation
    const testCode = `test-${nanoid(6)}`;
    const testInvitation = {
      id: nanoid(),
      email: 'test@example.com',
      name: 'Test User',
      company: 'Test Company',
      inviteCode: testCode,
      inviteUrl: `http://localhost:3000/start?invite=${testCode}`,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      metadata: {}
    };
    
    console.log('Test: Creating invitation with code:', testCode);
    
    // Save it
    await invitationStorage.saveInvitation(testInvitation);
    
    console.log('Test: Invitation saved, now retrieving...');
    
    // Try to retrieve it
    const retrieved = await invitationStorage.getInvitationByCode(testCode);
    
    console.log('Test: Retrieved invitation:', retrieved ? 'Success' : 'Failed');
    
    return NextResponse.json({
      success: !!retrieved,
      testCode,
      saved: testInvitation,
      retrieved,
      match: JSON.stringify(testInvitation) === JSON.stringify(retrieved)
    });
  } catch (error) {
    console.error('Test storage error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}