import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('campfire-auth');
  const allCookies = request.cookies.getAll();
  
  return NextResponse.json({
    hasCampfireAuth: !!authCookie,
    campfireAuthValue: authCookie?.value ? `${authCookie.value.substring(0, 20)}...` : null,
    allCookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
    headers: {
      cookie: request.headers.get('cookie'),
    }
  });
}

export async function POST(request: NextRequest) {
  // Test setting a cookie
  const response = NextResponse.json({ 
    message: 'Test cookie set',
    timestamp: new Date().toISOString()
  });
  
  response.cookies.set('test-cookie', 'test-value-' + Date.now(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/'
  });
  
  return response;
}