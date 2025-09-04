import { prisma } from '../src/lib/prisma'

async function cleanupDatabase() {
  console.log('Starting database cleanup...')
  
  try {
    // Find the user and company we want to keep
    const keepUser = await prisma.userProfile.findFirst({
      where: { email: 'steve@getcampfire.com' }
    })
    
    const keepCompany = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    })
    
    if (!keepUser) {
      console.log('Admin user steve@getcampfire.com not found')
      return
    }
    
    if (!keepCompany) {
      console.log('Company Campfire not found')
      return
    }
    
    console.log(`Keeping User ID: ${keepUser.id}`)
    console.log(`Keeping Company ID: ${keepCompany.id}`)
    
    // Delete in correct order to avoid foreign key constraints
    
    // 1. Delete TeamMemberships
    const deletedMemberships = await prisma.teamMembership.deleteMany({
      where: {
        NOT: {
          teamOwnerId: keepUser.id
        }
      }
    })
    console.log(`Deleted ${deletedMemberships.count} team memberships`)
    
    // 2. Delete TeamMembers
    const deletedTeamMembers = await prisma.teamMember.deleteMany({
      where: {
        NOT: {
          managerId: keepUser.id
        }
      }
    })
    console.log(`Deleted ${deletedTeamMembers.count} team members`)
    
    // 3. Delete AssessmentResults (keeping those where userEmail matches admin)
    const deletedAssessments = await prisma.assessmentResult.deleteMany({
      where: {
        NOT: {
          userEmail: keepUser.email
        }
      }
    })
    console.log(`Deleted ${deletedAssessments.count} assessment results`)
    
    // 4. Delete Campaigns
    const deletedCampaigns = await prisma.campaign.deleteMany({
      where: {
        NOT: {
          companyId: keepCompany.id
        }
      }
    })
    console.log(`Deleted ${deletedCampaigns.count} campaigns`)
    
    // 5. Delete all TeamInvitations
    const deletedInvitations = await prisma.teamInvitation.deleteMany({})
    console.log(`Deleted ${deletedInvitations.count} team invitations`)
    
    // 6. Delete all Leads
    const deletedLeads = await prisma.lead.deleteMany({})
    console.log(`Deleted ${deletedLeads.count} leads`)
    
    // 7. Delete all InvitationMetadata
    const deletedMetadata = await prisma.invitationMetadata.deleteMany({})
    console.log(`Deleted ${deletedMetadata.count} invitation metadata`)
    
    // 8. Delete all Invitations
    const deletedInvites = await prisma.invitation.deleteMany({})
    console.log(`Deleted ${deletedInvites.count} invitations`)
    
    // 9. Delete other UserProfiles
    const deletedUsers = await prisma.userProfile.deleteMany({
      where: {
        NOT: {
          id: keepUser.id
        }
      }
    })
    console.log(`Deleted ${deletedUsers.count} user profiles`)
    
    // 10. Delete other Companies
    const deletedCompanies = await prisma.company.deleteMany({
      where: {
        NOT: {
          id: keepCompany.id
        }
      }
    })
    console.log(`Deleted ${deletedCompanies.count} companies`)
    
    // Verify what remains
    const remainingUsers = await prisma.userProfile.count()
    const remainingCompanies = await prisma.company.count()
    const remainingTeamMembers = await prisma.teamMember.count()
    const remainingAssessments = await prisma.assessmentResult.count()
    
    console.log('\n--- Remaining Data ---')
    console.log(`Users: ${remainingUsers}`)
    console.log(`Companies: ${remainingCompanies}`)
    console.log(`Team Members: ${remainingTeamMembers}`)
    console.log(`Assessment Results: ${remainingAssessments}`)
    
    console.log('\nDatabase cleanup completed successfully!')
    
  } catch (error) {
    console.error('Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDatabase()