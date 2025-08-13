/**
 * Script to flush all data except the main admin user
 * Run with: npx tsx scripts/flush-data.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function flushData() {
  console.log('🧹 Starting data flush...\n');
  
  const ADMIN_EMAIL = 'steve@stevearntz.com'; // Your admin email to preserve
  
  try {
    // Find the admin to preserve
    const adminToKeep = await prisma.admin.findUnique({
      where: { email: ADMIN_EMAIL },
      include: { company: true }
    });
    
    if (!adminToKeep) {
      console.log(`❌ Admin user ${ADMIN_EMAIL} not found. Please create it first.`);
      return;
    }
    
    console.log(`✅ Found admin to preserve: ${adminToKeep.email}`);
    console.log(`   Company: ${adminToKeep.company?.name || 'None'}\n`);
    
    // Start transaction to flush data
    await prisma.$transaction(async (tx) => {
      // 1. Delete all campaigns
      const campaigns = await tx.campaign.deleteMany();
      console.log(`🗑️  Deleted ${campaigns.count} campaigns`);
      
      // 2. Delete all invitations
      const invitations = await tx.invitation.deleteMany();
      console.log(`🗑️  Deleted ${invitations.count} invitations`);
      
      // 3. Delete all invitation metadata
      const metadata = await tx.invitationMetadata.deleteMany();
      console.log(`🗑️  Deleted ${metadata.count} invitation metadata records`);
      
      // 4. Delete all admins except the one to keep
      const admins = await tx.admin.deleteMany({
        where: {
          email: { not: ADMIN_EMAIL }
        }
      });
      console.log(`🗑️  Deleted ${admins.count} other admins`);
      
      // 5. Delete all companies except the admin's company (if they have one)
      if (adminToKeep.companyId) {
        const companies = await tx.company.deleteMany({
          where: {
            id: { not: adminToKeep.companyId }
          }
        });
        console.log(`🗑️  Deleted ${companies.count} other companies`);
      } else {
        const companies = await tx.company.deleteMany();
        console.log(`🗑️  Deleted ${companies.count} companies (admin has no company)`);
      }
      
      // 6. Delete all local storage data (if table exists)
      // Note: localStorage table may not exist in all schemas
      // const localStorage = await tx.localStorage.deleteMany();
      // console.log(`🗑️  Deleted ${localStorage.count} localStorage records`);
    });
    
    console.log('\n✨ Data flush complete!');
    console.log(`\n📊 Remaining data:`);
    
    // Show what's left
    const remainingAdmins = await prisma.admin.count();
    const remainingCompanies = await prisma.company.count();
    const remainingInvitations = await prisma.invitation.count();
    const remainingCampaigns = await prisma.campaign.count();
    
    console.log(`   Admins: ${remainingAdmins}`);
    console.log(`   Companies: ${remainingCompanies}`);
    console.log(`   Invitations: ${remainingInvitations}`);
    console.log(`   Campaigns: ${remainingCampaigns}`);
    
  } catch (error) {
    console.error('❌ Error flushing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the flush
flushData().catch(console.error);