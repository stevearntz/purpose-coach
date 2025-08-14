import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  // Check all possible session cookies
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  // Try to get session
  let session = null
  let authError = null
  
  try {
    session = await auth()
  } catch (error: any) {
    authError = error?.message || 'Auth failed'
  }
  
  // Get all auth-related cookies
  const authCookies = allCookies.filter(c => 
    c.name.includes('auth') || 
    c.name.includes('session') || 
    c.name.includes('next')
  )
  
  return NextResponse.json({
    session: session ? {
      user: session.user,
      expires: session.expires
    } : null,
    authError,
    cookies: {
      total: allCookies.length,
      authRelated: authCookies.map(c => ({
        name: c.name,
        hasValue: !!c.value,
        valueLength: c.value?.length || 0
      }))
    },
    headers: {
      cookie: request.headers.get('cookie')?.substring(0, 100) || 'none'
    },
    environment: {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nodeEnv: process.env.NODE_ENV
    }
  })
}