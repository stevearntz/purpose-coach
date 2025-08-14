import 'dotenv/config'
import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') })

async function testAuth() {
  console.log('Testing authentication setup...\n')
  
  try {
    // Check for existing admins
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    console.log(`Found ${admins.length} admin users:`)
    
    for (const admin of admins) {
      console.log(`\nAdmin: ${admin.email}`)
      console.log(`  Name: ${admin.name || 'Not set'}`)
      console.log(`  Company: ${admin.company?.name || 'No company'}`)
      console.log(`  Has Password: ${!!admin.password}`)
      
      if (admin.password) {
        // Test if the standard password works
        const testPasswords = ['Campfire2024!', 'campfire2024!', 'Password123!']
        console.log('  Testing common passwords...')
        
        for (const testPass of testPasswords) {
          const matches = await bcrypt.compare(testPass, admin.password)
          if (matches) {
            console.log(`  ✅ Password "${testPass}" works for ${admin.email}`)
            break
          }
        }
      }
    }
    
    // If no admins exist or none have passwords, create a test admin
    if (admins.length === 0 || !admins.some(a => a.password)) {
      console.log('\n⚠️  No admin users with passwords found. Creating test admin...')
      
      // Check if Campfire company exists
      let company = await prisma.company.findFirst({
        where: { name: 'Campfire' }
      })
      
      if (!company) {
        console.log('Creating Campfire company...')
        company = await prisma.company.create({
          data: {
            id: 'test-campfire-company',
            name: 'Campfire',
            domain: 'getcampfire.com'
          }
        })
      }
      
      // Create or update test admin
      const testEmail = 'test@getcampfire.com'
      const testPassword = 'Campfire2024!'
      const hashedPassword = await bcrypt.hash(testPassword, 10)
      
      const testAdmin = await prisma.admin.upsert({
        where: { email: testEmail },
        update: {
          password: hashedPassword,
          name: 'Test Admin'
        },
        create: {
          email: testEmail,
          password: hashedPassword,
          name: 'Test Admin',
          companyId: company.id
        }
      })
      
      console.log(`\n✅ Created test admin:`)
      console.log(`   Email: ${testEmail}`)
      console.log(`   Password: ${testPassword}`)
      console.log(`   Company: ${company.name}`)
    }
    
    console.log('\n\n🔍 NextAuth Environment Check:')
    console.log(`   NEXTAUTH_SECRET: ${process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set'}`)
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'Not set (will use default)'}`)
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`)
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
    
    console.log('\n\n📝 To test authentication:')
    console.log('1. Start the dev server: npm run dev')
    console.log('2. Visit http://localhost:3000/login')
    console.log('3. Use one of the credentials shown above')
    console.log('4. You should be redirected to /dashboard after successful login')
    
  } catch (error) {
    console.error('Error testing auth:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAuth()