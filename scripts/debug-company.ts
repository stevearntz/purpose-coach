#!/usr/bin/env npx tsx

import { PrismaClient } from '@prisma/client'
import { clerkClient } from '@clerk/nextjs/server'

const prisma = new PrismaClient()

async function debugCompanyData() {
  console.log('=== Debugging Company Data ===\n')
  
  // Your email to look up
  const userEmail = 'steve.arntz@getcampfire.com'
  
  try {
    // 1. Check UserProfile
    console.log('1. Checking UserProfile for email:', userEmail)
    const userProfile = await prisma.userProfile.findUnique({
      where: { email: userEmail },
      include: { company: true }
    })
    
    if (userProfile) {
      console.log('✅ UserProfile found:')
      console.log('   - ID:', userProfile.id)
      console.log('   - Clerk User ID:', userProfile.clerkUserId)
      console.log('   - Company ID:', userProfile.companyId)
      console.log('   - Company:', userProfile.company ? userProfile.company.name : 'None linked')
      
      if (userProfile.company) {
        console.log('\n   Company Details:')
        console.log('   - Company Name:', userProfile.company.name)
        console.log('   - Company Clerk Org ID:', userProfile.company.clerkOrgId)
      }
    } else {
      console.log('❌ No UserProfile found for this email')
    }
    
    // 2. Check all Companies
    console.log('\n2. Checking all Companies in database:')
    const companies = await prisma.company.findMany()
    
    if (companies.length > 0) {
      companies.forEach(company => {
        console.log(`\n   Company: ${company.name}`)
        console.log(`   - ID: ${company.id}`)
        console.log(`   - Clerk Org ID: ${company.clerkOrgId || 'Not set'}`)
      })
    } else {
      console.log('   ❌ No companies found in database')
    }
    
    // 3. Try to get Clerk organization data (this might fail locally)
    if (userProfile?.clerkUserId) {
      console.log('\n3. Checking Clerk User Organizations:')
      try {
        // Get user from Clerk
        const clerkUser = await clerkClient().users.getUser(userProfile.clerkUserId)
        console.log('   Clerk User ID:', clerkUser.id)
        
        // Get organization memberships
        const orgMemberships = await clerkClient().users.getOrganizationMembershipList({
          userId: userProfile.clerkUserId
        })
        
        if (orgMemberships.totalCount > 0) {
          console.log(`   Found ${orgMemberships.totalCount} organization(s):`)
          for (const membership of orgMemberships.data) {
            console.log(`\n   Organization: ${membership.organization.name}`)
            console.log(`   - Org ID: ${membership.organization.id}`)
            console.log(`   - Role: ${membership.role}`)
            
            // Check if this org exists in our database
            const dbCompany = await prisma.company.findUnique({
              where: { clerkOrgId: membership.organization.id }
            })
            
            if (dbCompany) {
              console.log(`   ✅ Linked to Company: ${dbCompany.name} (ID: ${dbCompany.id})`)
            } else {
              console.log(`   ⚠️  No Company record for this Clerk org`)
            }
          }
        } else {
          console.log('   No organizations found for this user')
        }
      } catch (clerkError) {
        console.log('   ⚠️  Could not fetch Clerk data (might need CLERK_SECRET_KEY)')
      }
    }
    
    // 4. Check for orphaned data
    console.log('\n4. Data Integrity Check:')
    
    // Check for UserProfiles without companies
    const orphanedProfiles = await prisma.userProfile.findMany({
      where: { companyId: null }
    })
    console.log(`   - UserProfiles without companies: ${orphanedProfiles.length}`)
    
    // Check for Companies without clerkOrgId
    const companiesWithoutClerk = await prisma.company.findMany({
      where: { clerkOrgId: null }
    })
    console.log(`   - Companies without Clerk Org ID: ${companiesWithoutClerk.length}`)
    
    if (companiesWithoutClerk.length > 0) {
      companiesWithoutClerk.forEach(c => {
        console.log(`     • ${c.name} (ID: ${c.id})`)
      })
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugCompanyData()