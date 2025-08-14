#!/usr/bin/env npx tsx
/**
 * Test authentication directly
 */

import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function testAuth() {
  const email = 'steve@getcampfire.com'
  
  console.log('🔍 Testing authentication for:', email)
  console.log('=' .repeat(50))
  
  try {
    // 1. Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: { company: true }
    })
    
    if (!admin) {
      console.log('❌ No admin found with email:', email)
      
      // List all admins
      const allAdmins = await prisma.admin.findMany({
        select: { email: true, id: true }
      })
      console.log('\nAll admins in database:')
      allAdmins.forEach(a => console.log(`  - ${a.email} (${a.id})`))
      return
    }
    
    console.log('\n✅ Admin found:')
    console.log('  ID:', admin.id)
    console.log('  Email:', admin.email)
    console.log('  Name:', admin.name)
    console.log('  Company ID:', admin.companyId)
    console.log('  Company:', admin.company?.name || 'NO COMPANY')
    console.log('  Is Active:', admin.isActive)
    console.log('  Has Password:', !!admin.password)
    
    if (!admin.password) {
      console.log('\n❌ Admin has no password set!')
      return
    }
    
    // 2. Test some common passwords to see if any match
    console.log('\n🔐 Testing password hash...')
    console.log('  Hash starts with:', admin.password.substring(0, 20) + '...')
    
    // Test if the hash is valid bcrypt
    const testPasswords = [
      'password',
      'Password123',
      'Password123!',
      'Campfire123',
      'Campfire123!',
      'Steve123',
      'steve123'
    ]
    
    console.log('\nTesting common passwords:')
    for (const testPass of testPasswords) {
      try {
        const matches = await bcrypt.compare(testPass, admin.password)
        if (matches) {
          console.log(`  ✅ Password "${testPass}" MATCHES!`)
          console.log('\n🎉 You can login with:')
          console.log('  Email:', email)
          console.log('  Password:', testPass)
          return
        } else {
          console.log(`  ❌ Password "${testPass}" does not match`)
        }
      } catch (err) {
        console.log(`  ⚠️ Error testing "${testPass}":`, err.message)
      }
    }
    
    // 3. Generate a new password hash for a known password
    console.log('\n💡 To set a new password, use this:')
    const newPassword = 'Campfire2024!'
    const newHash = await bcrypt.hash(newPassword, 10)
    console.log('\nSQL to set password to "' + newPassword + '":')
    console.log(`UPDATE "Admin" SET password = '${newHash}' WHERE email = '${email}';`)
    
    // 4. Check company
    if (!admin.company && admin.companyId) {
      console.log('\n⚠️ Warning: Admin has companyId but company not found!')
      console.log('Run this SQL to fix:')
      console.log(`UPDATE "Admin" SET "companyId" = NULL WHERE email = '${email}';`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()