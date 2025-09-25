#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActiveCampaigns() {
  console.log('🔍 Checking active campaigns in production...\n');

  try {
    // Get ALL campaigns with ACTIVE status
    const allActiveCampaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${allActiveCampaigns.length} total ACTIVE campaigns:\n`);

    for (const campaign of allActiveCampaigns) {
      console.log(`📊 Campaign: "${campaign.name}"`);
      console.log(`   ID: ${campaign.id}`);
      console.log(`   Company: ${campaign.company.name}`);
      console.log(`   Type: ${campaign.campaignType}`);
      console.log(`   Created By: ${campaign.createdBy || 'unknown'}`);
      console.log(`   Tool: ${campaign.toolName || campaign.toolId}`);
      console.log(`   Participants: ${campaign.participants.length}`);
      console.log(`   Created: ${campaign.createdAt.toLocaleDateString()}`);
      console.log(`   Start Date: ${campaign.startDate ? campaign.startDate.toLocaleDateString() : 'Not set'}`);
      console.log(`   End Date: ${campaign.endDate ? campaign.endDate.toLocaleDateString() : 'Not set'}`);
      console.log(`   Campaign Code: ${campaign.campaignCode || 'None'}`);
      console.log('');
    }

    // Check Campfire-specific campaigns
    const campfireCompany = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    });

    if (campfireCompany) {
      const campfireCampaigns = allActiveCampaigns.filter(c => c.companyId === campfireCompany.id);
      console.log(`\n✅ Campfire has ${campfireCampaigns.length} active campaigns`);
      
      if (campfireCampaigns.length > 0) {
        console.log('\nCampfire campaigns that should be showing:');
        for (const campaign of campfireCampaigns) {
          console.log(`  - "${campaign.name}" (Type: ${campaign.campaignType})`);
        }
      }
    }

    // Check for HR_CAMPAIGN vs TEAM_SHARE
    const hrCampaigns = allActiveCampaigns.filter(c => c.campaignType === 'HR_CAMPAIGN');
    const teamShares = allActiveCampaigns.filter(c => c.campaignType === 'TEAM_SHARE');
    
    console.log(`\n📈 Campaign Types:`);
    console.log(`   HR_CAMPAIGN: ${hrCampaigns.length}`);
    console.log(`   TEAM_SHARE: ${teamShares.length}`);

  } catch (error) {
    console.error('Error checking campaigns:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkActiveCampaigns();