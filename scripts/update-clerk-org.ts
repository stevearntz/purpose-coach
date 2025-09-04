import { prisma } from '../src/lib/prisma'

async function updateClerkOrgId() {
  const oldOrgId = 'org_31KdjD9RIauvRC0OQ29HiOiXQPC'
  const newOrgId = 'org_31IuAOPrNHNfhSHyWeUFjIccpeK'
  
  console.log('Updating Clerk Organization ID...')
  console.log('Old:', oldOrgId)
  console.log('New:', newOrgId)
  
  const updated = await prisma.company.update({
    where: { 
      name: 'Campfire' 
    },
    data: { 
      clerkOrgId: newOrgId 
    }
  })
  
  console.log('\nUpdated Company:')
  console.log('ID:', updated.id)
  console.log('Name:', updated.name)
  console.log('New Clerk Org ID:', updated.clerkOrgId)
  
  await prisma.$disconnect()
}

updateClerkOrgId()