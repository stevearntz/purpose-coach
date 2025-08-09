import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
  try {
    // Get the cookie directly
    const authCookie = request.cookies.get('campfire-auth');
    
    if (!authCookie) {
      return NextResponse.json({ 
        error: 'No cookie',
        allCookies: request.cookies.getAll().map(c => c.name)
      });
    }
    
    // Try to verify directly here
    const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    console.log('[test-direct] Using JWT_SECRET:', !!process.env.JWT_SECRET ? 'from env' : 'fallback');
    console.log('[test-direct] Token length:', authCookie.value.length);
    
    try {
      const decoded = jwt.verify(authCookie.value, JWT_SECRET);
      console.log('[test-direct] Token verified successfully:', decoded);
      
      return NextResponse.json({
        success: true,
        message: 'Token verified directly in route',
        decoded,
        env: {
          hasJwtSecret: !!process.env.JWT_SECRET,
          nodeEnv: process.env.NODE_ENV
        }
      });
    } catch (verifyError: any) {
      console.error('[test-direct] Verification failed:', verifyError.message);
      return NextResponse.json({
        success: false,
        error: verifyError.message,
        tokenLength: authCookie.value.length,
        env: {
          hasJwtSecret: !!process.env.JWT_SECRET,
          nodeEnv: process.env.NODE_ENV
        }
      });
    }
  } catch (error: any) {
    console.error('[test-direct] Unexpected error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}