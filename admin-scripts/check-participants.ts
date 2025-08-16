/**
 * Script to check participants in the database
 * Run with: npx tsx admin-scripts/check-participants.ts
 */

import prisma from '@/lib/prisma'

async function checkParticipants() {
  console.log('🔍 Checking database for participants...\n')
  
  try {
    // Check invitations (these are the participants)
    const invitations = await prisma.invitation.findMany({
      include: {
        company: true
      }
    })
    
    console.log(`Found ${invitations.length} invitation(s) (participants):`)
    if (invitations.length > 0) {
      invitations.forEach(inv => {
        console.log(`  - ${inv.name} (${inv.email})`)
        console.log(`    Status: ${inv.status}, Company: ${inv.company?.name || 'None'}`)
        console.log(`    Created: ${inv.createdAt.toLocaleDateString()}`)
      })
    }
    
    // Check companies
    const companies = await prisma.company.findMany()
    console.log(`\nFound ${companies.length} company record(s):`)
    companies.forEach(company => {
      console.log(`  - ${company.name}`)
    })
    
    // Check campaigns
    const campaigns = await prisma.campaign.findMany()
    console.log(`\nFound ${campaigns.length} campaign(s):`)
    campaigns.forEach(campaign => {
      console.log(`  - ${campaign.name}`)
    })
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
checkParticipants()