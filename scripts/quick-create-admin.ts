#!/usr/bin/env npx tsx
/**
 * Quick script to create an admin account
 * Usage: npx tsx scripts/quick-create-admin.ts <email> <password> <firstName> <lastName> [companyName]
 */

import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  const args = process.argv.slice(2)
  
  if (args.length < 4) {
    console.log('Usage: npx tsx scripts/quick-create-admin.ts <email> <password> <firstName> <lastName> [companyName]')
    console.log('Example: npx tsx scripts/quick-create-admin.ts steve@getcampfire.com MyPassword123 Steve Arntz "Campfire"')
    process.exit(1)
  }
  
  const [email, password, firstName, lastName, companyName] = args
  
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    })
    
    if (existingAdmin) {
      console.log(`❌ Admin with email ${email} already exists`)
      
      // Option to reset password for existing admin
      console.log('\nWould you like to reset the password for this admin? (y/n)')
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      })
      
      readline.question('', async (answer) => {
        if (answer.toLowerCase() === 'y') {
          const hashedPassword = await bcrypt.hash(password, 10)
          await prisma.admin.update({
            where: { email },
            data: { 
              password: hashedPassword,
              firstName: firstName || existingAdmin.firstName,
              lastName: lastName || existingAdmin.lastName,
              name: `${firstName} ${lastName}`
            }
          })
          console.log('✅ Password reset successfully!')
        }
        readline.close()
        await prisma.$disconnect()
      })
      return
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
        console.log(`Creating new company: ${companyName}`)
        company = await prisma.company.create({
          data: {
            name: companyName,
            domain: email.split('@')[1]
          }
        })
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
        companyId: company?.id
      }
    })
    
    console.log('\n✅ Admin account created successfully!')
    console.log('Email:', admin.email)
    console.log('Name:', `${admin.firstName} ${admin.lastName}`)
    if (company) {
      console.log('Company:', company.name)
    }
    console.log('\nYou can now login at: http://localhost:3000/login')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createAdmin()