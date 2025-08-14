import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local file first
config({ path: resolve(process.cwd(), '.env.local') })

import prisma from '../src/lib/prisma'
import { nanoid } from 'nanoid'

async function createTestCompany() {
  console.log('🏢 Creating test company for flow testing...\n')
  
  try {
    // Create a test company with unique name
    const testId = nanoid(6)
    const company = await prisma.company.create({
      data: {
        name: `Acme Test Corp ${testId}`,
        logo: '🧪' // Test tube emoji as logo
      }
    })
    
    console.log('✅ Test company created:')
    console.log(`   Name: ${company.name}`)
    console.log(`   Domain: ${company.domain}`)
    console.log(`   ID: ${company.id}`)
    
    // Create some test invitations
    const testUsers = [
      { email: 'john.doe@acmetest.example', name: 'John Doe' },
      { email: 'jane.smith@acmetest.example', name: 'Jane Smith' },
      { email: 'bob.wilson@acmetest.example', name: 'Bob Wilson' },
      { email: 'alice.johnson@acmetest.example', name: 'Alice Johnson' },
      { email: 'charlie.brown@acmetest.example', name: 'Charlie Brown' }
    ]
    
    console.log('\n📧 Creating test invitations...')
    
    for (const user of testUsers) {
      const inviteCode = nanoid(16)
      const invitation = await prisma.invitation.create({
        data: {
          email: user.email,
          name: user.name,
          inviteCode,
          inviteUrl: `https://tools.getcampfire.com/start?invite=${inviteCode}`,
          companyId: company.id,
          status: 'PENDING'
        }
      })
      
      console.log(`   ✉️  ${user.name} (${user.email})`)
      console.log(`      Invite URL: ${invitation.inviteUrl}`)
    }
    
    console.log('\n✅ Test setup complete!')
    console.log('\n📝 How to test:')
    console.log('1. Go to https://tools.getcampfire.com/admin')
    console.log('2. Login with steve@getcampfire.com')
    console.log('3. You should see the Acme Test Corp invitations')
    console.log('4. Click on any invite URL to test the onboarding flow')
    console.log('5. You can resend invitations (emails will fail gracefully)')
    console.log('\n💡 Tip: The invite URLs work even though emails are fake!')
    
  } catch (error) {
    console.error('Error creating test company:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestCompany()