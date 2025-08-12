import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/dashboard']  // Removed /admin - it's open for now

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ['/login']

// SECURITY: Block dangerous routes in production
const BLOCKED_API_ROUTES = [
  '/api/admin/flush-storage',
  '/api/admin/storage-info',
  '/api/test-storage',
  '/api/test-email',
  '/api/debug',
  '/api/auth/test-cookie',
  '/api/auth/test-direct'
]

// SECURITY: Deprecated routes that should show warnings
const DEPRECATED_ROUTES: Record<string, string> = {
  '/api/companies': '/api/companies/v2',
  '/api/admin/invitations': '/api/admin/invitations/v2',
  '/api/company/users': '/api/company/users/v2',
  '/api/results/campaigns': '/api/results/campaigns/v2',
  '/api/campaigns/launch': '/api/campaigns/launch/v2'
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname
  const isProduction = process.env.NODE_ENV === 'production'
  
  // SECURITY: Add security headers to all responses
  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  }
  
  // SECURITY: Block dangerous API routes in production
  if (isProduction && BLOCKED_API_ROUTES.some(route => pathname.startsWith(route))) {
    console.warn(`[SECURITY] Blocked access to dangerous route: ${pathname}`)
    return new NextResponse('Not Found', { 
      status: 404,
      headers: securityHeaders
    })
  }
  
  // SECURITY: Warn about deprecated API routes
  const deprecatedRoute = Object.keys(DEPRECATED_ROUTES).find(route => 
    pathname === route || pathname.startsWith(route + '?')
  )
  
  if (deprecatedRoute && isProduction) {
    console.warn(`[SECURITY] Access to deprecated route: ${pathname}`)
    return NextResponse.json(
      { 
        error: 'This endpoint is deprecated for security reasons',
        message: `Please use ${DEPRECATED_ROUTES[deprecatedRoute]} instead`,
        documentation: 'See API-MIGRATION-GUIDE.md'
      },
      { 
        status: 410, // Gone
        headers: securityHeaders
      }
    )
  }
  
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
  // DISABLED: This causes redirect loops with invalid cookies
  // The login page should handle redirecting authenticated users
  // if (isAuthRoute && hasAuth) {
  //   console.log('[middleware] Redirecting to dashboard - already has auth cookie')
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }
  
  // Add security headers to response
  const response = NextResponse.next()
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
}