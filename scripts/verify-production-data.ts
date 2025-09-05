#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProduction() {
  const PROD_USER_ID = 'user_31KdiOPzKz43HxDkuBx7brxvQUk'
  const PROD_ORG_ID = 'org_31KdjD9RIauvRC0OQ29HiOiXQPC'
  
  console.log('=== Verifying Production Data ===\n')
  
  try {
    // 1. Check Company by Clerk Org ID
    console.log(`1. Looking for Company with clerkOrgId: ${PROD_ORG_ID}`)
    const company = await prisma.company.findUnique({
      where: { clerkOrgId: PROD_ORG_ID }
    })
    
    if (company) {
      console.log('✅ Company found:')
      console.log('   - ID:', company.id)
      console.log('   - Name:', company.name)
      console.log('   - Clerk Org ID:', company.clerkOrgId)
    } else {
      console.log('❌ No company found with this Clerk Org ID')
      
      // Check if there's ANY company
      const allCompanies = await prisma.company.findMany()
      console.log(`\n   Total companies in database: ${allCompanies.length}`)
      allCompanies.forEach(c => {
        console.log(`   - ${c.name}: clerkOrgId = ${c.clerkOrgId}`)
      })
    }
    
    // 2. Check UserProfile by Clerk User ID
    console.log(`\n2. Looking for UserProfile with clerkUserId: ${PROD_USER_ID}`)
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: PROD_USER_ID },
      include: { company: true }
    })
    
    if (userProfile) {
      console.log('✅ UserProfile found:')
      console.log('   - ID:', userProfile.id)
      console.log('   - Email:', userProfile.email)
      console.log('   - Clerk User ID:', userProfile.clerkUserId)
      console.log('   - Company ID:', userProfile.companyId)
      console.log('   - Company Name:', userProfile.company?.name)
    } else {
      console.log('❌ No UserProfile found with this Clerk User ID')
      
      // Check for profile by email
      const profileByEmail = await prisma.userProfile.findUnique({
        where: { email: 'steve.arntz@getcampfire.com' }
      })
      
      if (profileByEmail) {
        console.log('\n   Found profile by email:')
        console.log('   - Clerk User ID:', profileByEmail.clerkUserId)
        console.log('   - Company ID:', profileByEmail.companyId)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Check database URL
const DATABASE_URL = process.env.DATABASE_URL || ''
console.log('DATABASE_URL starts with:', DATABASE_URL.substring(0, 60) + '...')
console.log('Is Neon?', DATABASE_URL.includes('neon.tech'))
console.log('Is Supabase?', DATABASE_URL.includes('supabase.co'))
console.log('\n')

verifyProduction()