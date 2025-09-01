import Redis from 'ioredis'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Schema for Redis assessment data
const RedisAssessmentSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  domain: z.string().optional(),
  department: z.string().optional(),
  teamSize: z.string().optional(),
  selectedCategories: z.array(z.string()).optional(),
  categoryDetails: z.record(z.object({
    challenges: z.array(z.string()).optional()
  })).optional(),
  skillGaps: z.array(z.string()).optional(),
  supportNeeds: z.array(z.string()).optional(),
  selectedPriorities: z.array(z.string()).optional(),
  additionalInsights: z.string().optional(),
  createdAt: z.string().optional(),
  migrated: z.boolean().optional()
})

type RedisAssessment = z.infer<typeof RedisAssessmentSchema>

const DRY_RUN = process.env.DRY_RUN === 'true'

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL not configured')
  }
  return new Redis(process.env.REDIS_URL)
}

async function findOrCreateCompany(domain: string) {
  // Check if company exists
  let company = await prisma.company.findFirst({
    where: { 
      OR: [
        { domains: { has: domain } },
        { name: domain }
      ]
    }
  })
  
  if (!company && !DRY_RUN) {
    // Create company if it doesn't exist
    company = await prisma.company.create({
      data: {
        name: domain,
        domains: [domain]
      }
    })
    console.log(`Created company: ${domain}`)
  }
  
  return company
}

async function findOrCreateInvitation(data: RedisAssessment, companyId: string) {
  // Check if invitation exists for this email
  let invitation = await prisma.invitation.findFirst({
    where: {
      email: data.email.toLowerCase(),
      companyId
    }
  })
  
  if (!invitation && !DRY_RUN) {
    // Generate invite code
    const inviteCode = generateInviteCode()
    
    // Create invitation
    invitation = await prisma.invitation.create({
      data: {
        inviteCode,
        email: data.email.toLowerCase(),
        name: data.name,
        companyId,
        status: 'COMPLETED',
        completedAt: data.createdAt ? new Date(data.createdAt) : new Date()
      }
    })
    
    // Create metadata
    await prisma.invitationMetadata.create({
      data: {
        invitationId: invitation.id,
        department: data.department || null,
        toolsAccessed: ['people-leader-needs']
      }
    })
    
    console.log(`Created invitation for: ${data.email}`)
  }
  
  return invitation
}

async function migrateAssessment(key: string, data: RedisAssessment, redis: Redis) {
  try {
    console.log(`\nProcessing: ${data.email}`)
    
    // Skip if already migrated
    if (data.migrated) {
      console.log('  → Already migrated, skipping')
      return { skipped: true }
    }
    
    // Get or create company
    const domain = data.domain || data.email.split('@')[1]
    const company = await findOrCreateCompany(domain)
    if (!company) {
      console.log('  → Dry run: Would create company')
      return { dryRun: true }
    }
    
    // Get or create invitation
    const invitation = await findOrCreateInvitation(data, company.id)
    if (!invitation) {
      console.log('  → Dry run: Would create invitation')
      return { dryRun: true }
    }
    
    // Check if assessment result already exists
    const existingResult = await prisma.assessmentResult.findFirst({
      where: {
        invitationId: invitation.id,
        toolId: 'people-leader-needs'
      }
    })
    
    if (existingResult) {
      console.log('  → Assessment already exists in PostgreSQL')
      
      // Mark as migrated in Redis
      if (!DRY_RUN) {
        data.migrated = true
        await redis.set(key, JSON.stringify(data))
      }
      return { exists: true }
    }
    
    // Transform Redis data to PostgreSQL format
    const assessmentData = {
      invitationId: invitation.id,
      toolId: 'people-leader-needs',
      toolName: 'People Leadership Needs Assessment',
      shareId: generateShareId(),
      completedAt: data.createdAt ? new Date(data.createdAt) : new Date(),
      
      responses: {
        email: data.email,
        name: data.name,
        department: data.department,
        teamSize: data.teamSize,
        selectedCategories: data.selectedCategories || [],
        categoryDetails: data.categoryDetails || {},
        skillGaps: data.skillGaps || [],
        supportNeeds: data.supportNeeds || [],
        selectedPriorities: data.selectedPriorities || [],
        additionalInsights: data.additionalInsights || ''
      },
      
      userProfile: {
        name: data.name,
        email: data.email,
        department: data.department,
        teamSize: data.teamSize,
        role: 'Manager'
      },
      
      scores: {
        categoryCount: data.selectedCategories?.length || 0,
        skillGapCount: data.skillGaps?.length || 0,
        supportNeedCount: data.supportNeeds?.length || 0
      }
    }
    
    if (!DRY_RUN) {
      // Create assessment result
      await prisma.assessmentResult.create({
        data: assessmentData as any
      })
      
      // Mark as migrated in Redis
      data.migrated = true
      await redis.set(key, JSON.stringify(data))
      
      console.log('  ✓ Migrated successfully')
      return { success: true }
    } else {
      console.log('  → Dry run: Would migrate assessment')
      return { dryRun: true }
    }
    
  } catch (error) {
    console.error(`  ✗ Error migrating ${key}:`, error)
    return { error: true, message: error instanceof Error ? error.message : 'Unknown error' }
  }
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function generateShareId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function main() {
  console.log('=================================')
  console.log('Redis to PostgreSQL Migration')
  console.log('=================================')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log('')
  
  const redis = await getRedisClient()
  
  try {
    // Get all HR assessment keys (note: using dash not underscore)
    const pattern = 'hr-assessment:*'
    const keys = await redis.keys(pattern)
    
    console.log(`Found ${keys.length} assessments in Redis`)
    
    const stats = {
      total: keys.length,
      migrated: 0,
      skipped: 0,
      exists: 0,
      errors: 0,
      dryRun: 0
    }
    
    // Process each assessment
    for (const key of keys) {
      const dataStr = await redis.get(key)
      if (!dataStr) continue
      
      try {
        const data = JSON.parse(dataStr)
        const validationResult = RedisAssessmentSchema.safeParse(data)
        
        if (!validationResult.success) {
          console.log(`\nSkipping invalid data in ${key}`)
          console.log('  Validation errors:', validationResult.error.issues)
          stats.errors++
          continue
        }
        
        const result = await migrateAssessment(key, validationResult.data, redis)
        
        if (result.success) stats.migrated++
        else if (result.skipped) stats.skipped++
        else if (result.exists) stats.exists++
        else if (result.dryRun) stats.dryRun++
        else if (result.error) stats.errors++
        
      } catch (error) {
        console.error(`Failed to process ${key}:`, error)
        stats.errors++
      }
    }
    
    // Print summary
    console.log('\n=================================')
    console.log('Migration Summary')
    console.log('=================================')
    console.log(`Total assessments: ${stats.total}`)
    console.log(`Migrated: ${stats.migrated}`)
    console.log(`Already migrated: ${stats.skipped}`)
    console.log(`Already in PostgreSQL: ${stats.exists}`)
    console.log(`Dry run (would migrate): ${stats.dryRun}`)
    console.log(`Errors: ${stats.errors}`)
    
    if (DRY_RUN) {
      console.log('\n⚠️  This was a DRY RUN. No data was actually migrated.')
      console.log('To run the actual migration, set DRY_RUN=false')
    }
    
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    redis.disconnect()
    await prisma.$disconnect()
  }
}

// Run the migration
main().catch(console.error)