import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
})

async function checkProductionProfile() {
  console.log('🔍 Checking Production Profile Data\n')
  console.log('='.repeat(60) + '\n')
  
  try {
    // Check stephen.arntz profile
    const profile = await prisma.userProfile.findUnique({
      where: {
        clerkUserId: 'user_31y27JmtHQKk9kCH3ThPsRwcz86'  // Stephen's Clerk ID
      },
      include: {
        company: true
      }
    })
    
    if (profile) {
      console.log('✅ Found profile by Clerk ID:')
      console.log(`   Email: ${profile.email}`)
      console.log(`   Name: ${profile.firstName} ${profile.lastName}`)
      console.log(`   Clerk User ID: ${profile.clerkUserId}`)
      console.log(`   Role: ${profile.role}`)
      console.log(`   Department: ${profile.department}`)
      console.log(`   Team Name: ${profile.teamName}`)
      console.log(`   Team Purpose: ${profile.teamPurpose}`)
      console.log(`   Team Emoji: ${profile.teamEmoji}`)
      console.log(`   Company ID: ${profile.companyId}`)
      console.log(`   Company Name: ${profile.company?.name || 'NOT LOADED'}`)
      console.log(`   Onboarding Complete: ${profile.onboardingComplete}`)
    } else {
      console.log('❌ No profile found for Clerk ID: user_31y27JmtHQKk9kCH3ThPsRwcz86')
    }
    
    console.log('\n📝 This is exactly what the API should return when you visit the profile page.')
    console.log('If the company is showing here but not on the page, it might be a frontend issue.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionProfile()