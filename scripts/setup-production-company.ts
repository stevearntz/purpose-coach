#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function setupProductionCompany() {
  // Production Clerk IDs from the debug endpoint
  const PROD_USER_ID = 'user_31KdiOPzKz43HxDkuBx7brxvQUk'
  const PROD_ORG_ID = 'org_31KdjD9RIauvRC0OQ29HiOiXQPC'
  const USER_EMAIL = 'steve.arntz@getcampfire.com' // Your email
  
  try {
    console.log('Setting up production company and user...\n')
    
    // 1. First check if a company with this name exists
    let company = await prisma.company.findUnique({
      where: { name: 'Campfire' }
    })
    
    if (company) {
      console.log('Found existing company, updating Clerk Org ID...')
      company = await prisma.company.update({
        where: { id: company.id },
        data: {
          clerkOrgId: PROD_ORG_ID,
        }
      })
    } else {
      console.log('Creating new company...')
      company = await prisma.company.create({
        data: {
          name: 'Campfire',
          clerkOrgId: PROD_ORG_ID,
          domains: ['getcampfire.com'],
        }
      })
    }
    
    console.log('✅ Company created/updated:')
    console.log('   - Name:', company.name)
    console.log('   - ID:', company.id)
    console.log('   - Clerk Org ID:', company.clerkOrgId)
    
    // 2. Check if profile exists by email first
    let userProfile = await prisma.userProfile.findUnique({
      where: { email: USER_EMAIL }
    })
    
    if (userProfile) {
      console.log('Found existing profile by email, updating Clerk User ID...')
      userProfile = await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: {
          clerkUserId: PROD_USER_ID,
          companyId: company.id,
          onboardingComplete: true,
        }
      })
    } else {
      // Check if profile exists by clerkUserId
      userProfile = await prisma.userProfile.findUnique({
        where: { clerkUserId: PROD_USER_ID }
      })
      
      if (userProfile) {
        console.log('Found existing profile by Clerk ID, updating...')
        userProfile = await prisma.userProfile.update({
          where: { id: userProfile.id },
          data: {
            email: USER_EMAIL,
            companyId: company.id,
            firstName: 'Steve',
            lastName: 'Arntz',
            onboardingComplete: true,
          }
        })
      } else {
        console.log('Creating new user profile...')
        userProfile = await prisma.userProfile.create({
          data: {
            clerkUserId: PROD_USER_ID,
            email: USER_EMAIL,
            companyId: company.id,
            firstName: 'Steve',
            lastName: 'Arntz',
            role: 'CEO',
            department: 'Executive',
            onboardingComplete: true,
            clerkRole: 'admin',
          }
        })
      }
    }
    
    console.log('\n✅ UserProfile created/updated:')
    console.log('   - Email:', userProfile.email)
    console.log('   - ID:', userProfile.id)
    console.log('   - Clerk User ID:', userProfile.clerkUserId)
    console.log('   - Company ID:', userProfile.companyId)
    
    console.log('\n✅ Setup complete! Your production account is now linked to the company.')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check if we're running against production database
const DATABASE_URL = process.env.DATABASE_URL || ''
if (!DATABASE_URL.includes('supabase.co') && !DATABASE_URL.includes('neon.tech')) {
  console.log('⚠️  WARNING: This doesn\'t look like a production database URL.')
  console.log('   Current DATABASE_URL:', DATABASE_URL.substring(0, 50) + '...')
  console.log('\n   To run against production, use:')
  console.log('   DATABASE_URL="your-production-url" npx tsx scripts/setup-production-company.ts')
  process.exit(1)
}

setupProductionCompany()