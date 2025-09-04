// Test script to verify production database connection and saving

import { PrismaClient } from '@prisma/client'

async function testProductionConnection() {
  console.log('🔍 Testing Production Database Connection\n')
  console.log('='.repeat(60) + '\n')
  
  // Test with the production pooler URL
  const prodPoolerUrl = 'postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
  
  console.log('Testing with Production Pooler URL...\n')
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: prodPoolerUrl
      }
    }
  })
  
  try {
    // 1. Test connection
    await prisma.$connect()
    console.log('✅ Connected to production database\n')
    
    // 2. Check existing data
    const companies = await prisma.company.count()
    const users = await prisma.userProfile.count()
    console.log(`📊 Current data:`)
    console.log(`   Companies: ${companies}`)
    console.log(`   User Profiles: ${users}\n`)
    
    // 3. Try to update a user profile (simulate what the app does)
    const testUser = await prisma.userProfile.findFirst({
      where: { email: 'steve@getcampfire.com' }
    })
    
    if (testUser) {
      console.log('Found test user:', testUser.email)
      console.log('Current team name:', testUser.teamName)
      
      // Try updating
      const updated = await prisma.userProfile.update({
        where: { id: testUser.id },
        data: {
          teamName: `Leadership - Test ${new Date().toISOString().slice(11, 19)}`
        }
      })
      
      console.log('✅ Successfully updated team name to:', updated.teamName)
      
      // Revert the change
      await prisma.userProfile.update({
        where: { id: testUser.id },
        data: {
          teamName: 'Leadership'
        }
      })
      console.log('✅ Reverted team name back to: Leadership')
    }
    
    console.log('\n✅ Production database is working correctly!')
    console.log('\n📝 Make sure Vercel has these environment variables:')
    console.log('   DATABASE_URL=' + prodPoolerUrl)
    console.log('   DIRECT_URL=postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require')
    
  } catch (error) {
    console.error('❌ Error:', error)
    console.log('\n🔧 This might mean:')
    console.log('1. The DATABASE_URL in Vercel is pointing to the wrong database')
    console.log('2. The connection string is incorrect')
    console.log('3. There\'s a permission issue')
  } finally {
    await prisma.$disconnect()
  }
}

testProductionConnection()