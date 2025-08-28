#!/usr/bin/env tsx
/**
 * Sync Clerk Organizations with Database
 * 
 * This script ensures all Clerk organizations are properly synced with our database.
 * Run this after any manual changes in Clerk Dashboard or if you suspect sync issues.
 * 
 * Usage:
 *   npm run sync:orgs
 *   or
 *   npx tsx admin-scripts/sync-clerk-organizations.ts
 */

import { clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

async function syncOrganizations() {
  console.log('🔄 Starting Clerk organization sync...\n');
  
  try {
    const client = await clerkClient();
    
    // Fetch all organizations from Clerk
    const clerkOrgs = await client.organizations.getOrganizationList({
      limit: 100 // Adjust if you have more organizations
    });
    
    console.log(`Found ${clerkOrgs.totalCount} organizations in Clerk\n`);
    
    let created = 0;
    let updated = 0;
    let unchanged = 0;
    
    for (const org of clerkOrgs.data) {
      // Check if organization exists in database
      const existing = await prisma.company.findUnique({
        where: { clerkOrgId: org.id }
      });
      
      if (!existing) {
        // Create new company
        await prisma.company.create({
          data: {
            name: org.name,
            clerkOrgId: org.id,
            domains: []
          }
        });
        console.log(`✅ Created: ${org.name} (${org.id})`);
        created++;
      } else if (existing.name !== org.name) {
        // Update existing company
        await prisma.company.update({
          where: { clerkOrgId: org.id },
          data: { 
            name: org.name,
            updatedAt: new Date()
          }
        });
        console.log(`📝 Updated: ${org.name} (${org.id})`);
        updated++;
      } else {
        console.log(`✓ Unchanged: ${org.name} (${org.id})`);
        unchanged++;
      }
    }
    
    console.log('\n📊 Sync Summary:');
    console.log(`- Created: ${created}`);
    console.log(`- Updated: ${updated}`);
    console.log(`- Unchanged: ${unchanged}`);
    
    // Check for orphaned database records (exist in DB but not in Clerk)
    const dbCompanies = await prisma.company.findMany({
      where: {
        clerkOrgId: { not: null }
      }
    });
    
    const clerkOrgIds = new Set(clerkOrgs.data.map(org => org.id));
    const orphaned = dbCompanies.filter(company => 
      company.clerkOrgId && !clerkOrgIds.has(company.clerkOrgId)
    );
    
    if (orphaned.length > 0) {
      console.log('\n⚠️  Found orphaned database records (exist in DB but not in Clerk):');
      for (const company of orphaned) {
        console.log(`  - ${company.name} (${company.clerkOrgId})`);
      }
      console.log('\nConsider cleaning up these records or recreating them in Clerk.');
    }
    
    console.log('\n✅ Sync completed successfully!');
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncOrganizations().catch(console.error);