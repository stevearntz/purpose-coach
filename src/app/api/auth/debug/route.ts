import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('authjs.session-token') || 
                      cookieStore.get('__Secure-authjs.session-token') ||
                      cookieStore.get('next-auth.session-token') ||
                      cookieStore.get('__Secure-next-auth.session-token')
  
  // List all env vars that start with NEXT to debug
  const envVars = Object.keys(process.env)
    .filter(key => key.includes('AUTH') || key.includes('SECRET'))
    .map(key => ({
      name: key,
      exists: !!process.env[key],
      prefix: process.env[key]?.substring(0, 5)
    }))
  
  return NextResponse.json({
    hasSession: !!sessionToken,
    sessionName: sessionToken?.name || 'none',
    environment: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasSecret: !!process.env.NEXTAUTH_SECRET,
    secretPrefix: process.env.NEXTAUTH_SECRET?.substring(0, 5) || 'not-set',
    envVars,
    timestamp: new Date().toISOString()
  })
}