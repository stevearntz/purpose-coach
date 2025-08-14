import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    // Debug: Check cookies
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('authjs.session-token') || cookieStore.get('__Secure-authjs.session-token');
    
    console.log('[test-auth] Session token exists:', !!sessionToken);
    console.log('[test-auth] Token name:', sessionToken?.name);
    
    // Try to get session
    const { userId } = await auth();
    
    console.log('[test-auth] User ID:', userId);
    
    return NextResponse.json({
      hasSession: !!userId,
      userId: userId || null,
      cookieFound: !!sessionToken,
      cookieName: sessionToken?.name || null
    });
  } catch (error) {
    console.error('[test-auth] Error:', error);
    return NextResponse.json({
      error: String(error),
      hasSession: false
    });
  }
}