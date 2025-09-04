import { prisma } from '../src/lib/prisma'

async function checkCompany() {
  const company = await prisma.company.findFirst({
    where: { name: 'Campfire' }
  })
  
  console.log('Campfire company details:')
  console.log('ID:', company?.id)
  console.log('Name:', company?.name)
  console.log('Clerk Org ID:', company?.clerkOrgId)
  console.log('Domains:', company?.domains)
  
  const user = await prisma.userProfile.findFirst({
    where: { email: 'steve@getcampfire.com' }
  })
  
  console.log('\nUser details:')
  console.log('ID:', user?.id)
  console.log('Email:', user?.email)
  console.log('Company ID:', user?.companyId)
  console.log('Clerk User ID:', user?.clerkUserId)
  
  await prisma.$disconnect()
}

checkCompany()