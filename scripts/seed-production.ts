import { PrismaClient } from '@prisma/client'

// Use the PRODUCTION database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
})

async function seedProduction() {
  console.log('🌱 Seeding PRODUCTION database...\n')
  
  try {
    // Create Campfire company
    const company = await prisma.company.upsert({
      where: { 
        clerkOrgId: 'org_31IuAOPrNHNfhSHyWeUFjIccpeK'
      },
      update: {
        domains: ['getcampfire.com', '@getcampfire.com']
      },
      create: {
        name: 'Campfire',
        clerkOrgId: 'org_31IuAOPrNHNfhSHyWeUFjIccpeK',
        domains: ['getcampfire.com', '@getcampfire.com']
      }
    })
    
    console.log('✅ Company created/updated:', company.name)
    console.log('   ID:', company.id)
    console.log('   Clerk Org ID:', company.clerkOrgId)
    
    // Create your user profile with the CORRECT Clerk user ID
    const user = await prisma.userProfile.upsert({
      where: { 
        email: 'steve@getcampfire.com'
      },
      update: {
        clerkUserId: 'user_31I4733XAJ8QAWh5cw2OASaP6qt',
        companyId: company.id,
        teamName: 'Leadership',
        teamPurpose: 'Build amazing tools for teams',
        teamEmoji: '🔥'
      },
      create: {
        email: 'steve@getcampfire.com',
        clerkUserId: 'user_31I4733XAJ8QAWh5cw2OASaP6qt',
        firstName: 'Steve',
        lastName: 'Arntz',
        role: 'CEO',
        department: 'Leadership',
        teamName: 'Leadership',
        teamPurpose: 'Build amazing tools for teams',
        teamEmoji: '🔥',
        teamSize: '1-5',
        companyId: company.id,
        onboardingComplete: true,
        clerkRole: 'admin'
      }
    })
    
    console.log('\n✅ User created/updated:', user.email)
    console.log('   Clerk User ID:', user.clerkUserId)
    console.log('   Team Name:', user.teamName)
    console.log('   Team Purpose:', user.teamPurpose)
    console.log('   Company ID:', user.companyId)
    
    // Also handle steve.arntz@getcampfire.com if it exists in Clerk
    const user2 = await prisma.userProfile.upsert({
      where: { 
        email: 'steve.arntz@getcampfire.com'
      },
      update: {
        clerkUserId: 'user_32FXWNXMaQvYyQ9G1h50gJ2lv2j',
        companyId: company.id
      },
      create: {
        email: 'steve.arntz@getcampfire.com',
        clerkUserId: 'user_32FXWNXMaQvYyQ9G1h50gJ2lv2j',
        firstName: 'Steve',
        lastName: 'Arntz',
        companyId: company.id,
        onboardingComplete: false
      }
    })
    
    console.log('\n✅ Second user created/updated:', user2.email)
    console.log('   Clerk User ID:', user2.clerkUserId)
    
    console.log('\n✨ Production database seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProduction()