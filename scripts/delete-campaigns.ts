import { prisma } from '../src/lib/prisma'

async function deleteCampaigns() {
  const deleted = await prisma.campaign.deleteMany({})
  console.log(`Deleted ${deleted.count} campaigns`)
  
  const remaining = await prisma.campaign.count()
  console.log(`Campaigns remaining: ${remaining}`)
  
  await prisma.$disconnect()
}

deleteCampaigns()