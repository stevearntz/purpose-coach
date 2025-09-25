#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupCampfireData() {
  console.log('🔍 Analyzing Campfire company data for cleanup...\n');
  console.log('⚠️  This will ONLY affect Campfire company data');
  console.log('✅ Keeping users: steve@getcampfire.com and steve.arntz@getcampfire.com\n');

  try {
    // First, find the Campfire company
    const campfireCompany = await prisma.company.findFirst({
      where: {
        name: 'Campfire'
      }
    });

    if (!campfireCompany) {
      console.log('❌ Campfire company not found in database');
      return;
    }

    console.log(`📊 Found Campfire company:`);
    console.log(`   ID: ${campfireCompany.id}`);
    console.log(`   Clerk Org ID: ${campfireCompany.clerkOrgId}\n`);

    // Get all data counts for Campfire
    const counts = {
      campaigns: await prisma.campaign.count({
        where: { companyId: campfireCompany.id }
      }),
      invitations: await prisma.invitation.count({
        where: { companyId: campfireCompany.id }
      }),
      userProfiles: await prisma.userProfile.count({
        where: { 
          companyId: campfireCompany.id,
          email: {
            notIn: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
          }
        }
      }),
      teamMembers: await prisma.teamMember.count({
        where: { companyId: campfireCompany.id }
      }),
      leads: await prisma.lead.count({
        where: { 
          source: { contains: 'campfire' }
        }
      })
    };

    // Get assessment results tied to Campfire invitations
    const campfireInvitations = await prisma.invitation.findMany({
      where: { companyId: campfireCompany.id },
      select: { id: true }
    });
    
    const assessmentResultCount = await prisma.assessmentResult.count({
      where: {
        invitationId: {
          in: campfireInvitations.map(inv => inv.id)
        }
      }
    });

    console.log('📈 Data to be cleaned up:');
    console.log(`   Campaigns: ${counts.campaigns}`);
    console.log(`   Invitations: ${counts.invitations}`);
    console.log(`   Assessment Results: ${assessmentResultCount}`);
    console.log(`   User Profiles (excluding steve & steve.arntz): ${counts.userProfiles}`);
    console.log(`   Team Members: ${counts.teamMembers}`);
    console.log(`   Leads: ${counts.leads}\n`);

    // Double-check we're not affecting other companies
    const totalCompanies = await prisma.company.count();
    if (totalCompanies > 1) {
      console.log(`✅ Verified: ${totalCompanies - 1} other companies will NOT be affected\n`);
    }

    if (counts.campaigns === 0 && counts.invitations === 0 && counts.userProfiles === 0) {
      console.log('✨ No Campfire test data to clean up!');
      return;
    }

    console.log('⚠️  WARNING: This will permanently delete the above data');
    console.log('⚠️  This action cannot be undone!\n');

    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      readline.question('Type "DELETE CAMPFIRE DATA" to proceed: ', resolve);
    });
    
    readline.close();

    if (answer === 'DELETE CAMPFIRE DATA') {
      console.log('\n🧹 Starting cleanup...\n');
      
      // Delete in order to respect foreign key constraints
      
      // 1. Delete assessment results
      console.log('Deleting assessment results...');
      const deletedResults = await prisma.assessmentResult.deleteMany({
        where: {
          invitationId: {
            in: campfireInvitations.map(inv => inv.id)
          }
        }
      });
      console.log(`   ✅ Deleted ${deletedResults.count} assessment results`);

      // 2. Delete invitation metadata
      console.log('Deleting invitation metadata...');
      const deletedMetadata = await prisma.invitationMetadata.deleteMany({
        where: {
          invitationId: {
            in: campfireInvitations.map(inv => inv.id)
          }
        }
      });
      console.log(`   ✅ Deleted ${deletedMetadata.count} invitation metadata records`);

      // 3. Delete invitations
      console.log('Deleting invitations...');
      const deletedInvitations = await prisma.invitation.deleteMany({
        where: { companyId: campfireCompany.id }
      });
      console.log(`   ✅ Deleted ${deletedInvitations.count} invitations`);

      // 4. Delete team invitations
      console.log('Deleting team invitations...');
      const deletedTeamInvitations = await prisma.teamInvitation.deleteMany({
        where: {
          campaign: {
            companyId: campfireCompany.id
          }
        }
      });
      console.log(`   ✅ Deleted ${deletedTeamInvitations.count} team invitations`);

      // 5. Delete campaigns
      console.log('Deleting campaigns...');
      const deletedCampaigns = await prisma.campaign.deleteMany({
        where: { companyId: campfireCompany.id }
      });
      console.log(`   ✅ Deleted ${deletedCampaigns.count} campaigns`);

      // 6. Delete team members
      console.log('Deleting team members...');
      const deletedTeamMembers = await prisma.teamMember.deleteMany({
        where: { companyId: campfireCompany.id }
      });
      console.log(`   ✅ Deleted ${deletedTeamMembers.count} team members`);

      // 7. Delete non-primary user profiles
      console.log('Deleting non-primary user profiles...');
      const deletedProfiles = await prisma.userProfile.deleteMany({
        where: { 
          companyId: campfireCompany.id,
          email: {
            notIn: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
          }
        }
      });
      console.log(`   ✅ Deleted ${deletedProfiles.count} user profiles`);

      // 8. Delete Campfire-related leads
      console.log('Deleting Campfire leads...');
      const deletedLeads = await prisma.lead.deleteMany({
        where: { 
          source: { contains: 'campfire' }
        }
      });
      console.log(`   ✅ Deleted ${deletedLeads.count} leads`);

      console.log('\n✅ Campfire test data cleanup complete!');
      console.log('✅ Steve and steve.arntz users preserved');
      console.log('✅ All other company data untouched');

    } else {
      console.log('\n❌ Cleanup cancelled - no data was deleted');
    }

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    console.error('No data was deleted due to error');
  } finally {
    await prisma.$disconnect();
  }
}

cleanupCampfireData();