#!/usr/bin/env npx tsx
import prisma from '@/lib/prisma';

async function fixInvitationUrls() {
  console.log('Fixing invitation URLs in database...');
  
  // Get the environment-specific base URL
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://tools.getcampfire.com';
  console.log(`Using base URL: ${baseUrl}`);
  
  // Find all invitations with localhost URLs
  const invitationsToFix = await prisma.invitation.findMany({
    where: {
      OR: [
        { inviteUrl: { contains: 'localhost' } },
        { inviteUrl: { contains: 'http://localhost' } }
      ]
    }
  });
  
  console.log(`Found ${invitationsToFix.length} invitations with localhost URLs`);
  
  // Update each invitation
  for (const invitation of invitationsToFix) {
    const oldUrl = invitation.inviteUrl;
    
    // Replace localhost URL with production URL
    const newUrl = oldUrl
      ?.replace('http://localhost:3000', baseUrl)
      ?.replace('localhost:3000', baseUrl);
    
    if (newUrl && newUrl !== oldUrl) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { inviteUrl: newUrl }
      });
      
      console.log(`Fixed invitation for ${invitation.email}:`);
      console.log(`  Old: ${oldUrl}`);
      console.log(`  New: ${newUrl}`);
    }
  }
  
  console.log('Done fixing invitation URLs!');
  
  // Show current state
  const allInvitations = await prisma.invitation.findMany({
    select: {
      email: true,
      inviteUrl: true,
      status: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });
  
  console.log('\nRecent invitations:');
  allInvitations.forEach(inv => {
    console.log(`- ${inv.email}: ${inv.status} - ${inv.inviteUrl}`);
  });
}

fixInvitationUrls()
  .catch(console.error)
  .finally(() => prisma.$disconnect());