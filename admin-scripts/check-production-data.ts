#!/usr/bin/env npx tsx
/**
 * Check what data exists in production
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkData() {
  console.log('🔍 Checking production data...')
  console.log('=' .repeat(60))
  
  try {
    // Count invitations
    const invitations = await prisma.invitation.count()
    const invitationsList = await prisma.invitation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n📧 Invitations: ${invitations} total`)
    if (invitationsList.length > 0) {
      console.log('Recent invitations:')
      invitationsList.forEach(inv => {
        console.log(`  - ${inv.email} (${inv.status})`)
      })
    }
    
    // Count campaigns
    const campaigns = await prisma.campaign.count()
    const campaignsList = await prisma.campaign.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    
    console.log(`\n🎯 Campaigns: ${campaigns} total`)
    if (campaignsList.length > 0) {
      console.log('Recent campaigns:')
      campaignsList.forEach(camp => {
        console.log(`  - ${camp.name} (${camp.status})`)
      })
    }
    
    // Count companies
    const companies = await prisma.company.count()
    const companiesList = await prisma.company.findMany()
    
    console.log(`\n🏢 Companies: ${companies} total`)
    companiesList.forEach(comp => {
      console.log(`  - ${comp.name} (ID: ${comp.id})`)
    })
    
    // Count admins
    const admins = await prisma.admin.count()
    const adminsList = await prisma.admin.findMany()
    
    console.log(`\n👤 Admins: ${admins} total`)
    adminsList.forEach(admin => {
      console.log(`  - ${admin.email} (Company: ${admin.companyId})`)
    })
    
    // Check assessment results
    const results = await prisma.assessmentResult.count()
    console.log(`\n📊 Assessment Results: ${results} total`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkData()