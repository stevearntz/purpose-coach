import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Check if user is authenticated (basic security)
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    const checks: any = {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      checks: {
        // Database
        database: {
          configured: !!process.env.DATABASE_URL,
          canConnect: false,
          companiesCount: 0,
          neonBranch: 'unknown'
        },
        // Clerk
        clerk: {
          publishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
          secretKey: !!process.env.CLERK_SECRET_KEY,
          webhookSecret: !!process.env.CLERK_WEBHOOK_SECRET,
          isProduction: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('pk_live') || false,
          currentUserId: userId
        },
        // Services
        services: {
          openai: !!process.env.OPENAI_API_KEY,
          redis: !!process.env.REDIS_URL,
          resend: !!process.env.RESEND_API_KEY,
          amplitude: !!process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY
        },
        // URLs
        urls: {
          appUrl: process.env.NEXT_PUBLIC_APP_URL,
          baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
          isProduction: process.env.NEXT_PUBLIC_BASE_URL?.includes('getcampfire.com') || false
        }
      }
    };
    
    // Try to connect to database
    try {
      const companies = await prisma.company.count();
      checks.checks.database.canConnect = true;
      checks.checks.database.companiesCount = companies;
      
      // Check which Neon branch based on connection string
      const dbUrl = process.env.DATABASE_URL || '';
      if (dbUrl.includes('-pooler')) {
        // Extract branch info if possible
        checks.checks.database.neonBranch = dbUrl.includes('dev') ? 'development' : 'main (production)';
      }
      
      // Check if Campfire org exists with correct Clerk ID
      const campfire = await prisma.company.findFirst({
        where: { name: 'Campfire' },
        select: { clerkOrgId: true, domains: true }
      });
      
      checks.checks['campfireOrg'] = {
        exists: !!campfire,
        hasClerkId: !!campfire?.clerkOrgId,
        clerkOrgId: campfire?.clerkOrgId?.substring(0, 20) + '...',
        domains: campfire?.domains || []
      };
      
    } catch (dbError: any) {
      checks.checks.database.canConnect = false;
      checks.checks.database['error'] = dbError.message;
    }
    
    // Determine overall status
    const critical = [
      checks.checks.database.configured,
      checks.checks.database.canConnect,
      checks.checks.clerk.publishableKey,
      checks.checks.clerk.secretKey,
      checks.checks.clerk.webhookSecret,
      checks.checks.services.openai
    ];
    
    const allCriticalPassed = critical.every(c => c === true);
    const isFullyProduction = 
      checks.checks.clerk.isProduction && 
      checks.checks.urls.isProduction &&
      checks.checks.database.neonBranch.includes('main');
    
    checks['status'] = {
      critical: allCriticalPassed ? '✅ All critical checks passed' : '❌ Some critical checks failed',
      production: isFullyProduction ? '✅ Production configuration detected' : '⚠️ Mixed or development configuration',
      recommendations: []
    };
    
    // Add recommendations
    if (!checks.checks.clerk.isProduction) {
      checks.status.recommendations.push('Using Clerk test keys - switch to pk_live/sk_live for production');
    }
    if (!checks.checks.urls.isProduction) {
      checks.status.recommendations.push('Base URL not set to production domain');
    }
    if (checks.checks.database.neonBranch !== 'main (production)') {
      checks.status.recommendations.push('Database may not be using production branch');
    }
    if (!checks.checks.services.redis) {
      checks.status.recommendations.push('Redis not configured (optional but recommended for production)');
    }
    
    return NextResponse.json(checks, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to verify environment',
      details: error.message 
    }, { status: 500 });
  }
}