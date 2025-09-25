#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupDuplicateCampaigns() {
  console.log('🔍 Analyzing campaigns for cleanup...\n');

  try {
    // Get all active campaigns
    const campaigns = await prisma.campaign.findMany({
      where: {
        status: 'ACTIVE'
      },
      include: {
        company: true,
        invitations: {
          select: {
            status: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${campaigns.length} active campaigns\n`);

    // Group campaigns by tool, company, and participants
    const campaignGroups = {};
    
    for (const campaign of campaigns) {
      const key = `${campaign.toolId}_${campaign.companyId}_${campaign.participants.sort().join(',')}`;
      
      if (!campaignGroups[key]) {
        campaignGroups[key] = [];
      }
      
      campaignGroups[key].push(campaign);
    }

    // Find groups with duplicates
    let totalToDeactivate = 0;
    const campaignsToDeactivate = [];

    for (const [key, group] of Object.entries(campaignGroups)) {
      if (group.length > 1) {
        console.log(`\n📊 Found ${group.length} similar campaigns:`);
        console.log(`   Tool: ${group[0].toolName || group[0].toolId}`);
        console.log(`   Company: ${group[0].company.name}`);
        console.log(`   Participants: ${group[0].participants.length} users\n`);
        
        // Sort by date - keep the newest one
        group.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        for (let i = 0; i < group.length; i++) {
          const campaign = group[i];
          const hasCompletions = campaign.invitations.some(inv => inv.status === 'COMPLETED');
          
          console.log(`   ${i + 1}. Campaign "${campaign.name}"`);
          console.log(`      Created: ${campaign.createdAt.toLocaleDateString()}`);
          console.log(`      Code: ${campaign.campaignCode}`);
          console.log(`      Completions: ${campaign.invitations.filter(inv => inv.status === 'COMPLETED').length}`);
          
          // Keep the first one (newest) OR any with completions
          if (i === 0 || hasCompletions) {
            console.log(`      ✅ KEEP (${i === 0 ? 'newest' : 'has completions'})`);
          } else {
            console.log(`      ❌ DEACTIVATE (older duplicate)`);
            campaignsToDeactivate.push(campaign.id);
            totalToDeactivate++;
          }
        }
      }
    }

    if (totalToDeactivate === 0) {
      console.log('\n✨ No duplicate campaigns found that need cleanup!');
      return;
    }

    console.log(`\n⚠️  Ready to deactivate ${totalToDeactivate} duplicate campaigns`);
    console.log('This will set their status to COMPLETED to hide them from users.\n');

    // Ask for confirmation
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise((resolve) => {
      readline.question('Proceed with cleanup? (yes/no): ', resolve);
    });
    
    readline.close();

    if (answer.toLowerCase() === 'yes') {
      console.log('\n🧹 Cleaning up duplicate campaigns...');
      
      const result = await prisma.campaign.updateMany({
        where: {
          id: {
            in: campaignsToDeactivate
          }
        },
        data: {
          status: 'COMPLETED',
          endDate: new Date() // Mark as ended now
        }
      });

      console.log(`✅ Successfully deactivated ${result.count} campaigns!\n`);
    } else {
      console.log('\n❌ Cleanup cancelled');
    }

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateCampaigns();