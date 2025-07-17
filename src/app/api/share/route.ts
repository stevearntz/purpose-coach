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
      this.redis = new Redis(process.env.REDIS_URL);
    }
  }

  async get(key: string): Promise<unknown> {
    await this.ensureRedis();
    if (!this.redis) return null;
    
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    await this.ensureRedis();
    if (!this.redis) throw new Error('Redis not available');
    
    const stringValue = JSON.stringify(value);
    if (options?.ex) {
      await this.redis.setex(key, options.ex, stringValue);
    } else {
      await this.redis.set(key, stringValue);
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
      const { kv } = await import('@vercel/kv');
      this.kv = kv;
    }
  }

  async get(key: string): Promise<unknown> {
    await this.ensureKV();
    return this.kv!.get(key);
  }

  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    await this.ensureKV();
    await this.kv!.set(key, value, options);
  }
}

// Get storage adapter based on environment
function getStorage(): StorageAdapter {
  const hasKVConfig = process.env.KV_URL && process.env.KV_REST_API_TOKEN;
  const hasRedisUrl = process.env.REDIS_URL;
  
  if (hasKVConfig) {
    console.log('Using Vercel KV storage');
    return new VercelKVStorage();
  } else if (hasRedisUrl) {
    console.log('Using Redis storage');
    return new RedisStorage();
  } else {
    console.log('Using local file storage for development');
    return new LocalFileStorage();
  }
}

const storage = getStorage();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const shareData = {
      ...body,
      createdAt: new Date().toISOString(),
    };
    
    const id = nanoid(10);
    
    await storage.set(`share:${id}`, shareData, {
      ex: 60 * 60 * 24 * 30, // 30 days expiry
    });
    
    return NextResponse.json({ id, url: `/share/${id}` });
  } catch (error) {
    console.error('Error saving share data:', error);
    return NextResponse.json(
      { error: 'Failed to create shareable link' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      );
    }
    
    const data = await storage.get(`share:${id}`);
    
    if (!data) {
      return NextResponse.json(
        { error: 'Share not found or expired' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error retrieving share data:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve shared data' },
      { status: 500 }
    );
  }
}