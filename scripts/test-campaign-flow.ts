#!/usr/bin/env npx tsx

import prisma from '../src/lib/prisma'

async function testCampaignFlow() {
  console.log('🧪 Testing Campaign Flow...\n')
  
  try {
    // 1. Check if we have the test campaign
    const campaign = await prisma.campaign.findFirst({
      where: {
        campaignCode: 'E9MCY4LZ'
      },
      include: {
        company: true
      }
    })
    
    if (!campaign) {
      console.log('❌ Test campaign E9MCY4LZ not found')
      return
    }
    
    console.log('✅ Found campaign:', {
      code: campaign.campaignCode,
      name: campaign.name,
      tool: campaign.toolName,
      company: campaign.company.name,
      createdBy: campaign.createdBy
    })
    
    // 2. Check if invitation exists with campaign code
    const invitation = await prisma.invitation.findFirst({
      where: {
        inviteCode: campaign.campaignCode
      },
      include: {
        metadata: true
      }
    })
    
    if (!invitation) {
      console.log('\n⚠️  No invitation found with campaign code - creating one...')
      
      // Create the invitation
      const newInvitation = await prisma.invitation.create({
        data: {
          email: `campaign-${campaign.campaignCode}@team.local`,
          name: `Campaign: ${campaign.toolName}`,
          inviteCode: campaign.campaignCode,
          inviteUrl: campaign.campaignLink || '',
          status: 'SENT',
          companyId: campaign.companyId,
          metadata: {
            create: {
              isGenericLink: true,
              role: 'Team Member'
            }
          }
        },
        include: {
          metadata: true
        }
      })
      
      console.log('✅ Created invitation:', {
        id: newInvitation.id,
        inviteCode: newInvitation.inviteCode,
        isGeneric: newInvitation.metadata?.isGenericLink
      })
    } else {
      console.log('\n✅ Invitation exists:', {
        id: invitation.id,
        inviteCode: invitation.inviteCode,
        isGeneric: invitation.metadata?.isGenericLink,
        status: invitation.status
      })
    }
    
    // 3. Check for assessment results linked to this campaign
    const results = await prisma.assessmentResult.findMany({
      where: {
        invitation: {
          inviteCode: campaign.campaignCode
        }
      },
      select: {
        id: true,
        userName: true,
        userEmail: true,
        completedAt: true,
        toolName: true
      }
    })
    
    console.log('\n📊 Assessment Results:')
    if (results.length > 0) {
      results.forEach(result => {
        console.log(`  - ${result.userName || result.userEmail || 'Anonymous'} completed ${result.toolName} at ${result.completedAt}`)
      })
    } else {
      console.log('  No results yet')
    }
    
    // 4. Display the share link
    console.log('\n🔗 Share Link:')
    console.log(`  ${campaign.campaignLink}`)
    console.log('\n💡 Users can complete assessments using this link')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testCampaignFlow()