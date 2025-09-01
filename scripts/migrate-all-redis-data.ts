#!/usr/bin/env npx tsx
import Redis from 'ioredis'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

const DRY_RUN = process.env.DRY_RUN === 'true'

// ========================================
// SCHEMAS
// ========================================

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

const RedisLeadSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string(),
  createdAt: z.string(),
  metadata: z.any().optional(),
  toolName: z.string().optional(),
  toolId: z.string().optional(),
  // Extra fields that might be duplicated from metadata
  userRole: z.string().optional(),
  selectedChallenges: z.array(z.string()).optional(),
  recommendedTools: z.array(z.string()).optional(),
  recommendedCourses: z.array(z.string()).optional()
})

type RedisAssessment = z.infer<typeof RedisAssessmentSchema>
type RedisLead = z.infer<typeof RedisLeadSchema>

// ========================================
// UTILITIES
// ========================================

async function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL not configured')
  }
  return new Redis(process.env.REDIS_URL)
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

// ========================================
// LEAD MIGRATION
// ========================================

async function migrateLeads(redis: Redis) {
  console.log('\n=====================================')
  console.log('MIGRATING LEADS')
  console.log('=====================================\n')
  
  const leadKeys = await redis.keys('lead:*')
  console.log(`Found ${leadKeys.length} lead records\n`)
  
  const stats = {
    total: leadKeys.length,
    migrated: 0,
    skipped: 0,
    errors: 0
  }
  
  for (const key of leadKeys) {
    try {
      const data = await redis.get(key)
      if (!data) continue
      
      // Some lead keys store just an ID, not JSON
      let lead: RedisLead | null = null
      try {
        lead = RedisLeadSchema.parse(JSON.parse(data))
      } catch (e) {
        // Skip non-JSON or invalid data
        stats.skipped++
        continue
      }
      
      console.log(`Processing lead: ${lead.email}`)
      
      if (!DRY_RUN) {
        // Check if lead already exists
        const existingLead = await prisma.lead.findFirst({
          where: {
            email: lead.email,
            createdAt: lead.createdAt ? new Date(lead.createdAt) : undefined
          }
        })
        
        if (existingLead) {
          console.log('  → Already exists in PostgreSQL')
          stats.skipped++
          continue
        }
        
        // Create lead in PostgreSQL
        await prisma.lead.create({
          data: {
            email: lead.email,
            name: lead.name || null,
            source: lead.source,
            toolName: lead.toolName || lead.metadata?.toolName || null,
            toolId: lead.toolId || lead.metadata?.toolId || null,
            metadata: {
              ...lead.metadata,
              // Include extra fields that might not be in metadata
              userRole: lead.userRole || lead.metadata?.userRole,
              selectedChallenges: lead.selectedChallenges || lead.metadata?.selectedChallenges,
              recommendedTools: lead.recommendedTools || lead.metadata?.recommendedTools,
              recommendedCourses: lead.recommendedCourses || lead.metadata?.recommendedCourses
            },
            createdAt: lead.createdAt ? new Date(lead.createdAt) : new Date()
          }
        })
        
        console.log('  ✓ Migrated successfully')
        stats.migrated++
      } else {
        console.log('  → Dry run: Would migrate')
        stats.migrated++
      }
      
    } catch (error) {
      console.error(`  ✗ Error processing ${key}:`, error instanceof Error ? error.message : error)
      stats.errors++
    }
  }
  
  console.log('\n--- Lead Migration Summary ---')
  console.log(`Total: ${stats.total}`)
  console.log(`Migrated: ${stats.migrated}`)
  console.log(`Skipped: ${stats.skipped}`)
  console.log(`Errors: ${stats.errors}`)
  
  return stats
}

// ========================================
// ASSESSMENT MIGRATION
// ========================================

async function findOrCreateCompany(domain: string) {
  let company = await prisma.company.findFirst({
    where: { 
      OR: [
        { domains: { has: domain } },
        { name: domain }
      ]
    }
  })
  
  if (!company && !DRY_RUN) {
    company = await prisma.company.create({
      data: {
        name: domain,
        domains: [domain]
      }
    })
    console.log(`  Created company: ${domain}`)
  }
  
  return company
}

async function findOrCreateInvitation(data: RedisAssessment, companyId: string) {
  let invitation = await prisma.invitation.findFirst({
    where: {
      email: data.email.toLowerCase(),
      companyId
    }
  })
  
  if (!invitation && !DRY_RUN) {
    const inviteCode = generateInviteCode()
    
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
    
    await prisma.invitationMetadata.create({
      data: {
        invitationId: invitation.id,
        department: data.department || null,
        toolsAccessed: ['people-leader-needs']
      }
    })
    
    console.log(`  Created invitation for: ${data.email}`)
  }
  
  return invitation
}

async function migrateAssessments(redis: Redis) {
  console.log('\n=====================================')
  console.log('MIGRATING HR ASSESSMENTS')
  console.log('=====================================\n')
  
  const assessmentKeys = await redis.keys('hr-assessment:*')
  console.log(`Found ${assessmentKeys.length} assessments\n`)
  
  const stats = {
    total: assessmentKeys.length,
    migrated: 0,
    skipped: 0,
    exists: 0,
    errors: 0
  }
  
  for (const key of assessmentKeys) {
    try {
      const dataStr = await redis.get(key)
      if (!dataStr) continue
      
      const data = RedisAssessmentSchema.parse(JSON.parse(dataStr))
      console.log(`\nProcessing assessment: ${data.email}`)
      
      // Skip if already migrated
      if (data.migrated) {
        console.log('  → Already migrated')
        stats.skipped++
        continue
      }
      
      // Get or create company
      const domain = data.domain || data.email.split('@')[1]
      const company = await findOrCreateCompany(domain)
      if (!company) {
        console.log('  → Dry run: Would create company')
        stats.migrated++
        continue
      }
      
      // Get or create invitation
      const invitation = await findOrCreateInvitation(data, company.id)
      if (!invitation) {
        console.log('  → Dry run: Would create invitation')
        stats.migrated++
        continue
      }
      
      // Check if assessment already exists
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
        stats.exists++
        continue
      }
      
      // Create assessment result
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
        await prisma.assessmentResult.create({
          data: assessmentData as any
        })
        
        // Mark as migrated in Redis
        data.migrated = true
        await redis.set(key, JSON.stringify(data))
        
        console.log('  ✓ Migrated successfully')
        stats.migrated++
      } else {
        console.log('  → Dry run: Would migrate')
        stats.migrated++
      }
      
    } catch (error) {
      console.error(`  ✗ Error processing ${key}:`, error instanceof Error ? error.message : error)
      stats.errors++
    }
  }
  
  console.log('\n--- Assessment Migration Summary ---')
  console.log(`Total: ${stats.total}`)
  console.log(`Migrated: ${stats.migrated}`)
  console.log(`Already migrated: ${stats.skipped}`)
  console.log(`Already in PostgreSQL: ${stats.exists}`)
  console.log(`Errors: ${stats.errors}`)
  
  return stats
}

// ========================================
// MAIN MIGRATION
// ========================================

async function main() {
  console.log('=====================================')
  console.log('REDIS TO POSTGRESQL MIGRATION')
  console.log('=====================================')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}\n`)
  
  const redis = await getRedisClient()
  
  try {
    // First, ensure the Lead table exists
    if (!DRY_RUN) {
      console.log('Ensuring database schema is up to date...')
      try {
        await prisma.$executeRaw`SELECT 1 FROM "Lead" LIMIT 1`
        console.log('✓ Lead table exists')
      } catch (e) {
        console.log('⚠️  Lead table might not exist, but continuing anyway...')
        console.log('(Production deployment should have created it)')
      }
    }
    
    // Migrate leads
    const leadStats = await migrateLeads(redis)
    
    // Migrate assessments
    const assessmentStats = await migrateAssessments(redis)
    
    // Final summary
    console.log('\n=====================================')
    console.log('MIGRATION COMPLETE')
    console.log('=====================================')
    console.log('\nOverall Summary:')
    console.log(`- Leads: ${leadStats.migrated}/${leadStats.total} migrated`)
    console.log(`- Assessments: ${assessmentStats.migrated}/${assessmentStats.total} migrated`)
    
    if (DRY_RUN) {
      console.log('\n⚠️  This was a DRY RUN. No data was actually migrated.')
      console.log('To run the actual migration:')
      console.log('1. Ensure database is accessible')
      console.log('2. Run: npx prisma db push')
      console.log('3. Run: DRY_RUN=false npx tsx scripts/migrate-all-redis-data.ts')
    } else {
      console.log('\n✅ Migration completed successfully!')
      console.log('\nNext steps:')
      console.log('1. Verify the migrated data in PostgreSQL')
      console.log('2. Test the application with PostgreSQL data')
      console.log('3. Once verified, you can remove Redis dependencies')
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  } finally {
    redis.disconnect()
    await prisma.$disconnect()
  }
}

// Run the migration
main().catch(console.error)