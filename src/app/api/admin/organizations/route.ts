import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// GET - List all organizations (both from DB and Clerk)
export async function GET() {
  try {
    const { userId } = await auth();
    
    // Check if user is admin
    const adminEmails = ['steve@getcampfire.com'];
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);
    const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get companies from database
    const companies = await prisma.company.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Get organizations from Clerk
    const clerkOrgs = await client.organizations.getOrganizationList({ limit: 100 });
    
    // Get member details for each Clerk org
    const organizationsWithMembers = await Promise.all(
      clerkOrgs.data.map(async (org) => {
        const membersList = await client.organizations.getOrganizationMembershipList({
          organizationId: org.id,
          limit: 100
        });
        
        const adminCount = membersList.data.filter(
          member => member.role === 'org:admin'
        ).length;
        
        return {
          ...org,
          totalMembers: membersList.totalCount,
          adminCount
        };
      })
    );
    
    // Merge data - match by name or clerkOrgId if we have it stored
    const organizations = companies.map(company => {
      const clerkOrg = organizationsWithMembers.find(org => 
        org.name.toLowerCase() === company.name.toLowerCase()
      );
      
      return {
        id: company.id,
        name: company.name,
        logo: company.logo,
        clerkOrgId: clerkOrg?.id || company.clerkOrgId,
        clerkOrgSlug: clerkOrg?.slug,
        memberCount: clerkOrg?.totalMembers || 0,
        adminCount: clerkOrg?.adminCount || 0,
        domains: company.domains,
        createdAt: company.createdAt,
        hasClerkOrg: !!clerkOrg
      };
    });
    
    // Add any Clerk orgs that don't have a database record
    const unmatchedClerkOrgs = organizationsWithMembers.filter(org => 
      !companies.some(c => c.name.toLowerCase() === org.name.toLowerCase())
    );
    
    unmatchedClerkOrgs.forEach(org => {
      organizations.push({
        id: '',  // Empty string instead of null for TypeScript
        name: org.name,
        logo: org.imageUrl,
        clerkOrgId: org.id,
        clerkOrgSlug: org.slug,
        memberCount: org.totalMembers || 0,
        adminCount: org.adminCount || 0,
        domains: [],
        createdAt: new Date(org.createdAt),
        hasClerkOrg: true
      });
    });
    
    return NextResponse.json({ organizations });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 });
  }
}

// POST - Create a new organization (both in DB and Clerk)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    // Check if user is admin
    const adminEmails = ['steve@getcampfire.com'];
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);
    const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const { name, logo, domains, adminFirstName, adminLastName, adminEmail } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 });
    }
    
    if (!adminEmail || !adminFirstName || !adminLastName) {
      return NextResponse.json({ error: 'Admin email, first name, and last name are required' }, { status: 400 });
    }
    
    // Check if company already exists in DB
    const existingCompany = await prisma.company.findUnique({
      where: { name }
    });
    
    if (existingCompany) {
      return NextResponse.json({ error: 'Organization with this name already exists' }, { status: 409 });
    }
    
    // Validate and check for domain conflicts if domains are provided
    if (domains && domains.length > 0) {
      // Validate domain format
      const domainRegex = /^@[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/;
      const invalidDomains = domains.filter((d: string) => !domainRegex.test(d));
      
      if (invalidDomains.length > 0) {
        return NextResponse.json({ 
          error: `Invalid domain format: ${invalidDomains.join(', ')}. Domains should be in format @example.com` 
        }, { status: 400 });
      }
      
      // Check database for domain conflicts
      const allCompanies = await prisma.company.findMany({
        where: {
          domains: {
            hasSome: domains
          }
        }
      });
      
      if (allCompanies.length > 0) {
        const conflictingDomains = allCompanies.flatMap(c => 
          c.domains.filter((d: string) => domains.includes(d))
        );
        return NextResponse.json({ 
          error: `Domain(s) already in use: ${conflictingDomains.join(', ')}` 
        }, { status: 409 });
      }
      
      // Check Clerk organizations for domain conflicts
      const clerkOrgs = await client.organizations.getOrganizationList({ limit: 100 });
      for (const org of clerkOrgs.data) {
        if (org.publicMetadata?.domains) {
          const existingDomains = org.publicMetadata.domains as string[];
          const conflicts = domains.filter((d: string) => existingDomains.includes(d));
          if (conflicts.length > 0) {
            return NextResponse.json({ 
              error: `Domain(s) already in use by ${org.name}: ${conflicts.join(', ')}` 
            }, { status: 409 });
          }
        }
      }
    }
    
    // First, check if the admin user exists in Clerk
    let adminUser;
    try {
      const users = await client.users.getUserList({
        emailAddress: [adminEmail]
      });
      adminUser = users.data[0];
    } catch (error) {
      console.log('Admin user not found, will create new user');
    }
    
    // If admin doesn't exist, create them
    if (!adminUser) {
      adminUser = await client.users.createUser({
        emailAddress: [adminEmail],
        firstName: adminFirstName,
        lastName: adminLastName
      });
    }
    
    // Create organization in Clerk WITHOUT createdBy to avoid auto-adding current user
    const clerkOrg = await client.organizations.createOrganization({
      name,
      publicMetadata: {
        logo,
        domains: domains || []
      }
    });
    
    // Create company in database with Clerk org ID and domains
    const company = await prisma.company.create({
      data: {
        name,
        logo: logo || null,
        clerkOrgId: clerkOrg.id,
        domains: domains || []
      }
    });
    
    // Add the admin user to the organization as an admin
    await client.organizations.createOrganizationMembership({
      organizationId: clerkOrg.id,
      userId: adminUser.id,
      role: 'org:admin'
    });
    
    // Send invitation email if this is a new user
    if (!adminUser.emailAddresses[0]?.verification?.status) {
      // Create an invitation in the database to track it
      const inviteCode = Math.random().toString(36).substring(2, 10);
      const invitation = await prisma.invitation.create({
        data: {
          email: adminEmail,
          name: `${adminFirstName} ${adminLastName}`,
          inviteCode,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://tools.getcampfire.com'}/admin?invite=${inviteCode}`,
          companyId: company.id,
          status: 'PENDING'
        }
      });
      
      // Create metadata with role
      await prisma.invitationMetadata.create({
        data: {
          invitationId: invitation.id,
          role: 'ADMIN'
        }
      });
    }
    
    // If domains are provided, update Clerk org with enrollment mode
    if (domains && domains.length > 0) {
      // Note: Domain enrollment requires additional Clerk configuration
      // For now, we store domains in publicMetadata
      await client.organizations.updateOrganization(clerkOrg.id, {
        publicMetadata: {
          logo,
          domains,
          allowedEmailDomains: domains
        }
      });
    }
    
    return NextResponse.json({ 
      success: true,
      organization: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        clerkOrgId: clerkOrg.id,
        clerkOrgSlug: clerkOrg.slug,
        domains
      }
    });
  } catch (error: any) {
    // Handle Clerk-specific errors
    if (error.errors && error.errors[0]?.code === 'form_identifier_exists') {
      return NextResponse.json({ error: 'An organization with this name already exists in Clerk' }, { status: 409 });
    }
    
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 });
  }
}