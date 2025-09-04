import { PrismaClient } from '@prisma/client'

// Use the PRODUCTION database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require'
    }
  }
})

async function verifyProduction() {
  console.log('🔍 Verifying PRODUCTION Database\n')
  console.log('='.repeat(60) + '\n')
  
  try {
    // Check companies
    const companies = await prisma.company.findMany()
    console.log(`📊 Companies: ${companies.length}`)
    companies.forEach(c => {
      console.log(`   - ${c.name} (ID: ${c.id}`)
      console.log(`     Clerk Org: ${c.clerkOrgId}`)
      console.log(`     Domains: ${c.domains.join(', ')}`)
    })
    
    // Check users
    const users = await prisma.userProfile.findMany({
      include: { company: true }
    })
    console.log(`\n📊 Users: ${users.length}`)
    users.forEach(u => {
      console.log(`   - ${u.email}`)
      console.log(`     Clerk ID: ${u.clerkUserId}`)
      console.log(`     Company: ${u.company?.name || 'None'}`)
      console.log(`     Team: ${u.teamName || 'Not set'}`)
      console.log(`     Team Purpose: ${u.teamPurpose || 'Not set'}`)
    })
    
    console.log('\n✅ Production database is ready!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProduction()