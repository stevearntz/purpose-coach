import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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

export default async function middleware(request: NextRequest) {
  try {
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
    
    // TEMPORARY: Skip auth checks in middleware
    // Auth is handled by individual pages/API routes
    // This prevents middleware crashes in production
    
    // Add security headers to response
    const response = NextResponse.next()
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
    
    return response
  } catch (error) {
    // If anything fails, just continue without crashing
    console.error('[middleware] Error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}