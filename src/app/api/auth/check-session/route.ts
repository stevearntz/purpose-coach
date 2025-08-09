import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const authCookie = request.cookies.get('campfire-auth');
    const authUser = await getAuthUser(request);
    
    return NextResponse.json({
      hasCookie: !!authCookie,
      cookieLength: authCookie?.value?.length || 0,
      isAuthenticated: !!authUser,
      user: authUser,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}