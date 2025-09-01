import Redis from 'ioredis'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function checkRedis() {
  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL not configured')
    return
  }
  
  const redis = new Redis(process.env.REDIS_URL)
  
  try {
    console.log('=================================')
    console.log('Redis Database Contents')
    console.log('=================================\n')
    
    // Get ALL keys in Redis
    const allKeys = await redis.keys('*')
    console.log(`Total keys in Redis: ${allKeys.length}\n`)
    
    if (allKeys.length === 0) {
      console.log('Redis is empty - no data found')
      return
    }
    
    // Group keys by pattern
    const keyPatterns: Record<string, string[]> = {}
    
    for (const key of allKeys) {
      // Extract pattern (everything before first colon or the whole key)
      const pattern = key.includes(':') ? key.split(':')[0] : key
      
      if (!keyPatterns[pattern]) {
        keyPatterns[pattern] = []
      }
      keyPatterns[pattern].push(key)
    }
    
    // Display keys by pattern
    console.log('Keys grouped by pattern:')
    console.log('------------------------')
    
    for (const [pattern, keys] of Object.entries(keyPatterns)) {
      console.log(`\n${pattern}:* (${keys.length} keys)`)
      
      // Show first few keys as examples
      const examples = keys.slice(0, 3)
      for (const key of examples) {
        console.log(`  - ${key}`)
        
        // Get the type and a sample of the data
        const type = await redis.type(key)
        console.log(`    Type: ${type}`)
        
        if (type === 'string') {
          const value = await redis.get(key)
          if (value) {
            try {
              const parsed = JSON.parse(value)
              console.log(`    Data: ${JSON.stringify(parsed, null, 2).substring(0, 200)}...`)
            } catch {
              console.log(`    Data: ${value.substring(0, 100)}...`)
            }
          }
        } else if (type === 'hash') {
          const fields = await redis.hkeys(key)
          console.log(`    Fields: ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`)
        } else if (type === 'list') {
          const length = await redis.llen(key)
          console.log(`    Length: ${length}`)
        } else if (type === 'set') {
          const size = await redis.scard(key)
          console.log(`    Size: ${size}`)
        }
      }
      
      if (keys.length > 3) {
        console.log(`  ... and ${keys.length - 3} more`)
      }
    }
    
    // Check for specific patterns we care about
    console.log('\n=================================')
    console.log('Checking for Known Patterns')
    console.log('=================================\n')
    
    const knownPatterns = [
      'hr_assessment:*',
      'assessment:*',
      'user:*',
      'session:*',
      'cache:*',
      'result:*',
      'invitation:*'
    ]
    
    for (const pattern of knownPatterns) {
      const matchingKeys = await redis.keys(pattern)
      console.log(`${pattern}: ${matchingKeys.length} keys`)
    }
    
  } catch (error) {
    console.error('Error checking Redis:', error)
  } finally {
    redis.disconnect()
  }
}

checkRedis().catch(console.error)