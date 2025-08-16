import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/auth(.*)',
  '/sign-in(.*)',  // Keep for backwards compatibility
  '/sign-up(.*)',  // Keep for backwards compatibility
  '/forgot-password(.*)',
  '/sso-callback(.*)',
  '/',
  '/toolkit(.*)',
  // Assessment tools and campaign links are public
  '/assessment(.*)',
  '/hr-partnership(.*)',
  '/purpose(.*)',
  '/values(.*)',
  '/strengths(.*)',
  '/trust-audit(.*)',
  '/burnout-assessment(.*)',
  '/team-charter(.*)',
  '/coaching-cards(.*)',
  '/career-drivers(.*)',
  '/hopes-fears-expectations(.*)',
])

const isApiRoute = createRouteMatcher(['/api(.*)'])
const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isDashboardRoute = createRouteMatcher([
  '/dashboard',
  '/dashboard/(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, sessionClaims } = await auth()
  
  // Allow public routes
  if (isPublicRoute(req)) return
  
  // Skip middleware for API routes - they handle auth themselves
  if (isApiRoute(req)) return
  
  // Require authentication for all other routes
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
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};