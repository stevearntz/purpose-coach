import prisma from '../src/lib/prisma'

async function cleanDatabase() {
  console.log('🧹 Starting database cleanup...\n')
  
  try {
    // First, get the Campfire company ID to preserve it
    const campfire = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    })
    
    // Delete in correct order to respect foreign key constraints
    
    // 1. Delete all assessment results
    const deletedResults = await prisma.assessmentResult.deleteMany()
    console.log(`✅ Deleted ${deletedResults.count} assessment results`)
    
    // 2. Delete all campaigns
    const deletedCampaigns = await prisma.campaign.deleteMany()
    console.log(`✅ Deleted ${deletedCampaigns.count} campaigns`)
    
    // 3. Delete all invitation metadata
    const deletedInvitationMetadata = await prisma.invitationMetadata.deleteMany()
    console.log(`✅ Deleted ${deletedInvitationMetadata.count} invitation metadata records`)
    
    // 4. Delete all invitations
    const deletedInvitations = await prisma.invitation.deleteMany()
    console.log(`✅ Deleted ${deletedInvitations.count} invitations`)
    
    // 5. Delete all admins except those associated with Campfire
    if (campfire) {
      const deletedAdmins = await prisma.admin.deleteMany({
        where: {
          companyId: {
            not: campfire.id
          }
        }
      })
      console.log(`✅ Deleted ${deletedAdmins.count} test admins`)
    } else {
      // If no Campfire company, delete all admins
      const deletedAdmins = await prisma.admin.deleteMany()
      console.log(`✅ Deleted ${deletedAdmins.count} admins (no Campfire company found)`)
    }
    
    // 6. Finally, delete all companies except Campfire
    const deletedCompanies = await prisma.company.deleteMany({
      where: {
        NOT: {
          name: 'Campfire'
        }
      }
    })
    console.log(`✅ Deleted ${deletedCompanies.count} test companies`)
    
    // Show what remains
    console.log('\n📊 Database status after cleanup:')
    const remainingCompanies = await prisma.company.count()
    const remainingAdmins = await prisma.admin.count()
    const remainingCampaigns = await prisma.campaign.count()
    const remainingResults = await prisma.assessmentResult.count()
    const remainingInvitations = await prisma.invitation.count()
    
    console.log(`  Companies: ${remainingCompanies}`)
    console.log(`  Admins: ${remainingAdmins}`)
    console.log(`  Campaigns: ${remainingCampaigns}`)
    console.log(`  Assessment Results: ${remainingResults}`)
    console.log(`  Invitations: ${remainingInvitations}`)
    
    // List remaining companies
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            admins: true
          }
        }
      }
    })
    
    if (companies.length > 0) {
      console.log('\n📋 Remaining companies:')
      companies.forEach(c => {
        console.log(`  - ${c.name} (ID: ${c.id}, Admins: ${c._count.admins})`)
      })
    }
    
    console.log('\n✨ Database cleanup complete!')
    console.log('💡 Note: You may also want to clear user metadata in Clerk Dashboard')
    
  } catch (error) {
    console.error('❌ Error cleaning database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanDatabase()