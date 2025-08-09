import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the raw cookie
    const authCookie = request.cookies.get('campfire-auth');
    
    if (!authCookie) {
      return NextResponse.json({
        success: false,
        error: 'No auth cookie found'
      });
    }
    
    // Try to decode without verification first (to see structure)
    const decoded = jwt.decode(authCookie.value);
    
    // Try to verify with our secret
    let verified = null;
    let verifyError = null;
    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      verified = jwt.verify(authCookie.value, JWT_SECRET);
    } catch (err: any) {
      verifyError = err.message;
    }
    
    // Also try using our getAuthUser function
    console.log('[verify-token] About to call getAuthUser');
    const authUser = await getAuthUser(request);
    console.log('[verify-token] getAuthUser result:', authUser);
    
    return NextResponse.json({
      success: true,
      cookie: {
        exists: true,
        length: authCookie.value.length,
        prefix: authCookie.value.substring(0, 50)
      },
      decoded: decoded,
      verified: verified,
      verifyError: verifyError,
      authUser: authUser,
      env: {
        hasJwtSecret: !!process.env.JWT_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}