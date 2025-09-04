import { PrismaClient } from '@prisma/client'
import { clerkClient } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

async function checkUserIdMismatch() {
  console.log('🔍 Checking for User ID Mismatches\n')
  console.log('='.repeat(60) + '\n')
  
  try {
    // 1. Get all users from Clerk
    const client = await clerkClient()
    const clerkUsers = await client.users.getUserList({ limit: 100 })
    
    console.log(`📊 Found ${clerkUsers.totalCount} users in Clerk\n`)
    
    // 2. Get all profiles from database
    const dbProfiles = await prisma.userProfile.findMany({
      include: {
        company: true
      }
    })
    
    console.log(`📊 Found ${dbProfiles.length} profiles in database\n`)
    
    // 3. Check for mismatches
    console.log('🔄 Checking for ID mismatches:\n')
    
    for (const clerkUser of clerkUsers.data) {
      const email = clerkUser.emailAddresses[0]?.emailAddress
      if (!email) continue
      
      console.log(`\n📧 User: ${email}`)
      console.log(`   Clerk User ID: ${clerkUser.id}`)
      
      // Find in database by email
      const dbProfileByEmail = dbProfiles.find(p => p.email === email)
      // Find in database by clerkUserId
      const dbProfileByClerkId = dbProfiles.find(p => p.clerkUserId === clerkUser.id)
      
      if (dbProfileByEmail && dbProfileByClerkId) {
        if (dbProfileByEmail.id === dbProfileByClerkId.id) {
          console.log(`   ✅ Database profile matches correctly`)
          console.log(`   DB Profile ID: ${dbProfileByEmail.id}`)
          console.log(`   Team Name: ${dbProfileByEmail.teamName || 'Not set'}`)
          console.log(`   Team Purpose: ${dbProfileByEmail.teamPurpose || 'Not set'}`)
        } else {
          console.log(`   ⚠️  DUPLICATE: Profile exists with both email and clerkUserId but different records!`)
          console.log(`   By Email: ${dbProfileByEmail.id}`)
          console.log(`   By Clerk ID: ${dbProfileByClerkId.id}`)
        }
      } else if (dbProfileByEmail && !dbProfileByClerkId) {
        console.log(`   ⚠️  MISMATCH: Profile exists by email but has different clerkUserId`)
        console.log(`   DB Profile ID: ${dbProfileByEmail.id}`)
        console.log(`   DB Stored Clerk ID: ${dbProfileByEmail.clerkUserId}`)
        console.log(`   Actual Clerk ID: ${clerkUser.id}`)
        console.log(`   Team Name: ${dbProfileByEmail.teamName || 'Not set'}`)
        console.log(`   Team Purpose: ${dbProfileByEmail.teamPurpose || 'Not set'}`)
        
        // This is the issue - the profile exists but with wrong Clerk ID
        console.log(`   🔧 FIX NEEDED: Update clerkUserId from ${dbProfileByEmail.clerkUserId} to ${clerkUser.id}`)
      } else if (!dbProfileByEmail && dbProfileByClerkId) {
        console.log(`   ⚠️  EMAIL MISMATCH: Profile exists by clerkUserId but has different email`)
        console.log(`   DB Email: ${dbProfileByClerkId.email}`)
        console.log(`   Clerk Email: ${email}`)
      } else {
        console.log(`   ❌ No profile found in database`)
      }
    }
    
    // 4. Check for orphaned database profiles
    console.log('\n🔍 Checking for orphaned database profiles:\n')
    
    for (const dbProfile of dbProfiles) {
      const clerkUser = clerkUsers.data.find(u => 
        u.id === dbProfile.clerkUserId || 
        u.emailAddresses[0]?.emailAddress === dbProfile.email
      )
      
      if (!clerkUser) {
        console.log(`❌ Orphaned profile: ${dbProfile.email}`)
        console.log(`   DB ID: ${dbProfile.id}`)
        console.log(`   Stored Clerk ID: ${dbProfile.clerkUserId}`)
      }
    }
    
    // 5. Specific check for steve@getcampfire.com
    console.log('\n🎯 Specific Check for steve@getcampfire.com:\n')
    
    const steveClerk = clerkUsers.data.find(u => 
      u.emailAddresses[0]?.emailAddress === 'steve@getcampfire.com'
    )
    
    if (steveClerk) {
      console.log(`Clerk User ID: ${steveClerk.id}`)
      
      const steveDb = await prisma.userProfile.findFirst({
        where: {
          OR: [
            { email: 'steve@getcampfire.com' },
            { clerkUserId: steveClerk.id }
          ]
        }
      })
      
      if (steveDb) {
        console.log(`Database Profile:`)
        console.log(`   DB ID: ${steveDb.id}`)
        console.log(`   Stored Clerk ID: ${steveDb.clerkUserId}`)
        console.log(`   Match: ${steveDb.clerkUserId === steveClerk.id ? '✅ YES' : '❌ NO'}`)
        
        if (steveDb.clerkUserId !== steveClerk.id) {
          console.log(`\n🔧 To fix, run:`)
          console.log(`   UPDATE "UserProfile" SET "clerkUserId" = '${steveClerk.id}' WHERE email = 'steve@getcampfire.com';`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserIdMismatch()