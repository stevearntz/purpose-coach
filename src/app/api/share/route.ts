import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import fs from 'fs/promises';
import path from 'path';
import Redis from 'ioredis';

// Storage interface
interface StorageAdapter {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, options?: { ex?: number }): Promise<void>;
}

// In-memory storage implementation (for production fallback)
class InMemoryStorage implements StorageAdapter {
  private store: Map<string, { data: unknown; expiresAt?: Date }> = new Map();

  async get(key: string): Promise<unknown> {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (item.expiresAt && item.expiresAt < new Date()) {
      this.store.delete(key);
      return null;
    }
    
    return item.data;
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    const expiresAt = options?.ex 
      ? new Date(Date.now() + options.ex * 1000)
      : undefined;
    
    this.store.set(key, { data: value, expiresAt });
  }
}

// Local file storage implementation
class LocalFileStorage implements StorageAdapter {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), '.share-data');
  }

  private async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      console.error('Error creating data directory:', error);
    }
  }

  async get(key: string): Promise<unknown> {
    try {
      await this.ensureDataDir();
      const filePath = path.join(this.dataDir, `${key}.json`);
      const data = await fs.readFile(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Check if expired
      if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
        await fs.unlink(filePath).catch(() => {}); // Clean up expired file
        return null;
      }
      
      return parsed.data;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    await this.ensureDataDir();
    const filePath = path.join(this.dataDir, `${key}.json`);
    
    const dataToStore = {
      data: value,
      createdAt: new Date().toISOString(),
      expiresAt: options?.ex 
        ? new Date(Date.now() + options.ex * 1000).toISOString()
        : null
    };
    
    await fs.writeFile(filePath, JSON.stringify(dataToStore, null, 2));
  }
}

// Redis storage implementation
class RedisStorage implements StorageAdapter {
  private redis: Redis | null = null;

  private async ensureRedis() {
    if (!this.redis && process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        console.log('Redis connection established');
      } catch (error) {
        console.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  async get(key: string): Promise<unknown> {
    try {
      await this.ensureRedis();
      if (!this.redis) return null;
      
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    try {
      await this.ensureRedis();
      if (!this.redis) throw new Error('Redis not available');
      
      const stringValue = JSON.stringify(value);
      if (options?.ex) {
        await this.redis.setex(key, options.ex, stringValue);
      } else {
        await this.redis.set(key, stringValue);
      }
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }
}

// Vercel KV storage implementation
class VercelKVStorage implements StorageAdapter {
  private kv: typeof import('@vercel/kv').kv | null;

  constructor() {
    // Dynamically import to avoid build errors when KV is not configured
    this.kv = null;
  }

  private async ensureKV() {
    if (!this.kv) {
      try {
        const { kv } = await import('@vercel/kv');
        this.kv = kv;
      } catch (error) {
        console.error('Failed to import @vercel/kv:', error);
        throw new Error('Vercel KV is not properly configured');
      }
    }
  }

  async get(key: string): Promise<unknown> {
    try {
      await this.ensureKV();
      return this.kv!.get(key);
    } catch (error) {
      console.error('KV get error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    try {
      await this.ensureKV();
      if (options?.ex) {
        await this.kv!.set(key, value, { ex: options.ex });
      } else {
        await this.kv!.set(key, value);
      }
    } catch (error) {
      console.error('KV set error:', error);
      throw error;
    }
  }
}

// Get storage adapter based on environment
function getStorage(): StorageAdapter {
  const hasRedisUrl = process.env.REDIS_URL;
  const hasKVConfig = process.env.KV_URL && process.env.KV_REST_API_TOKEN;
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log('Storage config check:', {
    hasRedisUrl,
    hasKVConfig,
    isProduction,
    KV_URL: !!process.env.KV_URL,
    KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
    REDIS_URL: !!process.env.REDIS_URL
  });
  
  // Prioritize Redis if it's available
  if (hasRedisUrl) {
    console.log('Using Redis storage');
    return new RedisStorage();
  } else if (hasKVConfig) {
    console.log('Using Vercel KV storage');
    return new VercelKVStorage();
  } else if (isProduction) {
    console.log('Using in-memory storage for production (WARNING: Data will not persist across deployments)');
    return new InMemoryStorage();
  } else {
    console.log('Using local file storage for development');
    return new LocalFileStorage();
  }
}

// Initialize storage on demand instead of at module level
let storage: StorageAdapter | null = null;

function ensureStorage(): StorageAdapter {
  if (!storage) {
    storage = getStorage();
  }
  return storage;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const shareData = {
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    const id = nanoid(10);
    
    console.log('Attempting to save share data with id:', id);
    
    await ensureStorage().set(`share:${id}`, shareData, {
      ex: 60 * 60 * 24 * 30, // 30 days expiry
    });
    
    console.log('Share data saved successfully');
    
    // Return the correct URL based on the tool type
    const toolType = body.type;
    
    // Use generic share route for personal-development-plan
    const urlPath = toolType === 'personal-development-plan' 
      ? `/share/${id}`
      : toolType 
      ? `/${toolType}/share/${id}` 
      : `/share/${id}`;
    
    return NextResponse.json({ id, url: urlPath });
  } catch (error) {
    console.error('Error saving share data:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to create shareable link', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    console.log('GET request for share id:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }
    
    const data = await ensureStorage().get(`share:${id}`);
    
    console.log('Retrieved data:', data ? 'Found' : 'Not found');
    
    if (!data) {
      return NextResponse.json(
        { error: 'Share not found or expired' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving share data:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Failed to retrieve shared data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}