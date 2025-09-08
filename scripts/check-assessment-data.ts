#!/usr/bin/env npx tsx
import prisma from '@/lib/prisma';

async function checkAssessmentData() {
  console.log('Checking assessment data in database...\n');
  
  // Check invitations with completed status
  const completedInvitations = await prisma.invitation.findMany({
    where: { status: 'COMPLETED' },
    include: {
      assessmentResults: true
    }
  });
  
  console.log(`Found ${completedInvitations.length} completed invitations`);
  
  completedInvitations.forEach(inv => {
    console.log(`\nInvitation for ${inv.email}:`);
    console.log(`  - ID: ${inv.id}`);
    console.log(`  - Completed at: ${inv.completedAt}`);
    console.log(`  - Assessment results: ${inv.assessmentResults.length}`);
    if (inv.assessmentResults.length > 0) {
      inv.assessmentResults.forEach(result => {
        console.log(`    - Result ID: ${result.id}, Tool: ${result.toolName}`);
      });
    }
  });
  
  // Check all assessment results
  const allResults = await prisma.assessmentResult.findMany({
    select: {
      id: true,
      toolName: true,
      invitationId: true,
      createdAt: true
    }
  });
  
  console.log(`\n\nTotal assessment results in database: ${allResults.length}`);
  
  // Check for orphaned results (no invitation)
  const orphanedResults = allResults.filter(r => !r.invitationId);
  console.log(`Orphaned results (no invitation): ${orphanedResults.length}`);
  
  // Check campaigns
  const campaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      name: true,
      status: true
    }
  });
  
  console.log(`\nCampaigns in database: ${campaigns.length}`);
  campaigns.forEach(c => {
    console.log(`  - ${c.name} (${c.status})`);
  });
  
  // Get company data for context
  const companies = await prisma.company.findMany({
    select: {
      name: true,
      id: true
    }
  });
  
  console.log(`\nCompanies:`);
  companies.forEach(c => {
    console.log(`  - ${c.name} (${c.id})`);
  });
}

checkAssessmentData()
  .catch(console.error)
  .finally(() => prisma.$disconnect());