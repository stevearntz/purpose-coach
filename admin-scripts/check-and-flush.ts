/**
 * Script to check existing companies and flush all data
 * Run with: DATABASE_URL="your_database_url" npx tsx admin-scripts/check-and-flush.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAndFlush() {
  console.log('🔍 Checking existing data...\n');
  
  try {
    // Check what currently exists
    const companies = await prisma.company.findMany();
    const campaigns = await prisma.campaign.count();
    const invitations = await prisma.invitation.count();
    const assessmentResults = await prisma.assessmentResult.count();
    
    console.log('Current database state:');
    console.log(`  Companies (${companies.length}):`);
    companies.forEach(c => console.log(`    - ${c.name} (ID: ${c.id})`));
    console.log(`  Campaigns: ${campaigns}`);
    console.log(`  Invitations: ${invitations}`);
    console.log(`  Assessment Results: ${assessmentResults}`);
    
    if (companies.length === 0) {
      console.log('\n✅ Database is already empty!');
      return;
    }
    
    console.log('\n🧹 Starting complete data flush...\n');
    
    // Flush all data
    await prisma.$transaction(async (tx) => {
      // Delete in correct order to respect foreign key constraints
      const assessmentResults = await tx.assessmentResult.deleteMany();
      console.log(`🗑️  Deleted ${assessmentResults.count} assessment results`);
      
      const metadata = await tx.invitationMetadata.deleteMany();
      console.log(`🗑️  Deleted ${metadata.count} invitation metadata records`);
      
      const invitations = await tx.invitation.deleteMany();
      console.log(`🗑️  Deleted ${invitations.count} invitations`);
      
      const campaigns = await tx.campaign.deleteMany();
      console.log(`🗑️  Deleted ${campaigns.count} campaigns`);
      
      const companies = await tx.company.deleteMany();
      console.log(`🗑️  Deleted ${companies.count} companies`);
    });
    
    console.log('\n✨ Complete data flush done!');
    console.log('\n📊 Final state:');
    
    const finalCompanies = await prisma.company.count();
    const finalCampaigns = await prisma.campaign.count();
    const finalInvitations = await prisma.invitation.count();
    const finalResults = await prisma.assessmentResult.count();
    
    console.log(`  Companies: ${finalCompanies}`);
    console.log(`  Campaigns: ${finalCampaigns}`);
    console.log(`  Invitations: ${finalInvitations}`);
    console.log(`  Assessment Results: ${finalResults}`);
    
    console.log('\n✅ Database is now clean and ready for fresh data!');
    console.log('\n💡 Next steps:');
    console.log('  1. Create the companies you want: gosolo, cnh, bcausemarket');
    console.log('  2. Use /admin to manage these organizations');
    console.log('  3. steve@getcampfire.com has admin access');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check and flush
checkAndFlush().catch(console.error);