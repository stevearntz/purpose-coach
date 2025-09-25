#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserType() {
  console.log('🔍 Checking steve user profiles...\n');

  try {
    const users = await prisma.userProfile.findMany({
      where: {
        email: {
          in: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
        }
      }
    });

    for (const user of users) {
      console.log(`👤 User: ${user.email}`);
      console.log(`   Clerk ID: ${user.clerkUserId}`);
      console.log(`   User Type: ${user.userType}`);
      console.log(`   Company ID: ${user.companyId}`);
      console.log('');
    }

    // Check who created the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        campaignCode: '_t701nJ_l2'
      }
    });

    if (campaign) {
      console.log(`📊 Campaign "Needs Assessment - 9/25/2025"`);
      console.log(`   Created By: ${campaign.createdBy}`);
      console.log(`   Campaign Type: ${campaign.campaignType}`);
      
      // Match creator to user
      const creator = users.find(u => u.clerkUserId === campaign.createdBy);
      if (creator) {
        console.log(`   Creator Email: ${creator.email}`);
        console.log(`   Creator User Type: ${creator.userType}`);
        console.log(`\n⚠️  Campaign was created as ${campaign.campaignType} because user type is ${creator.userType}`);
        
        if (creator.userType !== 'ADMIN') {
          console.log('\n❌ PROBLEM: User should be ADMIN but is set to', creator.userType);
          console.log('   This is why campaigns are being created as TEAM_SHARE instead of HR_CAMPAIGN');
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserType();