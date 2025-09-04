import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixUserIdMismatch() {
  console.log('🔧 Fixing User ID Mismatch\n')
  console.log('='.repeat(60) + '\n')
  
  try {
    // Fix the steve@getcampfire.com profile
    const result = await prisma.userProfile.update({
      where: {
        email: 'steve@getcampfire.com'
      },
      data: {
        clerkUserId: 'user_31I4733XAJ8QAWh5cw2OASaP6qt'
      }
    })
    
    console.log('✅ Updated profile for steve@getcampfire.com')
    console.log(`   Old Clerk ID: user_2pBTlsP5fJ6I3r9YoVJ9zRgHXCn`)
    console.log(`   New Clerk ID: user_31I4733XAJ8QAWh5cw2OASaP6qt`)
    console.log(`   Team Name: ${result.teamName}`)
    console.log(`   Team Purpose: ${result.teamPurpose}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixUserIdMismatch()