import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Only handle exact /tools paths, not API routes or assets
  if (pathname === '/tools' || pathname.match(/^\/tools\/[^.]+$/)) {
    const url = request.nextUrl.clone()
    
    if (pathname === '/tools') {
      url.pathname = '/'
    } else {
      // Remove /tools prefix
      url.pathname = pathname.replace('/tools', '')
    }
    
    // Permanent redirect for SEO
    return NextResponse.redirect(url, { status: 308 })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/tools',
    '/tools/:path*'
  ]
}