#!/usr/bin/env npx tsx
/**
 * Test script to debug production authentication issues
 * Tests the production database to verify admin user exists with correct password hash
 * Usage: npx tsx admin-scripts/test-production-auth.ts
 */

import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function testProductionAuth() {
  console.log('🔍 Testing Production Authentication')
  console.log('=' .repeat(60))
  
  // Check environment
  const dbUrl = process.env.DATABASE_URL
  const nextAuthSecret = process.env.NEXTAUTH_SECRET
  const nextAuthUrl = process.env.NEXTAUTH_URL
  
  console.log('\n📋 Environment Check:')
  console.log('  DATABASE_URL:', dbUrl ? `${dbUrl.substring(0, 50)}...` : '❌ NOT SET')
  console.log('  NEXTAUTH_SECRET:', nextAuthSecret ? `${nextAuthSecret.substring(0, 10)}... (${nextAuthSecret.length} chars)` : '❌ NOT SET')
  console.log('  NEXTAUTH_URL:', nextAuthUrl || '❌ NOT SET')
  console.log('  NODE_ENV:', process.env.NODE_ENV || 'undefined')
  
  try {
    // Test database connection
    console.log('\n🔗 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Skip database version check to avoid prepared statement conflicts
    
    // Check for admin user with email "admin" first
    console.log('\n👤 Checking for admin users...')
    
    const adminEmails = ['admin@getcampfire.com', 'steve@getcampfire.com', 'admin']
    let admin = null
    let adminEmail = ''
    
    for (const email of adminEmails) {
      console.log(`  Checking: ${email}`)
      const foundAdmin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() },
        include: { company: true }
      })
      
      if (foundAdmin) {
        admin = foundAdmin
        adminEmail = email
        console.log(`  ✅ Found admin: ${email}`)
        break
      } else {
        console.log(`  ❌ Not found: ${email}`)
      }
    }
    
    if (!admin) {
      console.log('\n❌ No admin found with expected emails')
      
      // List all admins in the database
      const allAdmins = await prisma.admin.findMany({
        select: { 
          id: true,
          email: true, 
          name: true, 
          isActive: true, 
          lastLogin: true,
          companyId: true 
        },
        orderBy: { createdAt: 'desc' }
      })
      
      console.log(`\n📊 All admins in database (${allAdmins.length} total):`)
      if (allAdmins.length === 0) {
        console.log('  No admins found in database!')
      } else {
        allAdmins.forEach((a, i) => {
          console.log(`  ${i + 1}. ${a.email} (ID: ${a.id.substring(0, 8)}...)`)
          console.log(`     Name: ${a.name || 'NULL'}`)
          console.log(`     Active: ${a.isActive}`)
          console.log(`     Last Login: ${a.lastLogin?.toISOString() || 'Never'}`)
          console.log(`     Company ID: ${a.companyId || 'NULL'}`)
        })
      }
      
      // Check total counts
      const adminCount = await prisma.admin.count()
      const companyCount = await prisma.company.count()
      console.log(`\n📈 Database stats:`)
      console.log(`  Total admins: ${adminCount}`)
      console.log(`  Total companies: ${companyCount}`)
      
      return
    }
    
    // Admin found - check details
    console.log('\n✅ Admin Details:')
    console.log('  ID:', admin.id)
    console.log('  Email:', admin.email)
    console.log('  Name:', admin.name || 'NULL')
    console.log('  First Name:', admin.firstName || 'NULL')
    console.log('  Last Name:', admin.lastName || 'NULL')
    console.log('  Company ID:', admin.companyId || 'NULL')
    console.log('  Company Name:', admin.company?.name || 'NULL')
    console.log('  Role:', admin.role)
    console.log('  Is Active:', admin.isActive)
    console.log('  Last Login:', admin.lastLogin?.toISOString() || 'Never')
    console.log('  Created At:', admin.createdAt.toISOString())
    console.log('  Updated At:', admin.updatedAt.toISOString())
    console.log('  Has Password:', !!admin.password)
    console.log('  Reset Token:', !!admin.resetToken)
    
    if (!admin.password) {
      console.log('\n❌ CRITICAL: Admin has no password set!')
      console.log('\n💡 To fix this, run one of the admin setup scripts:')
      console.log('  npx tsx admin-scripts/reset-password.ts')
      console.log('  npx tsx admin-scripts/setup-admin.ts')
      return
    }
    
    // Check password hash format
    console.log('\n🔐 Password Hash Analysis:')
    const hash = admin.password
    console.log('  Hash length:', hash.length)
    console.log('  Hash prefix:', hash.substring(0, 10) + '...')
    console.log('  Looks like bcrypt:', hash.startsWith('$2') ? '✅ Yes' : '❌ No')
    
    if (hash.startsWith('$2')) {
      const parts = hash.split('$')
      console.log('  Bcrypt version:', parts[1] || 'unknown')
      console.log('  Salt rounds:', parts[2] || 'unknown')
    }
    
    // Test the expected password "admin123"
    console.log('\n🔍 Testing password: "admin123"')
    try {
      const passwordMatches = await bcrypt.compare('admin123', hash)
      if (passwordMatches) {
        console.log('✅ SUCCESS: Password "admin123" matches the hash!')
        console.log('\n🎉 Authentication should work with:')
        console.log('  Email:', adminEmail)
        console.log('  Password: admin123')
        
        // Test a few other common passwords too
        console.log('\n🔍 Testing other common passwords...')
        const otherPasswords = ['password', 'Password123', 'campfire123', 'Campfire123']
        for (const testPass of otherPasswords) {
          const matches = await bcrypt.compare(testPass, hash)
          console.log(`  ${testPass}: ${matches ? '✅ MATCH' : '❌ No match'}`)
        }
        
      } else {
        console.log('❌ FAIL: Password "admin123" does NOT match the hash')
        console.log('\n🔍 Testing other common passwords...')
        
        const testPasswords = [
          'password', 'Password123', 'Password123!',
          'admin', 'Admin123', 'Admin123!',
          'campfire123', 'Campfire123', 'Campfire123!',
          'steve123', 'Steve123', 'Steve123!'
        ]
        
        let foundMatch = false
        for (const testPass of testPasswords) {
          try {
            const matches = await bcrypt.compare(testPass, hash)
            if (matches) {
              console.log(`  ✅ FOUND MATCH: "${testPass}"`)
              foundMatch = true
              break
            } else {
              console.log(`  ❌ No match: "${testPass}"`)
            }
          } catch (err) {
            console.log(`  ⚠️ Error testing "${testPass}":`, err instanceof Error ? err.message : String(err))
          }
        }
        
        if (!foundMatch) {
          console.log('\n❌ No matching password found!')
          console.log('\n💡 To set password to "admin123", run:')
          console.log('  npx tsx admin-scripts/reset-password.ts')
          
          // Generate correct hash for "admin123"
          const correctHash = await bcrypt.hash('admin123', 10)
          console.log('\n🔧 Or run this SQL directly:')
          console.log(`UPDATE "Admin" SET password = '${correctHash}' WHERE email = '${adminEmail}';`)
        }
      }
      
    } catch (error) {
      console.log('❌ Error testing password:', error instanceof Error ? error.message : String(error))
    }
    
    // Additional diagnostics
    console.log('\n🔬 Additional Diagnostics:')
    
    // Check for any authentication-related data
    const invitations = await prisma.invitation.count()
    const companies = await prisma.company.count()
    const campaigns = await prisma.campaign.count()
    
    console.log(`  Invitations: ${invitations}`)
    console.log(`  Companies: ${companies}`)  
    console.log(`  Campaigns: ${campaigns}`)
    
    // Check if there are any other admins for this company
    if (admin.companyId) {
      const companyAdmins = await prisma.admin.count({
        where: { companyId: admin.companyId }
      })
      console.log(`  Other admins in company: ${companyAdmins - 1}`)
    }
    
  } catch (error) {
    console.error('\n❌ Error during test:', error)
    
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      if (error.stack) {
        console.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'))
      }
    }
  } finally {
    console.log('\n🔌 Disconnecting from database...')
    await prisma.$disconnect()
    console.log('✅ Disconnected successfully')
  }
}

// Run the test
testProductionAuth().then(() => {
  console.log('\n🏁 Test completed')
  process.exit(0)
}).catch((error) => {
  console.error('\n💥 Unhandled error:', error)
  process.exit(1)
})