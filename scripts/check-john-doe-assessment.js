#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkJohnDoeAssessment() {
  console.log('🔍 Checking for John Doe assessment results...\n');

  try {
    // Check all assessment results
    const allResults = await prisma.assessmentResult.findMany({
      where: {
        OR: [
          { userName: { contains: 'John', mode: 'insensitive' } },
          { userEmail: { contains: 'john', mode: 'insensitive' } }
        ]
      },
      include: {
        invitation: true
      }
    });

    console.log(`Found ${allResults.length} results potentially for John:\n`);
    
    for (const result of allResults) {
      console.log('📊 Assessment Result:');
      console.log(`   ID: ${result.id}`);
      console.log(`   Tool: ${result.toolName}`);
      console.log(`   User Name: ${result.userName}`);
      console.log(`   User Email: ${result.userEmail}`);
      console.log(`   Invitation ID: ${result.invitationId}`);
      console.log(`   Created: ${result.createdAt}`);
      console.log(`   Completed: ${result.completedAt}`);
      if (result.userProfile) {
        console.log(`   Profile Name: ${result.userProfile.name || 'N/A'}`);
        console.log(`   Profile Email: ${result.userProfile.email || 'N/A'}`);
      }
      if (result.invitation) {
        console.log(`   Invitation Email: ${result.invitation.email}`);
        console.log(`   Campaign ID: ${result.invitation.campaignId}`);
      }
      console.log('');
    }

    // Check invitations for John
    const invitations = await prisma.invitation.findMany({
      where: {
        OR: [
          { name: { contains: 'John' } },
          { email: { contains: 'john' } }
        ]
      },
      include: {
        campaign: true
      }
    });

    console.log(`\n📧 Found ${invitations.length} invitations for John:\n`);
    
    for (const inv of invitations) {
      console.log(`   Email: ${inv.email}`);
      console.log(`   Name: ${inv.name}`);
      console.log(`   Status: ${inv.status}`);
      console.log(`   Campaign: ${inv.campaign?.name || 'No campaign'}`);
      console.log(`   Campaign ID: ${inv.campaignId || 'None'}`);
      console.log('');
    }

    // Check recent assessment results
    const recentResults = await prisma.assessmentResult.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        invitation: true
      }
    });

    console.log(`\n📅 5 Most Recent Assessment Results:\n`);
    for (const result of recentResults) {
      console.log(`   ${result.userName || 'Unknown'} (${result.userEmail || 'No email'})`);
      console.log(`   Tool: ${result.toolName}`);
      console.log(`   Created: ${result.createdAt.toLocaleString()}`);
      console.log(`   Invitation Campaign ID: ${result.invitation?.campaignId || 'None'}`);
      console.log('');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkJohnDoeAssessment();
