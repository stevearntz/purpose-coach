import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Only these routes require authentication
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/onboarding(.*)'
])

const isApiRoute = createRouteMatcher(['/api(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isDashboardRoute = createRouteMatcher([
  '/dashboard',
  '/dashboard/(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, sessionClaims } = await auth()
  
  // Skip middleware for API routes - they handle auth themselves
  if (isApiRoute(req)) return
  
  // Only check authentication for protected routes
  if (isProtectedRoute(req)) {
    // Require authentication for protected routes
    if (!userId) {
      const authUrl = new URL('/auth', req.url)
      authUrl.searchParams.set('redirect_url', req.url)
      return NextResponse.redirect(authUrl)
    }
    
    // Check if user has selected or created an organization
    // If they're on dashboard or protected routes, they need an org
    if (isDashboardRoute(req) && !orgId) {
      // Redirect to onboarding to create/select organization
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
    
    // If user has an org and tries to access onboarding, redirect to dashboard
    if (isOnboardingRoute(req) && orgId) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  // All other routes are public - no authentication required
  return
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};