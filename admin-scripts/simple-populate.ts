#!/usr/bin/env npx tsx
/**
 * Simple data population for production
 * This creates just enough data to make the dashboard look populated
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function populate() {
  console.log('🚀 Populating sample data...')
  
  try {
    // Get company and admin
    const company = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    })
    
    const admin = await prisma.admin.findFirst({
      where: { email: 'steve@getcampfire.com' }
    })
    
    if (!company || !admin) {
      console.error('❌ Company or admin not found')
      return
    }
    
    console.log('Creating invitations...')
    
    // Create a few simple invitations
    const statuses = ['PENDING', 'SENT', 'OPENED', 'STARTED', 'COMPLETED'] as const
    
    for (let i = 1; i <= 10; i++) {
      const status = statuses[Math.min(i - 1, 4)]
      
      await prisma.invitation.create({
        data: {
          email: `user${i}@example.com`,
          name: `Test User ${i}`,
          inviteCode: `code${i}`,
          inviteUrl: `https://tools.getcampfire.com/start?code=code${i}`,
          status: status,
          companyId: company.id,
          adminId: admin.id
        }
      }).catch(e => console.log(`Skipping invitation ${i}:`, e.message))
    }
    
    console.log('Creating campaigns...')
    
    // Create a couple campaigns
    await prisma.campaign.create({
      data: {
        name: 'Q1 2024 Culture Assessment',
        description: 'Quarterly culture check-in',
        status: 'ACTIVE',
        companyId: company.id
      }
    }).catch(e => console.log('Skipping campaign 1:', e.message))
    
    await prisma.campaign.create({
      data: {
        name: 'Leadership Development',
        description: 'Leadership skills assessment',
        status: 'COMPLETED',
        companyId: company.id
      }
    }).catch(e => console.log('Skipping campaign 2:', e.message))
    
    console.log('✅ Done! Check your dashboard at https://tools.getcampfire.com/dashboard')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

populate()