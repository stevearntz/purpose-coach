import prisma from '../src/lib/prisma';

async function linkInvitationToCampaign() {
  const campaign = await prisma.campaign.findFirst();
  if (!campaign) {
    console.log('No campaign found');
    return;
  }
  
  const metadata = JSON.parse(campaign.description);
  console.log('Campaign metadata:', metadata);
  
  const result = await prisma.invitation.updateMany({
    where: {
      email: 'me+john@stevearntz.com'
    },
    data: {
      inviteUrl: metadata.campaignLink
    }
  });
  
  console.log('Updated invitations:', result);
  
  const invitation = await prisma.invitation.findFirst({
    where: { email: 'me+john@stevearntz.com' }
  });
  console.log('Updated invitation:', invitation);
  
  await prisma.$disconnect();
}

linkInvitationToCampaign();