import Redis from 'ioredis';
import { nanoid } from 'nanoid';

// Campaign status lifecycle
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';

// Participant status in a campaign
export type ParticipantStatus = 'invited' | 'started' | 'completed' | 'expired';

export interface CampaignParticipant {
  userId: string;
  email: string;
  name: string;
  status: ParticipantStatus;
  invitedAt: string;
  startedAt?: string;
  completedAt?: string;
  resultId?: string; // Link to their specific result
  remindersSent: number;
  lastReminderAt?: string;
}

export interface AssessmentCampaign {
  id: string;
  companyId: string;
  toolId: string;
  toolName: string;
  toolPath: string;
  name: string; // e.g., "Q1 2024 Trust Audit - Engineering Team"
  description?: string;
  status: CampaignStatus;
  createdBy: string; // email of creator
  createdAt: string;
  startDate: string;
  deadline: string;
  uniqueCode: string; // Short code for campaign-specific URL
  uniqueLink: string; // Full URL for this campaign
  participants: CampaignParticipant[];
  settings: {
    allowLateSubmissions: boolean;
    sendReminders: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'custom';
    reminderDays?: number[]; // Days before deadline to send reminders
    anonymousResults: boolean;
    requiredCompletion: boolean;
  };
  metrics: {
    totalInvited: number;
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    averageScore?: number;
    lastUpdated: string;
  };
  previousCampaignId?: string; // For tracking improvements over time
  tags?: string[]; // For organizing campaigns
  customMessage?: string; // Personalized message for invites
}

export interface CampaignResult {
  campaignId: string;
  participantId: string;
  email: string;
  toolId: string;
  completedAt: string;
  data: any; // Tool-specific result data
  score?: number;
  shareUrl?: string;
}

class CampaignStorage {
  private redis: Redis | null = null;
  private memoryStore: Map<string, AssessmentCampaign> = new Map();
  private resultsStore: Map<string, CampaignResult[]> = new Map();
  private useMemoryFallback = false;

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    console.log('Initializing campaign storage...');
    
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          retryStrategy: (times) => Math.min(times * 50, 2000),
          connectTimeout: 10000,
          maxRetriesPerRequest: 3,
          enableOfflineQueue: false,
          lazyConnect: true,
        });

        await this.redis.connect();
        console.log('Campaign storage: Redis connected');

        this.redis.on('error', (err) => {
          console.error('Campaign storage: Redis error:', err);
          this.useMemoryFallback = true;
        });
      } catch (error) {
        console.error('Campaign storage: Failed to connect to Redis:', error);
        this.useMemoryFallback = true;
      }
    } else {
      console.log('Campaign storage: Using memory storage');
      this.useMemoryFallback = true;
    }
  }

  // Create a new campaign
  async createCampaign(campaign: Omit<AssessmentCampaign, 'id' | 'uniqueCode' | 'uniqueLink' | 'metrics'>): Promise<AssessmentCampaign> {
    const id = nanoid();
    const uniqueCode = nanoid(8); // Shorter code for URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const newCampaign: AssessmentCampaign = {
      ...campaign,
      id,
      uniqueCode,
      uniqueLink: `${baseUrl}/campaign/${uniqueCode}`,
      metrics: {
        totalInvited: campaign.participants.length,
        totalStarted: 0,
        totalCompleted: 0,
        completionRate: 0,
        lastUpdated: new Date().toISOString()
      }
    };

    const key = `campaign:${id}`;
    const codeKey = `campaign:code:${uniqueCode}`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        // Store campaign by ID
        await this.redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(newCampaign));
        // Store mapping from code to ID for quick lookups
        await this.redis.setex(codeKey, 30 * 24 * 60 * 60, id);
        // Add to company's campaign list
        await this.redis.sadd(`company:${campaign.companyId}:campaigns`, id);
      } catch (error) {
        console.error('Failed to save campaign to Redis:', error);
        this.memoryStore.set(id, newCampaign);
      }
    } else {
      this.memoryStore.set(id, newCampaign);
    }

    return newCampaign;
  }

  // Get campaign by ID
  async getCampaignById(id: string): Promise<AssessmentCampaign | null> {
    const key = `campaign:${id}`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        const data = await this.redis.get(key);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Failed to get campaign from Redis:', error);
      }
    }
    
    return this.memoryStore.get(id) || null;
  }

  // Get campaign by unique code
  async getCampaignByCode(code: string): Promise<AssessmentCampaign | null> {
    const codeKey = `campaign:code:${code}`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        const id = await this.redis.get(codeKey);
        if (id) {
          return this.getCampaignById(id);
        }
      } catch (error) {
        console.error('Failed to get campaign by code from Redis:', error);
      }
    }
    
    // Memory fallback - search through all campaigns
    for (const campaign of this.memoryStore.values()) {
      if (campaign.uniqueCode === code) {
        return campaign;
      }
    }
    
    return null;
  }

  // Get all campaigns for a company
  async getCompanyCampaigns(companyId: string): Promise<AssessmentCampaign[]> {
    if (this.redis && !this.useMemoryFallback) {
      try {
        const campaignIds = await this.redis.smembers(`company:${companyId}:campaigns`);
        const campaigns = await Promise.all(
          campaignIds.map(id => this.getCampaignById(id))
        );
        return campaigns.filter(c => c !== null) as AssessmentCampaign[];
      } catch (error) {
        console.error('Failed to get company campaigns from Redis:', error);
      }
    }
    
    // Memory fallback
    return Array.from(this.memoryStore.values())
      .filter(c => c.companyId === companyId);
  }

  // Update campaign
  async updateCampaign(id: string, updates: Partial<AssessmentCampaign>): Promise<AssessmentCampaign | null> {
    const campaign = await this.getCampaignById(id);
    if (!campaign) return null;

    const updatedCampaign = {
      ...campaign,
      ...updates,
      metrics: {
        ...campaign.metrics,
        lastUpdated: new Date().toISOString()
      }
    };

    const key = `campaign:${id}`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        await this.redis.setex(key, 30 * 24 * 60 * 60, JSON.stringify(updatedCampaign));
      } catch (error) {
        console.error('Failed to update campaign in Redis:', error);
        this.memoryStore.set(id, updatedCampaign);
      }
    } else {
      this.memoryStore.set(id, updatedCampaign);
    }

    return updatedCampaign;
  }

  // Update participant status
  async updateParticipantStatus(
    campaignId: string, 
    email: string, 
    status: ParticipantStatus,
    resultId?: string
  ): Promise<boolean> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) return false;

    const participantIndex = campaign.participants.findIndex(p => p.email === email);
    if (participantIndex === -1) return false;

    const now = new Date().toISOString();
    const participant = campaign.participants[participantIndex];

    // Update participant status
    participant.status = status;
    if (status === 'started' && !participant.startedAt) {
      participant.startedAt = now;
    } else if (status === 'completed') {
      participant.completedAt = now;
      if (resultId) participant.resultId = resultId;
    }

    // Update campaign metrics
    const metrics = campaign.metrics;
    metrics.totalStarted = campaign.participants.filter(p => p.startedAt).length;
    metrics.totalCompleted = campaign.participants.filter(p => p.status === 'completed').length;
    metrics.completionRate = metrics.totalInvited > 0 
      ? (metrics.totalCompleted / metrics.totalInvited) * 100 
      : 0;

    await this.updateCampaign(campaignId, { participants: campaign.participants, metrics });
    return true;
  }

  // Add participants to existing campaign
  async addParticipants(campaignId: string, newParticipants: Omit<CampaignParticipant, 'status' | 'invitedAt' | 'remindersSent'>[]): Promise<boolean> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) return false;

    const now = new Date().toISOString();
    const participantsToAdd: CampaignParticipant[] = newParticipants.map(p => ({
      ...p,
      status: 'invited' as ParticipantStatus,
      invitedAt: now,
      remindersSent: 0
    }));

    // Filter out duplicates
    const existingEmails = new Set(campaign.participants.map(p => p.email));
    const uniqueNewParticipants = participantsToAdd.filter(p => !existingEmails.has(p.email));

    if (uniqueNewParticipants.length === 0) return true; // No new participants to add

    campaign.participants.push(...uniqueNewParticipants);
    campaign.metrics.totalInvited = campaign.participants.length;

    await this.updateCampaign(campaignId, { participants: campaign.participants, metrics: campaign.metrics });
    return true;
  }

  // Save campaign result
  async saveCampaignResult(result: CampaignResult): Promise<void> {
    const key = `campaign:${result.campaignId}:results`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        await this.redis.rpush(key, JSON.stringify(result));
        await this.redis.expire(key, 90 * 24 * 60 * 60); // 90 days
      } catch (error) {
        console.error('Failed to save campaign result to Redis:', error);
        const existing = this.resultsStore.get(result.campaignId) || [];
        existing.push(result);
        this.resultsStore.set(result.campaignId, existing);
      }
    } else {
      const existing = this.resultsStore.get(result.campaignId) || [];
      existing.push(result);
      this.resultsStore.set(result.campaignId, existing);
    }

    // Update participant status
    await this.updateParticipantStatus(
      result.campaignId,
      result.email,
      'completed',
      result.shareUrl
    );
  }

  // Get campaign results
  async getCampaignResults(campaignId: string): Promise<CampaignResult[]> {
    const key = `campaign:${campaignId}:results`;
    
    if (this.redis && !this.useMemoryFallback) {
      try {
        const results = await this.redis.lrange(key, 0, -1);
        return results.map(r => JSON.parse(r));
      } catch (error) {
        console.error('Failed to get campaign results from Redis:', error);
      }
    }
    
    return this.resultsStore.get(campaignId) || [];
  }

  // Get active campaigns for a participant
  async getParticipantCampaigns(email: string, companyId: string): Promise<AssessmentCampaign[]> {
    const companyCampaigns = await this.getCompanyCampaigns(companyId);
    
    return companyCampaigns.filter(campaign => 
      campaign.status === 'active' &&
      campaign.participants.some(p => p.email === email && p.status !== 'completed')
    );
  }
}

// Export singleton instance
export const campaignStorage = new CampaignStorage();