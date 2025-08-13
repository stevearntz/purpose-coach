#!/usr/bin/env npx tsx
/**
 * Test login and debug auth issues
 * Usage: npx tsx scripts/test-login.ts <email> <password>
 */

import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function testLogin() {
  const [email, password] = process.argv.slice(2)
  
  if (!email || !password) {
    console.log('Usage: npx tsx scripts/test-login.ts <email> <password>')
    process.exit(1)
  }
  
  try {
    console.log(`\n🔍 Testing login for: ${email}\n`)
    
    // Find admin with various queries
    console.log('1. Searching for admin...')
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: {
        company: true
      }
    })
    
    if (!admin) {
      console.log('❌ No admin found with this email')
      
      // Check if there are any admins at all
      const allAdmins = await prisma.admin.findMany({
        select: { email: true }
      })
      console.log('\nExisting admin emails in database:')
      allAdmins.forEach(a => console.log(`  - ${a.email}`))
      
      process.exit(1)
    }
    
    console.log('✅ Admin found!')
    console.log('  - ID:', admin.id)
    console.log('  - Email:', admin.email)
    console.log('  - Name:', admin.name)
    console.log('  - First Name:', admin.firstName)
    console.log('  - Last Name:', admin.lastName)
    console.log('  - Company ID:', admin.companyId)
    console.log('  - Company:', admin.company?.name || 'None')
    console.log('  - Has password:', !!admin.password)
    console.log('  - Password hash:', admin.password?.substring(0, 20) + '...')
    
    if (!admin.password) {
      console.log('\n❌ Admin has no password set!')
      process.exit(1)
    }
    
    // Test password
    console.log('\n2. Testing password...')
    const passwordMatch = await bcrypt.compare(password, admin.password)
    
    if (passwordMatch) {
      console.log('✅ Password is correct!')
      console.log('\nYou should be able to login with these credentials.')
      
      if (!admin.company) {
        console.log('\n⚠️  Warning: Admin has no company associated.')
        console.log('This might cause issues with some features.')
      }
    } else {
      console.log('❌ Password is incorrect!')
      
      // Generate correct hash for this password
      console.log('\n💡 To set this password, run this SQL in Supabase:')
      const newHash = await bcrypt.hash(password, 10)
      console.log(`\nUPDATE "Admin" SET password = '${newHash}' WHERE email = '${email}';`)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testLogin()