import { NextRequest, NextResponse } from 'next/server';
import invitationStorage from '@/lib/invitationStorage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    
    console.log('[DEBUG] Looking for invitation with code:', code);
    
    // Get all storage info
    // @ts-ignore - accessing private property for debugging
    const memoryStoreKeys = Array.from(invitationStorage.memoryStore?.keys() || []);
    
    // Try to get the invitation
    const invitation = await invitationStorage.getInvitationByCode(code);
    
    // Get all invitations for comparison
    const allInvitations = await invitationStorage.getAllInvitations();
    
    const debugInfo = {
      requestedCode: code,
      found: !!invitation,
      invitation: invitation,
      memoryStoreKeys: memoryStoreKeys,
      totalInvitationsInSystem: allInvitations.length,
      allInvitationCodes: allInvitations.map(inv => ({
        code: inv.inviteCode,
        email: inv.email,
        name: inv.name,
        company: inv.company,
        status: inv.status
      })),
      // @ts-ignore
      redisAvailable: !!invitationStorage.redis,
      // @ts-ignore
      usingMemoryFallback: invitationStorage.useMemoryFallback
    };
    
    console.log('[DEBUG] Debug info:', JSON.stringify(debugInfo, null, 2));
    
    return NextResponse.json(debugInfo);
    
  } catch (error) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({ 
      error: 'Debug failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}