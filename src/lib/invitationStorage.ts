import Redis from 'ioredis';
import { nanoid } from 'nanoid';

// Define the Invitation type
export interface Invitation {
  id: string;
  email: string;
  name?: string;
  company?: string;
  companyLogo?: string;
  inviteCode: string;
  inviteUrl: string;
  status: 'pending' | 'sent' | 'opened' | 'started' | 'completed';
  createdAt: string;
  sentAt?: string;
  openedAt?: string;
  startedAt?: string;
  completedAt?: string;
  currentStage?: string;
  personalMessage?: string;
  resentAt?: string;
  metadata?: {
    role?: string;
    challenges?: string[];
    toolsAccessed?: string[];
    accountCreated?: boolean;
    accountEmail?: string;
  };
}

class InvitationStorage {
  private redis: Redis | null = null;
  private memoryStore: Map<string, Invitation> = new Map();
  private useMemoryFallback = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
          connectTimeout: 10000,
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          lazyConnect: true,
        });

        await this.redis.connect();
        console.log('Invitation storage: Redis connection established');

        this.redis.on('error', (err) => {
          console.error('Invitation storage: Redis error:', err);
          this.useMemoryFallback = true;
        });
      } catch (error) {
        console.error('Invitation storage: Failed to connect to Redis:', error);
        this.useMemoryFallback = true;
      }
    } else {
      console.log('Invitation storage: Redis URL not found, using memory storage');
      this.useMemoryFallback = true;
    }
  }

  // Save invitation
  async saveInvitation(invitation: Invitation): Promise<void> {
    const key = `invitation:${invitation.inviteCode}`;
    const indexKey = `invitation:id:${invitation.id}`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        // Store by invite code (primary lookup)
        await this.redis.setex(
          key,
          60 * 60 * 24 * 90, // 90 days expiry
          JSON.stringify(invitation)
        );
        
        // Also store by ID for admin lookup
        await this.redis.setex(
          indexKey,
          60 * 60 * 24 * 90,
          invitation.inviteCode
        );
        
        // Add to list of all invitations
        await this.redis.zadd(
          'invitations:all',
          Date.now(),
          invitation.inviteCode
        );
      } catch (error) {
        console.error('Failed to save invitation to Redis:', error);
        this.memoryStore.set(invitation.inviteCode, invitation);
      }
    } else {
      this.memoryStore.set(invitation.inviteCode, invitation);
    }
  }

  // Get invitation by code
  async getInvitationByCode(inviteCode: string): Promise<Invitation | null> {
    const key = `invitation:${inviteCode}`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Failed to get invitation from Redis:', error);
        return this.memoryStore.get(inviteCode) || null;
      }
    } else {
      return this.memoryStore.get(inviteCode) || null;
    }
  }

  // Get invitation by ID
  async getInvitationById(id: string): Promise<Invitation | null> {
    const indexKey = `invitation:id:${id}`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        const inviteCode = await this.redis.get(indexKey);
        if (!inviteCode) return null;
        return this.getInvitationByCode(inviteCode);
      } catch (error) {
        console.error('Failed to get invitation by ID from Redis:', error);
        // Fallback to searching memory store
        for (const invitation of this.memoryStore.values()) {
          if (invitation.id === id) return invitation;
        }
        return null;
      }
    } else {
      // Search memory store
      for (const invitation of this.memoryStore.values()) {
        if (invitation.id === id) return invitation;
      }
      return null;
    }
  }

  // Get all invitations
  async getAllInvitations(): Promise<Invitation[]> {
    if (this.redis && !this.useMemoryFallback) {
      try {
        // Get all invitation codes from sorted set (ordered by creation time)
        const codes = await this.redis.zrevrange('invitations:all', 0, -1);
        
        if (codes.length === 0) return [];
        
        // Get all invitations
        const pipeline = this.redis.pipeline();
        codes.forEach(code => {
          pipeline.get(`invitation:${code}`);
        });
        
        const results = await pipeline.exec();
        const invitations: Invitation[] = [];
        
        if (results) {
          results.forEach(([err, data]) => {
            if (!err && data) {
              try {
                invitations.push(JSON.parse(data as string));
              } catch (e) {
                console.error('Failed to parse invitation:', e);
              }
            }
          });
        }
        
        return invitations;
      } catch (error) {
        console.error('Failed to get all invitations from Redis:', error);
        return Array.from(this.memoryStore.values());
      }
    } else {
      return Array.from(this.memoryStore.values());
    }
  }

  // Update invitation
  async updateInvitation(inviteCode: string, updates: Partial<Invitation>): Promise<Invitation | null> {
    const existing = await this.getInvitationByCode(inviteCode);
    if (!existing) return null;
    
    const updated = { ...existing, ...updates };
    await this.saveInvitation(updated);
    return updated;
  }

  // Track invitation event
  async trackInvitationEvent(
    inviteCode: string,
    event: 'opened' | 'started' | 'progress' | 'tool_accessed' | 'completed',
    metadata?: any
  ): Promise<void> {
    const invitation = await this.getInvitationByCode(inviteCode);
    if (!invitation) return;

    const timestamp = new Date().toISOString();
    
    switch (event) {
      case 'opened':
        if (!invitation.openedAt) {
          invitation.openedAt = timestamp;
          invitation.status = 'opened';
        }
        break;
        
      case 'started':
        invitation.startedAt = timestamp;
        invitation.status = 'started';
        invitation.currentStage = 'Role Selection';
        break;
        
      case 'progress':
        invitation.currentStage = metadata?.stage || invitation.currentStage;
        if (metadata?.role) {
          invitation.metadata = invitation.metadata || {};
          invitation.metadata.role = metadata.role;
        }
        if (metadata?.challenges) {
          invitation.metadata = invitation.metadata || {};
          invitation.metadata.challenges = metadata.challenges;
        }
        break;
        
      case 'tool_accessed':
        invitation.metadata = invitation.metadata || {};
        invitation.metadata.toolsAccessed = invitation.metadata.toolsAccessed || [];
        if (metadata?.tool && !invitation.metadata.toolsAccessed.includes(metadata.tool)) {
          invitation.metadata.toolsAccessed.push(metadata.tool);
        }
        break;
        
      case 'completed':
        invitation.completedAt = timestamp;
        invitation.status = 'completed';
        invitation.currentStage = 'Completed';
        break;
    }
    
    await this.saveInvitation(invitation);
  }

  // Clean up expired invitations (optional maintenance task)
  async cleanupExpired(): Promise<number> {
    if (!this.redis || this.useMemoryFallback) {
      // For memory store, remove invitations older than 90 days
      const cutoff = Date.now() - (90 * 24 * 60 * 60 * 1000);
      let removed = 0;
      
      for (const [code, invitation] of this.memoryStore.entries()) {
        const createdAt = new Date(invitation.createdAt).getTime();
        if (createdAt < cutoff) {
          this.memoryStore.delete(code);
          removed++;
        }
      }
      
      return removed;
    }
    
    // For Redis, expired keys are automatically removed by TTL
    return 0;
  }
}

// Create singleton instance
const invitationStorage = new InvitationStorage();

export default invitationStorage;