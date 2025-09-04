import { prisma } from '../src/lib/prisma'

async function finalCleanup() {
  console.log('Final database cleanup...')
  
  try {
    // Delete ALL team members (user can recreate them later)
    const deletedTeamMembers = await prisma.teamMember.deleteMany({})
    console.log(`Deleted ${deletedTeamMembers.count} team members`)
    
    // Delete ALL team memberships
    const deletedMemberships = await prisma.teamMembership.deleteMany({})
    console.log(`Deleted ${deletedMemberships.count} team memberships`)
    
    // Verify final counts
    const counts = await Promise.all([
      prisma.userProfile.count(),
      prisma.company.count(),
      prisma.teamMember.count(),
      prisma.assessmentResult.count(),
      prisma.lead.count(),
      prisma.invitation.count(),
      prisma.campaign.count()
    ])
    
    console.log('\n--- Final Database State ---')
    console.log(`Users: ${counts[0]} (should be 1)`)
    console.log(`Companies: ${counts[1]} (should be 1)`)
    console.log(`Team Members: ${counts[2]} (should be 0)`)
    console.log(`Assessment Results: ${counts[3]} (should be 0)`)
    console.log(`Leads: ${counts[4]} (should be 0)`)
    console.log(`Invitations: ${counts[5]} (should be 0)`)
    console.log(`Campaigns: ${counts[6]} (should be 0)`)
    
    // Show the remaining user and company
    const user = await prisma.userProfile.findFirst()
    const company = await prisma.company.findFirst()
    
    console.log('\n--- Remaining Records ---')
    console.log('User:', user?.email, `(${user?.id})`)
    console.log('Company:', company?.name, `(${company?.id})`)
    
    console.log('\n✅ Database cleaned successfully!')
    
  } catch (error) {
    console.error('Error during final cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

finalCleanup()