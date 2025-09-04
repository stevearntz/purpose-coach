# 🚨 URGENT: Fix Production Database

## The Problem
- Development branch (local) has all the data and is working
- Production branch (main) is EMPTY - no schema, no data
- That's why production isn't working!

## Step 1: Get Production Database URLs from Neon

1. Go to https://console.neon.tech
2. Select your project
3. **Switch to "main" branch** (not development!)
4. Copy the connection strings for main branch

## Step 2: Push Schema to Production

Once you have the main branch connection string, run:

```bash
# Replace with YOUR main branch connection string
DATABASE_URL="postgresql://neondb_owner:[PASSWORD]@[HOST]/neondb?sslmode=require" npx prisma db push
```

## Step 3: Seed Production Data

Create this script as `scripts/seed-production.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

// Use the PRODUCTION database URL here
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'YOUR_PRODUCTION_DATABASE_URL_HERE'
    }
  }
})

async function seedProduction() {
  console.log('🌱 Seeding PRODUCTION database...')
  
  try {
    // Create Campfire company
    const company = await prisma.company.upsert({
      where: { 
        clerkOrgId: 'org_31IuAOPrNHNfhSHyWeUFjIccpeK'
      },
      update: {
        domains: ['getcampfire.com', '@getcampfire.com']
      },
      create: {
        name: 'Campfire',
        clerkOrgId: 'org_31IuAOPrNHNfhSHyWeUFjIccpeK',
        domains: ['getcampfire.com', '@getcampfire.com']
      }
    })
    
    console.log('✅ Company created/updated:', company.name)
    
    // Create your user profile
    const user = await prisma.userProfile.upsert({
      where: { 
        email: 'steve@getcampfire.com'
      },
      update: {
        clerkUserId: 'user_31I4733XAJ8QAWh5cw2OASaP6qt',
        companyId: company.id
      },
      create: {
        email: 'steve@getcampfire.com',
        clerkUserId: 'user_31I4733XAJ8QAWh5cw2OASaP6qt',
        firstName: 'Steve',
        lastName: 'Arntz',
        role: 'CEO',
        department: 'Leadership',
        teamName: 'Leadership',
        teamPurpose: 'Build amazing tools for teams',
        teamEmoji: '🔥',
        teamSize: '1-5',
        companyId: company.id,
        onboardingComplete: true,
        clerkRole: 'admin'
      }
    })
    
    console.log('✅ User created/updated:', user.email)
    console.log('✅ Production database seeded!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedProduction()
```

## Step 4: Update Vercel Environment Variables

Make sure Vercel has the PRODUCTION (main branch) URLs:
- DATABASE_URL = main branch pooler URL  
- DIRECT_URL = main branch direct URL

## Step 5: Verify Everything Works

1. Check locally that production data exists:
```bash
npx tsx scripts/check-production-data.ts
```

2. Redeploy on Vercel
3. Test sign-in on production

## Why This Happened
- We've been working on the development branch
- But Vercel production uses the main branch
- The branches are isolated - different schemas, different data
- We fixed dev but not production!