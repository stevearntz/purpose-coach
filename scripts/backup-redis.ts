#!/usr/bin/env npx tsx
import Redis from 'ioredis'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function backupRedis() {
  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL not configured')
    return
  }
  
  const redis = new Redis(process.env.REDIS_URL)
  
  try {
    console.log('=====================================')
    console.log('REDIS BACKUP')
    console.log('=====================================\n')
    
    const backup: Record<string, any> = {}
    const patterns = [
      'hr-assessment:*',
      'lead:*',
      'campaign:*',
      'company:*',
      'user:*',
      'invitation:*',
      'share:*'
    ]
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern)
      console.log(`Backing up ${keys.length} keys matching ${pattern}`)
      
      for (const key of keys) {
        const type = await redis.type(key)
        
        if (type === 'string') {
          const value = await redis.get(key)
          backup[key] = { type: 'string', value }
        } else if (type === 'hash') {
          const value = await redis.hgetall(key)
          backup[key] = { type: 'hash', value }
        } else if (type === 'list') {
          const value = await redis.lrange(key, 0, -1)
          backup[key] = { type: 'list', value }
        } else if (type === 'set') {
          const value = await redis.smembers(key)
          backup[key] = { type: 'set', value }
        } else if (type === 'zset') {
          const value = await redis.zrange(key, 0, -1, 'WITHSCORES')
          backup[key] = { type: 'zset', value }
        }
      }
    }
    
    // Save backup to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `redis-backup-${timestamp}.json`
    fs.writeFileSync(filename, JSON.stringify(backup, null, 2))
    
    console.log(`\n✅ Backup saved to: ${filename}`)
    console.log(`Total keys backed up: ${Object.keys(backup).length}`)
    
  } catch (error) {
    console.error('Backup failed:', error)
  } finally {
    redis.disconnect()
  }
}

backupRedis().catch(console.error)