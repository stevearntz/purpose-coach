import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard']  // Removed /admin - it's open for now

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login']

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  
  // If visiting from connectionsorter.com or www.connectionsorter.com
  if (host.includes('connectionsorter.com')) {
    // Rewrite to the connection-sorter folder
    return NextResponse.rewrite(new URL('/connection-sorter', request.url))
  }
  
  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Get auth cookie
  const authCookie = request.cookies.get('campfire-auth')
  
  // For now, just check if cookie exists
  // JWT verification in middleware Edge Runtime is complex
  const hasAuth = !!authCookie?.value
  
  console.log('[middleware] Check:', {
    pathname,
    isProtectedRoute,
    isAuthRoute,
    hasAuth,
    hasCookie: !!authCookie,
    cookieValue: authCookie?.value ? `${authCookie.value.substring(0, 20)}...` : null
  })
  
  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !hasAuth) {
    console.log('[middleware] Redirecting to login - no auth cookie for protected route')
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }
  
  // Redirect to dashboard if accessing auth routes while authenticated
  if (isAuthRoute && hasAuth) {
    console.log('[middleware] Redirecting to dashboard - already has auth cookie')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // Otherwise, continue as normal
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}