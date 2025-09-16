#!/usr/bin/env npx tsx
import prisma from '../src/lib/prisma'

async function resetLocalDatabase() {
  console.log('🧹 Starting local database cleanup...')
  
  try {
    // Get the steve@getcampfire.com user profiles
    const steveProfiles = await prisma.userProfile.findMany({
      where: {
        OR: [
          { email: 'steve@getcampfire.com' },
          { email: 'steve.arntz@getcampfire.com' },
          { email: 'stephen@getcampfire.com' }
        ]
      }
    })
    
    if (steveProfiles.length === 0) {
      console.log('❌ Could not find steve@getcampfire.com user profiles')
      return
    }
    
    const profileIds = steveProfiles.map(p => p.id)
    const emails = steveProfiles.map(p => p.email)
    console.log(`✅ Found ${steveProfiles.length} Steve profile(s):`, emails.join(', '))
    
    // Delete all assessment results except Steve's (based on email)
    console.log('\n🗑️  Cleaning up assessment results...')
    const deletedResults = await prisma.assessmentResult.deleteMany({
      where: {
        userEmail: {
          notIn: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com', 'stephen@getcampfire.com']
        }
      }
    })
    console.log(`   Deleted ${deletedResults.count} assessment results`)
    
    // Delete all team members (since these are separate from UserProfile)
    console.log('\n🗑️  Cleaning up team members...')
    const deletedTeamMembers = await prisma.teamMember.deleteMany({})
    console.log(`   Deleted ${deletedTeamMembers.count} team members`)
    
    // Delete all campaigns
    console.log('\n🗑️  Cleaning up campaigns...')
    const deletedCampaigns = await prisma.campaign.deleteMany({})
    console.log(`   Deleted ${deletedCampaigns.count} campaigns`)
    
    // Delete all invitations
    console.log('\n🗑️  Cleaning up invitations...')
    const deletedInvitations = await prisma.invitation.deleteMany({})
    console.log(`   Deleted ${deletedInvitations.count} invitations`)
    
    // Delete all user profiles except Steve's
    console.log('\n🗑️  Cleaning up other user profiles...')
    const deletedProfiles = await prisma.userProfile.deleteMany({
      where: {
        id: {
          notIn: profileIds
        }
      }
    })
    console.log(`   Deleted ${deletedProfiles.count} other user profiles`)
    
    // Reset Steve's profiles to clean state
    console.log('\n🔄 Resetting Steve\'s profiles to clean state...')
    for (const profile of steveProfiles) {
      await prisma.userProfile.update({
        where: { id: profile.id },
        data: {
          teamName: 'Campfire Leadership',
          teamPurpose: 'Build and grow Campfire',
          teamEmoji: '💪',
          teamSize: '5',
          onboardingComplete: true,
          // Keep other essential fields as they are
        }
      })
    }
    console.log('   Profiles reset complete')
    
    // Show final state
    console.log('\n📊 Final database state:')
    const finalProfiles = await prisma.userProfile.count()
    const finalResults = await prisma.assessmentResult.count()
    const finalTeamMembers = await prisma.teamMember.count()
    const finalCampaigns = await prisma.campaign.count()
    const finalInvitations = await prisma.invitation.count()
    const finalCompanies = await prisma.company.count()
    
    console.log(`   Companies: ${finalCompanies}`)
    console.log(`   User Profiles: ${finalProfiles}`)
    console.log(`   Assessment Results: ${finalResults}`)
    console.log(`   Team Members: ${finalTeamMembers}`)
    console.log(`   Campaigns: ${finalCampaigns}`)
    console.log(`   Invitations: ${finalInvitations}`)
    
    console.log('\n✨ Local database cleanup complete!')
    console.log('   Your local environment now has a clean slate with just steve@getcampfire.com and steve.arntz@getcampfire.com')
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetLocalDatabase().catch(console.error)