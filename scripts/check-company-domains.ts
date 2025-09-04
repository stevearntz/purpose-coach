import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCompanyDomains() {
  console.log('🔍 Checking Company Domain Configuration...\n')
  
  try {
    // Get the Campfire company
    const company = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    })
    
    if (!company) {
      console.log('❌ Campfire company not found!')
      return
    }
    
    console.log('Company Details:')
    console.log('----------------')
    console.log('Name:', company.name)
    console.log('Database ID:', company.id)
    console.log('Clerk Org ID:', company.clerkOrgId)
    console.log('Domains:', company.domains)
    console.log('')
    
    if (!company.domains || company.domains.length === 0) {
      console.log('⚠️  No domains configured!')
      console.log('🔧 Fixing: Adding @getcampfire.com domain...')
      
      // Update the company with the domain
      const updated = await prisma.company.update({
        where: { id: company.id },
        data: {
          domains: ['@getcampfire.com']
        }
      })
      
      console.log('✅ Domain added successfully!')
      console.log('New domains:', updated.domains)
    } else if (!company.domains.includes('@getcampfire.com')) {
      console.log('⚠️  @getcampfire.com not in domains list!')
      console.log('Current domains:', company.domains)
      console.log('🔧 Fixing: Adding @getcampfire.com to domains...')
      
      const updated = await prisma.company.update({
        where: { id: company.id },
        data: {
          domains: [...company.domains, '@getcampfire.com']
        }
      })
      
      console.log('✅ Domain added successfully!')
      console.log('New domains:', updated.domains)
    } else {
      console.log('✅ Domain configuration is correct!')
    }
    
    // Check if Clerk Org ID matches what's in our seed script
    if (company.clerkOrgId !== 'org_2pBUImmF4DZLqiDSUkQJOBFVDVX') {
      console.log('\n⚠️  WARNING: Clerk Org ID mismatch!')
      console.log('Database has:', company.clerkOrgId)
      console.log('Seed script expects: org_2pBUImmF4DZLqiDSUkQJOBFVDVX')
      console.log('\nThis might cause authentication issues!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkCompanyDomains()