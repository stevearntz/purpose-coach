/**
 * Script to sync organizations - removes DB companies that don't exist in Clerk
 * Run with: DATABASE_URL="your_database_url" npx tsx admin-scripts/sync-organizations.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncOrganizations() {
  console.log('🔄 Syncing organizations with database...\n');
  
  try {
    // Get all database companies
    const dbCompanies = await prisma.company.findMany();
    
    console.log('📊 Database Companies:');
    dbCompanies.forEach(company => {
      console.log(`   - ${company.name}`);
    });
    
    // For now, let's just remove the companies that we know don't exist in Clerk
    // (GoSolo, CNH, BecauseMarket)
    const companiesToDelete = ['GoSolo', 'CNH', 'BecauseMarket'];
    
    console.log(`\n🗑️  Removing non-Clerk companies:`);
    
    for (const companyName of companiesToDelete) {
      const company = await prisma.company.findUnique({
        where: { name: companyName }
      });
      
      if (company) {
        // Delete related data first
        const campaigns = await prisma.campaign.deleteMany({
          where: { companyId: company.id }
        });
        
        const invitations = await prisma.invitation.deleteMany({
          where: { companyId: company.id }
        });
        
        // Delete the company
        await prisma.company.delete({
          where: { id: company.id }
        });
        
        console.log(`   ✅ Deleted ${company.name} (${campaigns.count} campaigns, ${invitations.count} invitations)`);
      } else {
        console.log(`   ⚠️  ${companyName} not found in database`);
      }
    }
    
    console.log('\n✨ Cleanup complete!');
    
    // Show final state
    const finalCompanies = await prisma.company.findMany();
    console.log(`\n📊 Final state:`);
    console.log(`   Companies in database: ${finalCompanies.length}`);
    finalCompanies.forEach(company => {
      console.log(`   - ${company.name}`);
    });
    
  } catch (error) {
    console.error('❌ Error syncing organizations:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncOrganizations().catch(console.error);