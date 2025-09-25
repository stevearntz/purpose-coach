#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupTestCampaign() {
  console.log('🧹 Cleaning up test campaign "Needs Assessment - 9/25/2025"...\n');

  try {
    // Find the campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        campaignCode: '_t701nJ_l2'
      }
    });

    if (!campaign) {
      console.log('❌ Campaign not found');
      return;
    }

    console.log(`Found campaign: ${campaign.name} (ID: ${campaign.id})\n`);

    // Delete all invitations linked to this campaign
    const invitations = await prisma.invitation.deleteMany({
      where: {
        campaignId: campaign.id
      }
    });
    console.log(`✅ Deleted ${invitations.count} invitations`);

    // Also delete any invitations that might have been created with campaign code as invite code
    const codeInvitations = await prisma.invitation.deleteMany({
      where: {
        inviteCode: campaign.campaignCode
      }
    });
    if (codeInvitations.count > 0) {
      console.log(`✅ Deleted ${codeInvitations.count} invitations with campaign code as invite code`);
    }

    // Delete the campaign itself
    const deletedCampaign = await prisma.campaign.delete({
      where: {
        id: campaign.id
      }
    });
    console.log(`✅ Deleted campaign: ${deletedCampaign.name}`);

    console.log('\n✨ Cleanup complete! Ready to test again with the fix.');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestCampaign();
