import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUserProfile() {
  console.log('🔍 Checking User Profile Data\n')
  console.log('='.repeat(60) + '\n')
  
  try {
    // 1. Find all users
    const users = await prisma.userProfile.findMany({
      include: {
        company: true
      }
    })
    
    console.log(`📊 Found ${users.length} user(s) in database:\n`)
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. User: ${user.email}`)
      console.log(`   Database ID: ${user.id}`)
      console.log(`   Clerk User ID: ${user.clerkUserId}`)
      console.log(`   Name: ${user.firstName} ${user.lastName}`)
      console.log(`   Company: ${user.company?.name || 'None'} (ID: ${user.companyId || 'None'})`)
      console.log(`   Team Name: ${user.teamName || 'Not set'}`)
      console.log(`   Team Purpose: ${user.teamPurpose || 'Not set'}`)
      console.log(`   Team Emoji: ${user.teamEmoji || 'Not set'}`)
      console.log(`   Team Size: ${user.teamSize || 'Not set'}`)
      console.log(`   Role: ${user.role || 'Not set'}`)
      console.log(`   Department: ${user.department || 'Not set'}`)
      console.log(`   Clerk Role: ${user.clerkRole || 'Not set'}`)
      console.log(`   Onboarding Complete: ${user.onboardingComplete}`)
      console.log(`   Created: ${user.createdAt}`)
      console.log(`   Updated: ${user.updatedAt}`)
      console.log('')
    })
    
    // 2. Check for orphaned profiles (no company)
    const orphanedProfiles = users.filter(u => !u.companyId)
    if (orphanedProfiles.length > 0) {
      console.log('⚠️  Orphaned Profiles (no company):')
      orphanedProfiles.forEach(u => {
        console.log(`   - ${u.email}`)
      })
      console.log('')
    }
    
    // 3. Check for potential ID mismatches
    console.log('🔍 Checking for ID Pattern Issues:\n')
    
    users.forEach(user => {
      if (user.clerkUserId && !user.clerkUserId.startsWith('user_')) {
        console.log(`❌ Invalid Clerk User ID format for ${user.email}: ${user.clerkUserId}`)
      }
    })
    
    // 4. Check companies
    console.log('🏢 Companies in Database:\n')
    const companies = await prisma.company.findMany()
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`)
      console.log(`   Database ID: ${company.id}`)
      console.log(`   Clerk Org ID: ${company.clerkOrgId || 'Not set'}`)
      console.log('')
    })
    
    // 5. Check for the specific user having issues
    console.log('🎯 Specific User Check (steve.arntz@getcampfire.com):\n')
    const steve = await prisma.userProfile.findFirst({
      where: { 
        OR: [
          { email: 'steve.arntz@getcampfire.com' },
          { email: 'steve@getcampfire.com' }
        ]
      },
      include: {
        company: true
      }
    })
    
    if (steve) {
      console.log('Found user:')
      console.log(`   Email: ${steve.email}`)
      console.log(`   Has Company Link: ${steve.companyId ? 'Yes' : 'No'}`)
      console.log(`   Company Name: ${steve.company?.name || 'None'}`)
      console.log(`   Profile Data:`)
      console.log(`   - Team Name: ${steve.teamName || 'MISSING'}`)
      console.log(`   - Team Purpose: ${steve.teamPurpose || 'MISSING'}`)
      console.log(`   - First Name: ${steve.firstName || 'MISSING'}`)
      console.log(`   - Last Name: ${steve.lastName || 'MISSING'}`)
      
      if (!steve.companyId) {
        console.log('\n❌ ISSUE FOUND: User has no company ID!')
        console.log('   This would cause foreign key issues and prevent data from saving/loading')
      }
    } else {
      console.log('❌ User not found in database!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserProfile()