#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSteveAdmin() {
  console.log('🔧 Fixing steve user types to ADMIN...\n');

  try {
    // Update both steve accounts to ADMIN
    const result = await prisma.userProfile.updateMany({
      where: {
        email: {
          in: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
        }
      },
      data: {
        userType: 'ADMIN'
      }
    });

    console.log(`✅ Updated ${result.count} users to ADMIN type`);

    // Also fix the existing campaign to HR_CAMPAIGN
    const campaignUpdate = await prisma.campaign.updateMany({
      where: {
        campaignCode: '_t701nJ_l2'
      },
      data: {
        campaignType: 'HR_CAMPAIGN'
      }
    });

    console.log(`✅ Updated ${campaignUpdate.count} campaign(s) from TEAM_SHARE to HR_CAMPAIGN`);

    // Verify the changes
    const users = await prisma.userProfile.findMany({
      where: {
        email: {
          in: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
        }
      },
      select: {
        email: true,
        userType: true
      }
    });

    console.log('\n📊 Verification:');
    for (const user of users) {
      console.log(`   ${user.email}: ${user.userType}`);
    }

    console.log('\n✅ Steve accounts are now properly set as ADMIN');
    console.log('✅ Campaign has been converted to HR_CAMPAIGN');
    console.log('✅ Future campaigns will be created as HR_CAMPAIGN and show in the admin dashboard');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSteveAdmin();