#!/usr/bin/env npx tsx
/**
 * Script to create a new admin account
 * Usage: npx tsx scripts/create-admin.ts
 */

import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'
import readline from 'readline'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(query, resolve)
  })
}

async function createAdmin() {
  console.log('=== Create New Admin Account ===\n')
  
  try {
    // Get admin details
    const email = await question('Email: ')
    const firstName = await question('First Name: ')
    const lastName = await question('Last Name: ')
    const password = await question('Password: ')
    const companyName = await question('Company Name (optional, press Enter to skip): ')
    
    // Validate email
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address')
    }
    
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })
    
    if (existingAdmin) {
      throw new Error(`Admin with email ${email} already exists`)
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create or find company if provided
    let company = null
    if (companyName) {
      company = await prisma.company.findFirst({
        where: { name: companyName }
      })
      
      if (!company) {
        console.log(`\nCreating new company: ${companyName}`)
        company = await prisma.company.create({
          data: {
            name: companyName,
            domain: email.split('@')[1]
          }
        })
      } else {
        console.log(`\nUsing existing company: ${companyName}`)
      }
    }
    
    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        ...(company && {
          companies: {
            connect: { id: company.id }
          }
        })
      }
    })
    
    console.log('\n✅ Admin account created successfully!')
    console.log('Email:', admin.email)
    console.log('Name:', `${admin.firstName} ${admin.lastName}`)
    if (company) {
      console.log('Company:', company.name)
    }
    console.log('\nYou can now login at: /login')
    
  } catch (error) {
    console.error('\n❌ Error creating admin:', error)
  } finally {
    rl.close()
    await prisma.$disconnect()
  }
}

// Run the script
createAdmin()