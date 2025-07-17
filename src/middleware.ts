import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  
  // Redirect /tools to root
  if (pathname === '/tools') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    // Preserve query parameters (like ?screen=4)
    return NextResponse.redirect(url)
  }
  
  // Redirect /tools/* to /*
  if (pathname.startsWith('/tools/')) {
    const url = request.nextUrl.clone()
    // Remove /tools prefix
    url.pathname = pathname.replace('/tools', '')
    return NextResponse.redirect(url)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/tools/:path*'
}