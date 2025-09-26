#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupCampfireOnly() {
  console.log('🧹 Cleaning up all campaigns and assessments for Campfire company only...\n');

  try {
    // Find Campfire company
    const campfireCompany = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    });

    if (!campfireCompany) {
      console.log('❌ Campfire company not found');
      return;
    }

    console.log(`Found Campfire company: ${campfireCompany.name} (ID: ${campfireCompany.id})\n`);

    // Delete all campaigns for Campfire
    const campaigns = await prisma.campaign.deleteMany({
      where: {
        companyId: campfireCompany.id
      }
    });
    console.log(`✅ Deleted ${campaigns.count} campaigns`);

    // Delete all invitations for Campfire
    const invitations = await prisma.invitation.deleteMany({
      where: {
        companyId: campfireCompany.id
      }
    });
    console.log(`✅ Deleted ${invitations.count} invitations`);

    // Delete assessment results for Campfire
    // We'll also delete results by email domain to be thorough
    const assessmentResults = await prisma.assessmentResult.deleteMany({
      where: {
        userEmail: { endsWith: '@getcampfire.com' }
      }
    });
    console.log(`✅ Deleted ${assessmentResults.count} assessment results`);

    // Delete team members for Campfire users
    const teamMembers = await prisma.teamMember.deleteMany({
      where: {
        OR: [
          { email: { endsWith: '@getcampfire.com' } },
          {
            manager: {
              email: { endsWith: '@getcampfire.com' }
            }
          }
        ]
      }
    });
    console.log(`✅ Deleted ${teamMembers.count} team members`);

    // Delete team memberships
    const teamMemberships = await prisma.teamMembership.deleteMany({
      where: {
        OR: [
          {
            teamOwner: {
              email: { endsWith: '@getcampfire.com' }
            }
          },
          {
            teamMember: {
              email: { endsWith: '@getcampfire.com' }
            }
          }
        ]
      }
    });
    console.log(`✅ Deleted ${teamMemberships.count} team memberships`);

    console.log('\n✨ Cleanup complete!');
    console.log('   - All Campfire campaigns removed');
    console.log('   - All Campfire invitations removed');
    console.log('   - All Campfire assessment results removed');
    console.log('   - All Campfire team data cleaned');
    console.log('   - User profiles preserved (steve@getcampfire.com, steve.arntz@getcampfire.com)');
    console.log('   - Customer data untouched');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupCampfireOnly();
