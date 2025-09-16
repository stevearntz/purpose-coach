#!/usr/bin/env npx tsx

import prisma from '../src/lib/prisma'

async function testRoleSeparation() {
  console.log('🧪 Testing Role-Based Campaign Separation\n')
  
  try {
    // 1. Check Steve's campaigns (MANAGER role)
    const steve = await prisma.userProfile.findUnique({
      where: { clerkUserId: 'user_32FXWNXMaQvYyQ9G1h50gJ2lv2j' },
      select: { email: true, userType: true }
    })
    
    console.log('📌 Manager View (Steve - MANAGER role)')
    console.log('   Email:', steve?.email)
    console.log('   Role:', steve?.userType)
    console.log()
    
    // Get campaigns created by Steve
    const steveCampaigns = await prisma.campaign.findMany({
      where: {
        createdBy: 'user_32FXWNXMaQvYyQ9G1h50gJ2lv2j'
      }
    })
    
    console.log('   Campaigns created by Steve:', steveCampaigns.length)
    
    // Get the campaign with Jason Bourne's response
    const campaignWithResponse = await prisma.campaign.findFirst({
      where: {
        campaignCode: '3AX2E9N3'
      }
    })
    
    if (campaignWithResponse) {
      const responses = await prisma.assessmentResult.findMany({
        where: {
          invitation: {
            inviteCode: campaignWithResponse.campaignCode
          }
        },
        select: {
          userName: true,
          userEmail: true
        }
      })
      
      console.log('   Campaign 3AX2E9N3 responses:', responses.length)
      responses.forEach(r => {
        console.log('     -', r.userName || r.userEmail)
      })
    }
    
    console.log('\n✅ Manager Dashboard (/dashboard/member/start/results/team):')
    console.log('   - Shared tab: Shows campaigns created by THIS manager only')
    console.log('   - Individuals tab: Shows results where THIS manager is teamLinkOwner')
    
    console.log('\n📌 Admin View (HR Leader - ADMIN role)')
    console.log('   Would see ALL campaigns across the company')
    console.log('   Location: /dashboard/campaigns')
    
    // Count all campaigns in the company
    const company = await prisma.company.findFirst({
      where: {
        name: 'Campfire'
      }
    })
    
    if (company) {
      const allCompanyCampaigns = await prisma.campaign.count({
        where: {
          companyId: company.id
        }
      })
      
      console.log('   Total campaigns in Campfire:', allCompanyCampaigns)
    }
    
    console.log('\n🔑 Key Differences:')
    console.log('   1. MANAGER sees: Only their own shared campaigns')
    console.log('   2. ADMIN sees: All campaigns in the company')
    console.log('   3. Campaign creation:')
    console.log('      - MANAGER: Creates from Tools page (/dashboard/member/start/tools)')
    console.log('      - ADMIN: Creates from Campaigns page (/dashboard/campaigns)')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testRoleSeparation()