/**
 * Script to flush all test campaigns from the database
 * Run with: npx tsx admin-scripts/flush-test-campaigns.ts
 */

import prisma from '@/lib/prisma'

async function flushTestCampaigns() {
  console.log('🧹 Starting campaign cleanup...\n')
  
  try {
    // First, get all campaigns to show what we're deleting
    const campaigns = await prisma.campaign.findMany({
      include: {
        company: true
      }
    })
    
    if (campaigns.length === 0) {
      console.log('✨ No campaigns found in database')
      return
    }
    
    console.log(`Found ${campaigns.length} campaign(s):`)
    campaigns.forEach(campaign => {
      console.log(`  - ${campaign.name} (Company: ${campaign.company.name}, Created: ${campaign.createdAt.toLocaleDateString()})`)
    })
    
    // Delete all invitations first (due to foreign key constraints)
    const invitationCount = await prisma.invitation.count()
    if (invitationCount > 0) {
      console.log(`\n🗑️  Deleting ${invitationCount} invitation(s)...`)
      await prisma.invitation.deleteMany({})
      console.log('✅ Invitations deleted')
    }
    
    // Delete all campaigns
    console.log(`\n🗑️  Deleting ${campaigns.length} campaign(s)...`)
    await prisma.campaign.deleteMany({})
    console.log('✅ Campaigns deleted')
    
    // Optional: Clean up companies that have no campaigns
    const companiesWithoutCampaigns = await prisma.company.findMany({
      where: {
        campaigns: {
          none: {}
        }
      }
    })
    
    if (companiesWithoutCampaigns.length > 0) {
      console.log(`\n🗑️  Found ${companiesWithoutCampaigns.length} orphaned company record(s)`)
      companiesWithoutCampaigns.forEach(company => {
        console.log(`  - ${company.name}`)
      })
      
      console.log('Deleting orphaned companies...')
      await prisma.company.deleteMany({
        where: {
          id: {
            in: companiesWithoutCampaigns.map(c => c.id)
          }
        }
      })
      console.log('✅ Orphaned companies deleted')
    }
    
    console.log('\n✨ Database cleanup complete!')
    
    // Show final counts
    const finalCampaigns = await prisma.campaign.count()
    const finalInvitations = await prisma.invitation.count()
    const finalCompanies = await prisma.company.count()
    
    console.log('\n📊 Final database state:')
    console.log(`  - Campaigns: ${finalCampaigns}`)
    console.log(`  - Invitations: ${finalInvitations}`)
    console.log(`  - Companies: ${finalCompanies}`)
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
flushTestCampaigns()