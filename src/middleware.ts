import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  '/toolkit(.*)',
  // Assessment tools are public
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
const isDashboardRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()
  
  // Allow public routes
  if (isPublicRoute(req)) return
  
  // Skip middleware for API routes - they handle auth themselves
  if (isApiRoute(req)) return
  
  // Require authentication for all other routes
  if (!userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }
  
  // Check if user needs onboarding (now that publicMetadata is in sessionClaims)
  const publicMetadata = sessionClaims?.publicMetadata as any
  const hasCompany = publicMetadata?.companyId
  const isOnboardingComplete = publicMetadata?.onboardingComplete
  
  // User needs onboarding if they don't have a company OR haven't completed onboarding
  const needsOnboarding = userId && (!hasCompany || !isOnboardingComplete)
  
  // Redirect to onboarding if needed (but not if already on onboarding page)
  if (needsOnboarding && !isOnboardingRoute(req)) {
    return NextResponse.redirect(new URL('/onboarding', req.url))
  }
  
  // Redirect from onboarding to dashboard if onboarding is complete
  if (!needsOnboarding && isOnboardingRoute(req)) {
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