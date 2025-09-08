#!/usr/bin/env npx tsx
import prisma from '@/lib/prisma';

async function cleanupInvitations() {
  console.log('Cleaning up invitation data...\n');
  
  // Find completed invitations with no assessment results
  const completedInvitations = await prisma.invitation.findMany({
    where: { status: 'COMPLETED' },
    include: {
      assessmentResults: true
    }
  });
  
  const emptyInvitations = completedInvitations.filter(inv => inv.assessmentResults.length === 0);
  
  console.log(`Found ${completedInvitations.length} completed invitations`);
  console.log(`${emptyInvitations.length} have no assessment results\n`);
  
  if (emptyInvitations.length > 0) {
    console.log('Invitations with no results that will be reset to PENDING:');
    emptyInvitations.forEach(inv => {
      console.log(`  - ${inv.email} (completed: ${inv.completedAt})`);
    });
    
    // Reset these invitations to PENDING since they have no actual results
    const updateResult = await prisma.invitation.updateMany({
      where: {
        id: {
          in: emptyInvitations.map(inv => inv.id)
        }
      },
      data: {
        status: 'PENDING',
        completedAt: null
      }
    });
    
    console.log(`\nReset ${updateResult.count} invitations to PENDING status`);
  }
  
  // Clean up the campaign if needed
  const campaigns = await prisma.campaign.findMany();
  console.log(`\nFound ${campaigns.length} campaigns`);
  
  // Show final state
  const finalCompleted = await prisma.invitation.findMany({
    where: { status: 'COMPLETED' },
    include: {
      assessmentResults: true
    }
  });
  
  console.log(`\nFinal state:`);
  console.log(`  - Completed invitations with results: ${finalCompleted.filter(inv => inv.assessmentResults.length > 0).length}`);
  console.log(`  - Completed invitations without results: ${finalCompleted.filter(inv => inv.assessmentResults.length === 0).length}`);
  
  const allResults = await prisma.assessmentResult.count();
  console.log(`  - Total assessment results: ${allResults}`);
}

cleanupInvitations()
  .catch(console.error)
  .finally(() => prisma.$disconnect());