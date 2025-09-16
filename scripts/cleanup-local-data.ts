import prisma from '../src/lib/prisma'

async function cleanupLocalData() {
  console.log('🧹 Starting local data cleanup...\n')
  console.log('Preserving users: steve@getcampfire.com and steve.arntz@getcampfire.com\n')
  
  try {
    // Find the user profiles to preserve
    const preservedProfiles = await prisma.userProfile.findMany({
      where: {
        email: {
          in: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
        }
      }
    })
    
    const preservedProfileIds = preservedProfiles.map(p => p.id)
    const preservedClerkIds = preservedProfiles.map(p => p.clerkUserId).filter(Boolean) as string[]
    
    console.log(`Found ${preservedProfiles.length} profiles to preserve:`)
    preservedProfiles.forEach(p => {
      console.log(`  - ${p.email} (${p.id})`)
    })
    console.log()
    
    // Delete test team members (including the one we just created)
    console.log('Deleting test team members...')
    const deletedMembers = await prisma.teamMember.deleteMany({
      where: {
        OR: [
          { email: { contains: 'test.member' } },
          { email: { contains: 'example.com' } },
          { email: { contains: 'steve.arntz+' } }, // Test emails with +
          { name: { contains: 'Test' } },
          { name: 'Willy  Wonka' } // The test entry from earlier
        ]
      }
    })
    console.log(`  ✓ Deleted ${deletedMembers.count} test team members`)
    
    // Delete assessment results (except for preserved users)
    console.log('\nDeleting assessment results...')
    const deletedResults = await prisma.assessmentResult.deleteMany({
      where: {
        NOT: {
          userEmail: {
            in: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
          }
        }
      }
    })
    console.log(`  ✓ Deleted ${deletedResults.count} assessment results`)
    
    // Delete invitations (except for preserved users)
    console.log('\nDeleting invitations...')
    const deletedInvitations = await prisma.invitation.deleteMany({
      where: {
        NOT: {
          email: {
            in: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
          }
        }
      }
    })
    console.log(`  ✓ Deleted ${deletedInvitations.count} invitations`)
    
    // Delete campaigns created by non-preserved users
    console.log('\nDeleting campaigns...')
    const deletedCampaigns = await prisma.campaign.deleteMany({
      where: {
        NOT: {
          createdBy: {
            in: preservedClerkIds
          }
        }
      }
    })
    console.log(`  ✓ Deleted ${deletedCampaigns.count} campaigns`)
    
    // Delete user profiles (except preserved ones)
    console.log('\nDeleting other user profiles...')
    const deletedProfiles = await prisma.userProfile.deleteMany({
      where: {
        NOT: {
          id: {
            in: preservedProfileIds
          }
        }
      }
    })
    console.log(`  ✓ Deleted ${deletedProfiles.count} user profiles`)
    
    // Clean up orphaned team memberships
    console.log('\nCleaning up orphaned team memberships...')
    // Since TeamMember cascade deletes TeamMembership, we just need to clean up any remaining ones
    const deletedMemberships = await prisma.teamMembership.deleteMany({
      where: {
        NOT: {
          teamOwnerId: {
            in: preservedProfileIds
          }
        }
      }
    })
    console.log(`  ✓ Deleted ${deletedMemberships.count} team memberships`)
    
    // Show what remains
    console.log('\n📊 Remaining data summary:')
    const remainingProfiles = await prisma.userProfile.count()
    const remainingCampaigns = await prisma.campaign.count()
    const remainingResults = await prisma.assessmentResult.count()
    const remainingMembers = await prisma.teamMember.count()
    const remainingInvitations = await prisma.invitation.count()
    
    console.log(`  - User Profiles: ${remainingProfiles}`)
    console.log(`  - Campaigns: ${remainingCampaigns}`)
    console.log(`  - Assessment Results: ${remainingResults}`)
    console.log(`  - Team Members: ${remainingMembers}`)
    console.log(`  - Invitations: ${remainingInvitations}`)
    
    // Show preserved users' data
    console.log('\n✅ Preserved users data:')
    for (const profile of preservedProfiles) {
      console.log(`\n${profile.email}:`)
      
      const campaigns = await prisma.campaign.count({
        where: { createdBy: profile.clerkUserId }
      })
      
      const results = await prisma.assessmentResult.count({
        where: { userEmail: profile.email }
      })
      
      const teamMembers = await prisma.teamMember.count({
        where: { managerId: profile.id }
      })
      
      console.log(`  - Campaigns: ${campaigns}`)
      console.log(`  - Assessment Results: ${results}`)
      console.log(`  - Team Members: ${teamMembers}`)
    }
    
    console.log('\n🎉 Cleanup complete!')
    
  } catch (error) {
    console.error('Error during cleanup:', error)
    throw error
  }
}

cleanupLocalData()
  .catch(console.error)
  .finally(() => prisma.$disconnect())