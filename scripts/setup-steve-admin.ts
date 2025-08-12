/**
 * Script to create Steve as the first system admin
 * Run this with: npx tsx scripts/setup-steve-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function createSteveAdmin() {
  console.log('🚀 Creating Steve as system admin for Campfire\n')
  
  try {
    // Check if Campfire company exists
    let campfireCompany = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    })
    
    if (!campfireCompany) {
      console.log('Creating Campfire company...')
      campfireCompany = await prisma.company.create({
        data: {
          name: 'Campfire',
          logo: '/campfire-logo-new.png'
        }
      })
      console.log('✅ Campfire company created')
    } else {
      console.log('✅ Campfire company already exists')
    }
    
    // Admin details for Steve
    const email = 'steve@getcampfire.com'
    const name = 'Steve Arntz'
    // Using a temporary password - YOU SHOULD CHANGE THIS!
    const password = 'Campfire2024!Admin'
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })
    
    if (existingAdmin) {
      console.log('✅ Admin account already exists for:', email)
      console.log('You can login with your existing password')
      process.exit(0)
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        name,
        password: hashedPassword,
        companyId: campfireCompany.id,
        isActive: true
      }
    })
    
    console.log('\n✅ Admin created successfully!')
    console.log('=====================================')
    console.log('Email:', admin.email)
    console.log('Name:', admin.name)
    console.log('Company:', campfireCompany.name)
    console.log('Temporary Password:', password)
    console.log('=====================================')
    console.log('\n⚠️  IMPORTANT: Please change your password after first login!')
    console.log('\nYou can now login at https://tools.getcampfire.com/login')
    console.log('After login, you\'ll be redirected to the admin dashboard')
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createSteveAdmin()