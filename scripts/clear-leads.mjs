import Redis from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

async function clearLeads() {
  if (!process.env.REDIS_URL) {
    console.error('❌ REDIS_URL not found in environment variables');
    process.exit(1);
  }

  const redis = new Redis(process.env.REDIS_URL);
  
  try {
    console.log('🔍 Finding all lead-related keys...');
    
    // Find all lead-related keys
    const leadKeys = await redis.keys('lead:*');
    const dailyKeys = await redis.keys('leads:daily:*');
    const allKeys = [...leadKeys, ...dailyKeys, 'leads:all', 'leads:total'];
    
    // Get all source counter keys
    const sourceKeys = await redis.keys('leads:source:*');
    allKeys.push(...sourceKeys);
    
    console.log(`📊 Found ${allKeys.length} lead-related keys`);
    
    if (allKeys.length === 0) {
      console.log('✅ No leads data found to clear');
      redis.disconnect();
      return;
    }
    
    // Delete all keys
    console.log('🗑️  Deleting all lead data...');
    for (const key of allKeys) {
      await redis.del(key);
    }
    
    console.log('✅ All leads data has been cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing leads:', error);
  } finally {
    redis.disconnect();
  }
}

// Run the script
clearLeads();