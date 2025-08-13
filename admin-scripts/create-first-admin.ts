/**
 * Script to create the first system admin
 * Run this locally with: npx tsx scripts/create-first-admin.ts
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const prisma = new PrismaClient()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise(resolve => {
    rl.question(query, resolve)
  })
}

async function createFirstAdmin() {
  console.log('🚀 Creating first system admin for Campfire\n')
  
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
    }
    
    // Get admin details
    const email = await question('Admin email: ')
    const name = await question('Admin name: ')
    const password = await question('Admin password: ')
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })
    
    if (existingAdmin) {
      console.log('❌ Admin with this email already exists!')
      process.exit(1)
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
    console.log('Email:', admin.email)
    console.log('Company:', campfireCompany.name)
    console.log('\nYou can now login at /login with these credentials')
    
  } catch (error) {
    console.error('❌ Error creating admin:', error)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

createFirstAdmin()