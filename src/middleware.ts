import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  
  // If visiting from connectionsorter.com or www.connectionsorter.com
  if (host.includes('connectionsorter.com')) {
    // Rewrite to the connection-sorter folder
    return NextResponse.rewrite(new URL('/connection-sorter', request.url))
  }
  
  // Otherwise, continue as normal
  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}