import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { clerkClient } from '@clerk/nextjs/server';

export async function GET() {
  try {
    // Get all companies from database
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        clerkOrgId: true,
        domains: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get all organizations from Clerk
    const client = await clerkClient();
    const clerkOrgs = await client.organizations.getOrganizationList();

    // Map to show which exist where
    const orgComparison = companies.map(company => {
      const clerkOrg = clerkOrgs.data.find(org => org.id === company.clerkOrgId);
      return {
        name: company.name,
        inDatabase: true,
        inClerk: !!clerkOrg,
        dbId: company.id,
        clerkId: company.clerkOrgId,
        domains: company.domains,
        createdAt: company.createdAt,
        clerkData: clerkOrg ? {
          name: clerkOrg.name,
          slug: clerkOrg.slug,
          membersCount: clerkOrg.membersCount
        } : null
      };
    });

    // Check for Clerk orgs not in database
    const orphanedClerkOrgs = clerkOrgs.data
      .filter(org => !companies.find(c => c.clerkOrgId === org.id))
      .map(org => ({
        name: org.name,
        inDatabase: false,
        inClerk: true,
        clerkId: org.id,
        slug: org.slug,
        membersCount: org.membersCount,
        createdAt: org.createdAt
      }));

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      summary: {
        totalInDatabase: companies.length,
        totalInClerk: clerkOrgs.data.length,
        syncedOrgs: orgComparison.filter(o => o.inClerk).length,
        orphanedInDb: orgComparison.filter(o => !o.inClerk).length,
        orphanedInClerk: orphanedClerkOrgs.length
      },
      organizations: [...orgComparison, ...orphanedClerkOrgs],
      raw: {
        database: companies,
        clerk: clerkOrgs.data
      }
    });
  } catch (error) {
    console.error('Debug orgs error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch organizations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}