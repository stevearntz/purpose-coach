import { PrismaClient } from '@prisma/client'

// Production database
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
})

async function fixProductionClerkId() {
  console.log('🔧 Updating Production Clerk IDs\n')
  
  try {
    // Check current state
    const users = await prisma.userProfile.findMany()
    console.log('Current users in production:')
    users.forEach(u => {
      console.log(`  ${u.email}: ${u.clerkUserId}`)
    })
    
    // Update steve.arntz@getcampfire.com to match local Clerk ID
    const updated = await prisma.userProfile.update({
      where: { email: 'steve.arntz@getcampfire.com' },
      data: { 
        clerkUserId: 'user_32FXWNXMaQvYyQ9G1h50gJ2lv2j'  // Your local Clerk ID
      }
    })
    
    console.log('\n✅ Updated steve.arntz@getcampfire.com')
    console.log('   New Clerk ID:', updated.clerkUserId)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProductionClerkId()