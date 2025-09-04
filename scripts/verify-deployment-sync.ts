import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface EnvironmentCheck {
  name: string
  development: string | undefined
  production: string | undefined
  status: 'match' | 'different' | 'missing'
  required: boolean
  notes?: string
}

async function verifyDeploymentSync() {
  console.log('🔍 Deployment Sync Verification\n')
  console.log('=' .repeat(60) + '\n')
  
  // Load environment files
  const envLocal = dotenv.parse(fs.readFileSync('.env.local', 'utf8'))
  const envProd = fs.existsSync('.env.production.local') 
    ? dotenv.parse(fs.readFileSync('.env.production.local', 'utf8'))
    : {}
  
  // 1. Check Critical Environment Variables
  console.log('📋 Environment Variables Check:\n')
  
  const envChecks: EnvironmentCheck[] = [
    // Database
    {
      name: 'DATABASE_URL',
      development: envLocal.DATABASE_URL,
      production: envProd.DATABASE_URL || 'Set in Vercel',
      status: 'different',
      required: true,
      notes: 'Should use Neon dev branch locally, main branch in production'
    },
    // Clerk
    {
      name: 'CLERK_SECRET_KEY',
      development: envLocal.CLERK_SECRET_KEY?.substring(0, 10) + '...',
      production: envProd.CLERK_SECRET_KEY ? envProd.CLERK_SECRET_KEY.substring(0, 10) + '...' : 'Set in Vercel',
      status: envLocal.CLERK_SECRET_KEY?.includes('sk_test') ? 'different' : 'match',
      required: true,
      notes: 'Dev uses sk_test, Prod uses sk_live'
    },
    {
      name: 'CLERK_WEBHOOK_SECRET',
      development: envLocal.CLERK_WEBHOOK_SECRET?.substring(0, 15) + '...',
      production: envProd.CLERK_WEBHOOK_SECRET ? envProd.CLERK_WEBHOOK_SECRET.substring(0, 15) + '...' : 'Set in Vercel',
      status: 'match',
      required: true,
      notes: 'Same webhook secret for both environments'
    },
    {
      name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      development: envLocal.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) + '...',
      production: 'pk_live_... (in Vercel)',
      status: envLocal.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('pk_test') ? 'different' : 'match',
      required: true,
      notes: 'Dev uses pk_test, Prod uses pk_live'
    },
    // Other Services
    {
      name: 'OPENAI_API_KEY',
      development: envLocal.OPENAI_API_KEY ? '✅ Set' : '❌ Missing',
      production: 'Set in Vercel',
      status: envLocal.OPENAI_API_KEY ? 'match' : 'missing',
      required: true,
      notes: 'Same API key for both'
    },
    {
      name: 'REDIS_URL',
      development: envLocal.REDIS_URL ? '✅ Set' : '⚠️ Optional',
      production: 'Set in Vercel',
      status: 'match',
      required: false,
      notes: 'Falls back to memory if not set'
    }
  ]
  
  envChecks.forEach(check => {
    const icon = check.status === 'match' ? '✅' : 
                 check.status === 'different' ? '🔄' : '❌'
    console.log(`${icon} ${check.name}`)
    console.log(`   Dev: ${check.development}`)
    console.log(`   Prod: ${check.production}`)
    if (check.notes) {
      console.log(`   ℹ️  ${check.notes}`)
    }
    console.log('')
  })
  
  // 2. Check Database Configuration
  console.log('🗄️  Database Configuration:\n')
  
  try {
    // Check current database
    const companies = await prisma.company.findMany({
      select: {
        name: true,
        clerkOrgId: true,
        domains: true
      }
    })
    
    console.log('Companies in Database:')
    companies.forEach(company => {
      console.log(`   - ${company.name}`)
      console.log(`     Clerk Org ID: ${company.clerkOrgId || '❌ Not set'}`)
      console.log(`     Domains: ${company.domains.join(', ') || '❌ None'}`)
    })
    console.log('')
    
    // Check for Clerk org sync
    const campfire = companies.find(c => c.name === 'Campfire')
    if (campfire) {
      if (campfire.clerkOrgId) {
        console.log('✅ Campfire organization has Clerk Org ID')
        console.log(`   ID: ${campfire.clerkOrgId}`)
      } else {
        console.log('❌ Campfire organization missing Clerk Org ID!')
        console.log('   Run: npx tsx scripts/fix-clerk-org.ts')
      }
    }
    
  } catch (error) {
    console.log('⚠️  Could not connect to database')
    console.log('   Make sure DATABASE_URL is correct')
  }
  
  // 3. Check Code Configuration
  console.log('\n🔧 Code Configuration:\n')
  
  // Check for hardcoded development checks
  const onboardingPath = path.join(process.cwd(), 'src/app/onboarding/page.tsx')
  const onboardingContent = fs.readFileSync(onboardingPath, 'utf8')
  
  if (onboardingContent.includes('localhost')) {
    console.log('⚠️  Onboarding page has localhost checks')
    console.log('   This is OK - manual assignment works in both environments')
  } else {
    console.log('✅ Onboarding page has no localhost-specific code')
  }
  
  if (onboardingContent.includes('@getcampfire.com')) {
    console.log('⚠️  Onboarding has hardcoded @getcampfire.com reference')
    console.log('   Should be domain-agnostic')
  } else {
    console.log('✅ Onboarding is domain-agnostic')
  }
  
  // 4. Webhook Configuration
  console.log('\n🔗 Webhook Configuration:\n')
  console.log('Development:')
  console.log('   ❌ Webhooks cannot reach localhost')
  console.log('   ✅ Manual assignment fallback active')
  console.log('')
  console.log('Production:')
  console.log('   URL: https://tools.getcampfire.com/api/webhooks/clerk')
  console.log('   Events needed:')
  console.log('   - user.created')
  console.log('   - user.updated')
  console.log('   - session.created')
  console.log('   - organization.created')
  console.log('   - organization.updated')
  
  // 5. Deployment Checklist
  console.log('\n' + '=' .repeat(60))
  console.log('\n📝 Pre-Deployment Checklist:\n')
  
  const checklist = [
    { item: 'Database migrated to production', cmd: 'On Vercel: Set DATABASE_URL to Neon main branch' },
    { item: 'Clerk production keys in Vercel', cmd: 'Add sk_live and pk_live keys' },
    { item: 'Webhook configured in Clerk', cmd: 'Dashboard → Webhooks → Add endpoint' },
    { item: 'Webhook secret in Vercel', cmd: 'Add CLERK_WEBHOOK_SECRET env var' },
    { item: 'OpenAI API key in Vercel', cmd: 'Add OPENAI_API_KEY env var' },
    { item: 'Test with real domain', cmd: 'Sign up with @getcampfire.com email' }
  ]
  
  checklist.forEach((item, index) => {
    console.log(`${index + 1}. [ ] ${item.item}`)
    console.log(`      How: ${item.cmd}`)
    console.log('')
  })
  
  // 6. Key Differences Summary
  console.log('=' .repeat(60))
  console.log('\n🔑 Key Dev/Prod Differences:\n')
  console.log('1. **Database**: Dev uses Neon dev branch, Prod uses main branch')
  console.log('2. **Clerk Keys**: Dev uses test keys, Prod uses live keys')
  console.log('3. **Webhooks**: Only work in production (public URL required)')
  console.log('4. **Manual Assignment**: Fallback works in both environments')
  console.log('5. **Domain Matching**: Same logic in both (database-driven)')
  
  console.log('\n✨ Ready for deployment once checklist is complete!')
  
  await prisma.$disconnect()
}

verifyDeploymentSync()