#!/usr/bin/env npx tsx
import Redis from 'ioredis'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function rollbackMigration() {
  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL not configured')
    return
  }
  
  const redis = new Redis(process.env.REDIS_URL)
  
  try {
    console.log('=====================================')
    console.log('REDIS MIGRATION ROLLBACK')
    console.log('=====================================\n')
    
    // Find all migrated assessments
    const assessmentKeys = await redis.keys('hr-assessment:*')
    let rolledBack = 0
    
    for (const key of assessmentKeys) {
      const dataStr = await redis.get(key)
      if (!dataStr) continue
      
      try {
        const data = JSON.parse(dataStr)
        if (data.migrated) {
          // Remove the migrated flag
          delete data.migrated
          await redis.set(key, JSON.stringify(data))
          rolledBack++
          console.log(`✓ Rolled back: ${data.email}`)
        }
      } catch (e) {
        console.error(`Error processing ${key}:`, e)
      }
    }
    
    console.log(`\n✅ Rollback complete: ${rolledBack} records unmarked`)
    console.log('The unified API will now read from Redis again for these records.')
    
  } catch (error) {
    console.error('Rollback failed:', error)
  } finally {
    redis.disconnect()
  }
}

rollbackMigration().catch(console.error)