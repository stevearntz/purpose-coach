import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('authjs.session-token') || 
                      cookieStore.get('__Secure-authjs.session-token') ||
                      cookieStore.get('next-auth.session-token') ||
                      cookieStore.get('__Secure-next-auth.session-token')
  
  return NextResponse.json({
    hasSession: !!sessionToken,
    sessionName: sessionToken?.name || 'none',
    environment: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    secretPrefix: process.env.NEXTAUTH_SECRET?.substring(0, 5) || 'not-set'
  })
}