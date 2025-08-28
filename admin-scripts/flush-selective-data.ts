/**
 * Script to flush data except for specific companies
 * Run with: DATABASE_URL="your_database_url" npx tsx admin-scripts/flush-selective-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function flushSelectiveData() {
  console.log('🧹 Starting selective data flush...\n');
  
  // Company names to keep (case-insensitive)
  const COMPANIES_TO_KEEP = ['gosolo', 'cnh', 'bcausemarket'];
  
  try {
    // Find companies to preserve (case-insensitive search)
    const companiesToKeep = await prisma.company.findMany({
      where: {
        name: {
          in: COMPANIES_TO_KEEP,
          mode: 'insensitive'
        }
      }
    });
    
    const companyIdsToKeep = companiesToKeep.map(c => c.id);
    const companyNamesToKeep = companiesToKeep.map(c => c.name);
    
    console.log(`✅ Found ${companiesToKeep.length} companies to preserve:`);
    companiesToKeep.forEach(c => {
      console.log(`   - ${c.name} (ID: ${c.id})`);
    });
    
    // Check if we found all requested companies
    const missingCompanies = COMPANIES_TO_KEEP.filter(
      name => !companyNamesToKeep.some(kept => kept.toLowerCase() === name.toLowerCase())
    );
    
    if (missingCompanies.length > 0) {
      console.log(`\n⚠️  Warning: These companies were not found and will not be preserved:`);
      missingCompanies.forEach(name => console.log(`   - ${name}`));
    }
    
    console.log('\n📋 Starting deletion process...\n');
    
    // Start transaction to flush data
    await prisma.$transaction(async (tx) => {
      // 1. Delete assessment results for companies we're not keeping
      const assessmentResults = await tx.assessmentResult.deleteMany({
        where: {
          companyId: { 
            notIn: companyIdsToKeep.length > 0 ? companyIdsToKeep : [''] 
          }
        }
      });
      console.log(`🗑️  Deleted ${assessmentResults.count} assessment results`);
      
      // 2. Delete campaigns for companies we're not keeping
      const campaigns = await tx.campaign.deleteMany({
        where: {
          companyId: { 
            notIn: companyIdsToKeep.length > 0 ? companyIdsToKeep : [''] 
          }
        }
      });
      console.log(`🗑️  Deleted ${campaigns.count} campaigns`);
      
      // 3. Delete invitation metadata first
      const metadataToDelete = await tx.invitationMetadata.findMany({
        where: {
          invitation: {
            companyId: { 
              notIn: companyIdsToKeep.length > 0 ? companyIdsToKeep : [''] 
            }
          }
        },
        select: { id: true }
      });
      
      const metadata = await tx.invitationMetadata.deleteMany({
        where: {
          id: { in: metadataToDelete.map(m => m.id) }
        }
      });
      console.log(`🗑️  Deleted ${metadata.count} invitation metadata records`);
      
      // 4. Delete invitations for companies we're not keeping
      const invitations = await tx.invitation.deleteMany({
        where: {
          companyId: { 
            notIn: companyIdsToKeep.length > 0 ? companyIdsToKeep : [''] 
          }
        }
      });
      console.log(`🗑️  Deleted ${invitations.count} invitations`);
      
      // 5. Delete companies we're not keeping
      const companies = await tx.company.deleteMany({
        where: {
          id: { 
            notIn: companyIdsToKeep.length > 0 ? companyIdsToKeep : [''] 
          }
        }
      });
      console.log(`🗑️  Deleted ${companies.count} companies`);
    });
    
    console.log('\n✨ Selective data flush complete!');
    console.log(`\n📊 Remaining data:`);
    
    // Show what's left
    const remainingCompanies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            campaigns: true,
            invitations: true
          }
        }
      }
    });
    
    const totalCampaigns = await prisma.campaign.count();
    const totalInvitations = await prisma.invitation.count();
    const totalAssessmentResults = await prisma.assessmentResult.count();
    
    console.log(`\n   Companies (${remainingCompanies.length}):`);
    remainingCompanies.forEach(c => {
      console.log(`     - ${c.name}`);
      console.log(`       • Campaigns: ${c._count.campaigns}`);
      console.log(`       • Invitations: ${c._count.invitations}`);
    });
    
    console.log(`\n   Total remaining:`);
    console.log(`     - Campaigns: ${totalCampaigns}`);
    console.log(`     - Invitations: ${totalInvitations}`);
    console.log(`     - Assessment Results: ${totalAssessmentResults}`);
    
  } catch (error) {
    console.error('❌ Error flushing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the flush
flushSelectiveData().catch(console.error);