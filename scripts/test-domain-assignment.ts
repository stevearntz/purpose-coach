import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDomainAssignment() {
  console.log('🧪 Testing Domain-Based Organization Assignment\n')
  console.log('='.repeat(50) + '\n')
  
  try {
    // 1. Show all companies and their configured domains
    const companies = await prisma.company.findMany({
      select: {
        name: true,
        clerkOrgId: true,
        domains: true
      }
    })
    
    console.log('📋 Current Company Domain Configuration:\n')
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.name}`)
      console.log(`   Clerk Org ID: ${company.clerkOrgId || 'NOT SET'}`)
      console.log(`   Domains: ${company.domains.length > 0 ? company.domains.join(', ') : 'NONE'}`)
      console.log('')
    })
    
    console.log('-'.repeat(50) + '\n')
    
    // 2. Test different email scenarios
    console.log('🔍 Testing Email → Organization Matching:\n')
    
    const testEmails = [
      'steve@getcampfire.com',
      'john@example.com',
      'jane@acme.com',
      'bob@test.org'
    ]
    
    for (const email of testEmails) {
      const domain = '@' + email.split('@')[1]
      const matchingCompany = await prisma.company.findFirst({
        where: {
          domains: {
            has: domain
          }
        }
      })
      
      console.log(`Email: ${email}`)
      console.log(`Domain: ${domain}`)
      if (matchingCompany) {
        console.log(`✅ Would be assigned to: ${matchingCompany.name}`)
      } else {
        console.log(`❌ No matching organization (would need manual assignment)`)
      }
      console.log('')
    }
    
    console.log('-'.repeat(50) + '\n')
    
    // 3. Show how the webhook works
    console.log('📚 How the Auto-Assignment Works:\n')
    console.log('1. User signs up with their email')
    console.log('2. Webhook extracts domain (e.g., @example.com)')
    console.log('3. Searches for company with that domain in domains array')
    console.log('4. If found, adds user to that Clerk organization')
    console.log('5. Updates user metadata with organization info')
    console.log('')
    
    console.log('⚙️  To Configure a New Domain:\n')
    console.log('1. Go to /admin in the app')
    console.log('2. Find or create the company')
    console.log('3. Add the domain (with @ prefix) to the domains list')
    console.log('4. Ensure the company has a Clerk Org ID')
    console.log('')
    
    // 4. Check for potential issues
    console.log('⚠️  Checking for Potential Issues:\n')
    
    const companiesWithoutClerkId = companies.filter(c => !c.clerkOrgId)
    if (companiesWithoutClerkId.length > 0) {
      console.log('❌ Companies missing Clerk Org ID:')
      companiesWithoutClerkId.forEach(c => {
        console.log(`   - ${c.name}`)
      })
      console.log('   These companies cannot auto-assign users!\n')
    }
    
    const companiesWithoutDomains = companies.filter(c => c.domains.length === 0)
    if (companiesWithoutDomains.length > 0) {
      console.log('⚠️  Companies without domains:')
      companiesWithoutDomains.forEach(c => {
        console.log(`   - ${c.name}`)
      })
      console.log('   Users cannot be auto-assigned to these companies!\n')
    }
    
    // Check for duplicate domains
    const allDomains = companies.flatMap(c => c.domains.map(d => ({ domain: d, company: c.name })))
    const domainCounts = allDomains.reduce((acc, { domain }) => {
      acc[domain] = (acc[domain] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const duplicates = Object.entries(domainCounts).filter(([_, count]) => count > 1)
    if (duplicates.length > 0) {
      console.log('❌ Duplicate domains found:')
      duplicates.forEach(([domain, count]) => {
        console.log(`   - ${domain} is used by ${count} companies:`)
        allDomains.filter(d => d.domain === domain).forEach(d => {
          console.log(`     • ${d.company}`)
        })
      })
      console.log('   This will cause conflicts!\n')
    }
    
    if (companiesWithoutClerkId.length === 0 && 
        companiesWithoutDomains.length === 0 && 
        duplicates.length === 0) {
      console.log('✅ All companies are properly configured!')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testDomainAssignment()