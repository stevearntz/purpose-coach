import Redis from 'ioredis'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function examineLeads() {
  if (!process.env.REDIS_URL) {
    console.error('REDIS_URL not configured')
    return
  }
  
  const redis = new Redis(process.env.REDIS_URL)
  
  try {
    console.log('=================================')
    console.log('Examining Lead Records in Redis')
    console.log('=================================\n')
    
    // Get all lead keys
    const leadKeys = await redis.keys('lead:*')
    console.log(`Found ${leadKeys.length} lead records\n`)
    
    // Sample a few leads to understand structure
    console.log('Sample Lead Records:')
    console.log('-------------------\n')
    
    const samples = leadKeys.slice(0, 5)
    for (const key of samples) {
      const data = await redis.get(key)
      if (data) {
        try {
          const lead = JSON.parse(data)
          console.log(`Key: ${key}`)
          console.log('Data:', JSON.stringify(lead, null, 2))
          console.log('---')
        } catch (e) {
          console.log(`Key: ${key}`)
          console.log('Data: (raw string)', data)
          console.log('---')
        }
      }
    }
    
    // Analyze lead sources
    const sources = new Map<string, number>()
    const tools = new Map<string, number>()
    
    for (const key of leadKeys) {
      const data = await redis.get(key)
      if (data) {
        try {
          const lead = JSON.parse(data)
          
          // Count by source
          const source = lead.source || 'unknown'
          sources.set(source, (sources.get(source) || 0) + 1)
          
          // Count by tool name
          if (lead.metadata?.toolName) {
            const tool = lead.metadata.toolName
            tools.set(tool, (tools.get(tool) || 0) + 1)
          }
        } catch (e) {
          // Skip invalid JSON
          sources.set('invalid-json', (sources.get('invalid-json') || 0) + 1)
        }
      }
    }
    
    console.log('\nLead Sources:')
    console.log('-------------')
    for (const [source, count] of sources) {
      console.log(`${source}: ${count}`)
    }
    
    console.log('\nTools Used:')
    console.log('-----------')
    for (const [tool, count] of tools) {
      console.log(`${tool}: ${count}`)
    }
    
    // Check for related keys
    console.log('\nRelated Keys:')
    console.log('-------------')
    const leadRelatedPatterns = ['leads:*']
    for (const pattern of leadRelatedPatterns) {
      const keys = await redis.keys(pattern)
      console.log(`${pattern}: ${keys.length} keys`)
      if (keys.length > 0 && keys.length <= 5) {
        for (const key of keys) {
          const type = await redis.type(key)
          console.log(`  - ${key} (${type})`)
        }
      }
    }
    
  } catch (error) {
    console.error('Error examining leads:', error)
  } finally {
    redis.disconnect()
  }
}

examineLeads().catch(console.error)