import prisma from '../src/lib/prisma';

async function check() {
  const campaign = await prisma.campaign.findFirst();
  if (campaign) {
    const metadata = JSON.parse(campaign.description);
    console.log('Campaign metadata:', metadata);
    console.log('Tool path:', metadata.toolPath);
    console.log('Campaign link:', metadata.campaignLink);
  }
  await prisma.$disconnect();
}

check();