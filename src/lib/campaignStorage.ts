import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// This is a drop-in replacement for campaignStorage.ts using PostgreSQL instead of Redis

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'archived';
export type ParticipantStatus = 'invited' | 'started' | 'completed' | 'expired';

export interface CampaignParticipant {
  userId: string;
  email: string;
  name: string;
  status: ParticipantStatus;
  invitedAt: string;
  startedAt?: string;
  completedAt?: string;
  resultId?: string;
  remindersSent: number;
  lastReminderAt?: string;
}

export interface AssessmentCampaign {
  id: string;
  companyId: string;
  toolId: string;
  toolName: string;
  toolPath: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  createdBy: string;
  createdAt: string;
  startDate: string;
  deadline: string;
  uniqueCode: string;
  uniqueLink: string;
  participants: CampaignParticipant[];
  settings: {
    allowLateSubmissions: boolean;
    sendReminders: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'custom';
    reminderDays?: number[];
    anonymousResults: boolean;
    requiredCompletion: boolean;
  };
  metrics: {
    totalInvited: number;
    totalStarted: number;
    totalCompleted: number;
    completionRate: number;
    avgCompletionTime?: number;
  };
}

class CampaignStorageService {
  async init() {
    // No initialization needed for PostgreSQL
    console.log('Campaign storage: Using PostgreSQL');
    return true;
  }

  async create(campaign: Omit<AssessmentCampaign, 'id' | 'createdAt' | 'uniqueCode' | 'uniqueLink' | 'metrics'>): Promise<AssessmentCampaign> {
    const id = nanoid();
    const uniqueCode = nanoid(8);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://getcampfire.com';
    const uniqueLink = `${baseUrl}/${campaign.toolPath}?campaign=${uniqueCode}`;

    const newCampaign: AssessmentCampaign = {
      ...campaign,
      id,
      createdAt: new Date().toISOString(),
      uniqueCode,
      uniqueLink,
      metrics: {
        totalInvited: campaign.participants.length,
        totalStarted: 0,
        totalCompleted: 0,
        completionRate: 0,
      },
    };

    // Store in PostgreSQL
    await prisma.campaign.create({
      data: {
        id,
        name: campaign.name,
        description: campaign.description,
        companyId: campaign.companyId,
        status: campaign.status.toUpperCase() as any,
        startDate: campaign.startDate ? new Date(campaign.startDate) : null,
        endDate: campaign.deadline ? new Date(campaign.deadline) : null,
        toolId: campaign.toolId,
        toolName: campaign.toolName,
        toolPath: campaign.toolPath,
        participants: campaign.participants.map(p => p.email),
        campaignCode: uniqueCode,
        campaignLink: uniqueLink,
        createdBy: campaign.createdBy,
      }
    });

    return newCampaign;
  }

  async getById(id: string): Promise<AssessmentCampaign | null> {
    const campaign = await prisma.campaign.findUnique({
      where: { id }
    });

    if (!campaign) return null;

    // Transform to AssessmentCampaign format
    return this.transformToAssessmentCampaign(campaign);
  }

  async getByCode(code: string): Promise<AssessmentCampaign | null> {
    const campaign = await prisma.campaign.findFirst({
      where: { campaignCode: code }
    });

    if (!campaign) return null;

    return this.transformToAssessmentCampaign(campaign);
  }

  async getByCompany(companyId: string): Promise<AssessmentCampaign[]> {
    const campaigns = await prisma.campaign.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });

    return campaigns.map(c => this.transformToAssessmentCampaign(c));
  }

  async update(id: string, updates: Partial<AssessmentCampaign>): Promise<boolean> {
    try {
      await prisma.campaign.update({
        where: { id },
        data: {
          name: updates.name,
          description: updates.description,
          status: updates.status?.toUpperCase() as any,
          startDate: updates.startDate ? new Date(updates.startDate) : undefined,
          endDate: updates.deadline ? new Date(updates.deadline) : undefined,
          participants: updates.participants?.map(p => p.email),
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  private transformToAssessmentCampaign(campaign: any): AssessmentCampaign {
    // Transform Prisma campaign to AssessmentCampaign format
    return {
      id: campaign.id,
      companyId: campaign.companyId,
      toolId: campaign.toolId || '',
      toolName: campaign.toolName || '',
      toolPath: campaign.toolPath || '',
      name: campaign.name,
      description: campaign.description || '',
      status: (campaign.status?.toLowerCase() || 'draft') as CampaignStatus,
      createdBy: campaign.createdBy || '',
      createdAt: campaign.createdAt.toISOString(),
      startDate: campaign.startDate?.toISOString() || '',
      deadline: campaign.endDate?.toISOString() || '',
      uniqueCode: campaign.campaignCode || '',
      uniqueLink: campaign.campaignLink || '',
      participants: campaign.participants?.map((email: string) => ({
        userId: '',
        email,
        name: '',
        status: 'invited' as ParticipantStatus,
        invitedAt: campaign.createdAt.toISOString(),
        remindersSent: 0,
      })) || [],
      settings: {
        allowLateSubmissions: true,
        sendReminders: true,
        reminderFrequency: 'weekly',
        anonymousResults: false,
        requiredCompletion: false,
      },
      metrics: {
        totalInvited: campaign.participants?.length || 0,
        totalStarted: 0,
        totalCompleted: 0,
        completionRate: 0,
      },
    };
  }
}

// Export singleton instance
export const campaignStorage = new CampaignStorageService();