import prisma from '../src/lib/prisma'

async function main() {
  console.log('Checking campaigns in database...\n')
  
  const campaigns = await prisma.campaign.findMany({
    select: {
      id: true,
      name: true,
      participants: true,
      toolName: true,
      toolPath: true,
      toolId: true,
      status: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log('Total campaigns:', campaigns.length)
  if (campaigns.length === 0) {
    console.log('No campaigns found!')
  } else {
    campaigns.forEach(c => {
      console.log('\nCampaign:', c.name)
      console.log('  Status:', c.status)
      console.log('  Tool:', c.toolName, '/', c.toolId)
      console.log('  Path:', c.toolPath)
      console.log('  Participants:', c.participants)
      console.log('  Created:', c.createdAt)
    })
  }
  
  // Also check if steve.arntz@getcampfire.com has any campaigns
  console.log('\n\nChecking campaigns for steve.arntz@getcampfire.com:')
  const userCampaigns = await prisma.campaign.findMany({
    where: {
      participants: {
        has: 'steve.arntz@getcampfire.com'
      },
      status: 'ACTIVE'
    }
  })
  
  console.log('Found', userCampaigns.length, 'active campaigns for steve.arntz@getcampfire.com')
  
  await prisma.$disconnect()
}

main()