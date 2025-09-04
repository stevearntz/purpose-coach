import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
})

async function fixStephenProfile() {
  console.log('🔧 Fixing stephen.arntz profile\n')
  
  try {
    // Get the Campfire company
    const company = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    })
    
    if (!company) {
      throw new Error('Campfire company not found!')
    }
    
    // Update stephen.arntz profile to link to Campfire
    const updated = await prisma.userProfile.update({
      where: {
        email: 'steve.arntz@getcampfire.com'
      },
      data: {
        companyId: company.id
      }
    })
    
    console.log('✅ Fixed stephen.arntz@getcampfire.com profile:')
    console.log(`   Company ID set to: ${company.id}`)
    console.log(`   Company Name: ${company.name}`)
    console.log(`   Team Name: ${updated.teamName}`)
    console.log(`   Team Purpose: ${updated.teamPurpose}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixStephenProfile()