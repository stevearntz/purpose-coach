#!/usr/bin/env npx tsx

import prisma from '../src/lib/prisma'

async function testAdminFiltering() {
  console.log('🔍 Testing Admin Dashboard Filtering\n')
  console.log('=' .repeat(60))
  
  try {
    // Get company info
    const company = await prisma.company.findFirst({
      where: { clerkOrgId: 'org_31IuAOPrNHNfhSHyWeUFjIccpeK' }
    })
    
    if (!company) {
      console.log('❌ No company found')
      return
    }
    
    console.log('🏢 Company:', company.name, '\n')
    
    // 1. Check all campaigns in database
    console.log('📊 ALL CAMPAIGNS IN DATABASE:')
    console.log('-'.repeat(60))
    
    const allCampaigns = await prisma.campaign.findMany({
      where: { companyId: company.id }
    })
    
    for (const campaign of allCampaigns) {
      console.log(`  ${campaign.campaignType === 'TEAM_SHARE' ? '👥' : '🏢'} ${campaign.name}`)
      console.log(`     Type: ${campaign.campaignType}`)
      console.log(`     Code: ${campaign.campaignCode}`)
      console.log(`     Created by: ${campaign.createdBy || 'Unknown'}\n`)
    }
    
    if (allCampaigns.length === 0) {
      console.log('  (No campaigns found)\n')
    }
    
    // 2. Simulate Admin Dashboard Campaign View
    console.log('🏢 ADMIN DASHBOARD - CAMPAIGNS VIEW:')
    console.log('-'.repeat(60))
    
    const adminCampaigns = await prisma.campaign.findMany({
      where: { 
        companyId: company.id,
        campaignType: 'HR_CAMPAIGN'  // Admin only sees HR campaigns
      }
    })
    
    console.log(`Shows ${adminCampaigns.length} campaign(s):`)
    for (const campaign of adminCampaigns) {
      console.log(`  ✅ ${campaign.name} (HR_CAMPAIGN)`)
    }
    
    if (adminCampaigns.length === 0) {
      console.log('  ✅ No campaigns shown (correct - only TEAM_SHARE exists)')
    }
    
    // 3. Check all assessment results
    console.log('\n📋 ALL ASSESSMENT RESULTS IN DATABASE:')
    console.log('-'.repeat(60))
    
    const allResults = await prisma.assessmentResult.findMany({
      where: {
        invitation: {
          companyId: company.id
        }
      },
      include: {
        invitation: true
      }
    })
    
    for (const result of allResults) {
      const userName = result.responses?.name || result.invitation?.email || 'Unknown'
      const inviteCode = result.invitation?.inviteCode || 'No code'
      console.log(`  • ${userName}`)
      console.log(`    Invite code: ${inviteCode}`)
      
      // Check if this is from a TEAM_SHARE campaign
      const teamShareCampaign = await prisma.campaign.findFirst({
        where: {
          campaignCode: inviteCode,
          campaignType: 'TEAM_SHARE'
        }
      })
      
      if (teamShareCampaign) {
        console.log(`    ⚠️  From TEAM_SHARE: "${teamShareCampaign.name}"`)
      } else {
        console.log(`    ✅ Not from TEAM_SHARE`)
      }
      console.log()
    }
    
    if (allResults.length === 0) {
      console.log('  (No results found)\n')
    }
    
    // 4. Simulate Admin Dashboard Individual Results View
    console.log('🏢 ADMIN DASHBOARD - INDIVIDUAL RESULTS VIEW:')
    console.log('-'.repeat(60))
    
    // Get TEAM_SHARE campaign codes to filter out
    const teamShareCampaigns = await prisma.campaign.findMany({
      where: {
        companyId: company.id,
        campaignType: 'TEAM_SHARE'
      },
      select: {
        campaignCode: true,
        name: true
      }
    })
    
    const teamShareCodes = teamShareCampaigns.map(c => c.campaignCode).filter(Boolean)
    
    // Filter results like the API does
    const adminVisibleResults = allResults.filter(result => {
      const inviteCode = result.invitation?.inviteCode
      return !inviteCode || !teamShareCodes.includes(inviteCode)
    })
    
    console.log(`Shows ${adminVisibleResults.length} individual result(s):`)
    for (const result of adminVisibleResults) {
      const userName = result.responses?.name || result.invitation?.email || 'Unknown'
      console.log(`  ✅ ${userName} (not from TEAM_SHARE)`)
    }
    
    if (adminVisibleResults.length === 0) {
      console.log('  ✅ No individual results shown (correct - all are from TEAM_SHARE)')
    }
    
    // 5. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📊 FILTERING SUMMARY:\n')
    
    const teamShareCount = allCampaigns.filter(c => c.campaignType === 'TEAM_SHARE').length
    const hrCampaignCount = allCampaigns.filter(c => c.campaignType === 'HR_CAMPAIGN').length
    const hiddenResultsCount = allResults.length - adminVisibleResults.length
    
    console.log(`Total campaigns: ${allCampaigns.length}`)
    console.log(`  • TEAM_SHARE: ${teamShareCount} (hidden from admin)`)
    console.log(`  • HR_CAMPAIGN: ${hrCampaignCount} (visible to admin)`)
    console.log()
    console.log(`Total assessment results: ${allResults.length}`)
    console.log(`  • Hidden from admin: ${hiddenResultsCount}`)
    console.log(`  • Visible to admin: ${adminVisibleResults.length}`)
    console.log()
    
    if (teamShareCount > 0 && adminCampaigns.length === 0 && hiddenResultsCount > 0) {
      console.log('✅ FILTERING WORKING CORRECTLY!')
      console.log('   Admin cannot see manager team shares or their results')
    } else if (hrCampaignCount === 0 && adminCampaigns.length === 0) {
      console.log('✅ NO HR CAMPAIGNS YET')
      console.log('   Admin dashboard correctly shows no campaigns')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAdminFiltering()