import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedDatabase() {
  console.log('🌱 Seeding Neon database...')
  
  try {
    // Check if company exists, create if not
    let company = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    })
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Campfire',
          clerkOrgId: 'org_2pBUImmF4DZLqiDSUkQJOBFVDVX', // Your current Clerk org ID
          domains: ['getcampfire.com'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Created company:', company.name)
    } else {
      console.log('✅ Company already exists:', company.name)
    }
    
    // Check if user exists, create if not
    let user = await prisma.userProfile.findFirst({
      where: { email: 'steve@getcampfire.com' }
    })
    
    if (!user) {
      user = await prisma.userProfile.create({
        data: {
          clerkUserId: 'user_2pBTlsP5fJ6I3r9YoVJ9zRgHXCn', // Your Clerk user ID
          email: 'steve@getcampfire.com',
          firstName: 'Steve',
          lastName: 'Arntz',
          companyId: company.id,
          clerkRole: 'admin',
          onboardingComplete: true,
          teamName: 'Leadership',
          teamPurpose: 'Build amazing tools for teams',
          teamEmoji: '🔥',
          teamSize: '1',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Created admin user:', user.email)
    } else {
      console.log('✅ User already exists:', user.email)
    }
    
    // Verify the data
    const userCount = await prisma.userProfile.count()
    const companyCount = await prisma.company.count()
    
    console.log('\n📊 Database Summary:')
    console.log(`   Companies: ${companyCount}`)
    console.log(`   Users: ${userCount}`)
    console.log('\n✨ Database seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDatabase()