import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// PostgreSQL version of invitationStorage using Prisma

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
    isGenericLink?: boolean;
    companyId?: string;
  };
}

class InvitationStorage {
  constructor() {
    console.log('Invitation storage: Using PostgreSQL');
  }

  async createInvitation(email: string, name?: string, company?: string): Promise<Invitation> {
    const inviteCode = nanoid(10).toUpperCase();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.getcampfire.com';
    const inviteUrl = `${baseUrl}/start?invite=${inviteCode}`;
    
    const id = nanoid();

    // Find or create company
    let companyRecord = null;
    if (company) {
      companyRecord = await prisma.company.findFirst({
        where: { name: company }
      });
      
      if (!companyRecord) {
        companyRecord = await prisma.company.create({
          data: {
            name: company,
            domains: [email.split('@')[1]]
          }
        });
      }
    }

    // Create invitation in PostgreSQL
    const dbInvitation = await prisma.invitation.create({
      data: {
        id,
        email: email.toLowerCase(),
        name: name || null,
        inviteCode,
        inviteUrl,
        status: 'PENDING',
        companyId: companyRecord?.id || '',
      }
    });

    // Also create metadata if needed
    await prisma.invitationMetadata.create({
      data: {
        invitationId: id,
        toolsAccessed: []
      }
    });

    const invitation: Invitation = {
      id,
      email: email.toLowerCase(),
      name,
      company,
      inviteCode,
      inviteUrl,
      status: 'pending',
      createdAt: new Date().toISOString(),
      metadata: {
        companyId: companyRecord?.id
      }
    };

    return invitation;
  }

  async getInvitation(code: string): Promise<Invitation | null> {
    const dbInvitation = await prisma.invitation.findFirst({
      where: { inviteCode: code },
      include: {
        company: true,
        metadata: true
      }
    });

    if (!dbInvitation) return null;

    return this.transformToInvitation(dbInvitation);
  }

  async getInvitationById(id: string): Promise<Invitation | null> {
    const dbInvitation = await prisma.invitation.findUnique({
      where: { id },
      include: {
        company: true,
        metadata: true
      }
    });

    if (!dbInvitation) return null;

    return this.transformToInvitation(dbInvitation);
  }

  // Alias for backward compatibility
  async getInvitationByCode(code: string): Promise<Invitation | null> {
    return this.getInvitation(code);
  }

  async saveInvitation(invitation: Invitation): Promise<void> {
    // Create the invitation with the provided data
    const inviteCode = invitation.inviteCode || nanoid(10).toUpperCase();
    const id = invitation.id || nanoid();
    
    // Find or create company
    let companyRecord = null;
    if (invitation.company || invitation.metadata?.companyId) {
      if (invitation.metadata?.companyId) {
        companyRecord = await prisma.company.findUnique({
          where: { id: invitation.metadata.companyId }
        });
      } else if (invitation.company) {
        companyRecord = await prisma.company.findFirst({
          where: { name: invitation.company }
        });
        if (!companyRecord) {
          companyRecord = await prisma.company.create({
            data: { name: invitation.company, domains: [] }
          });
        }
      }
    }
    
    // Create invitation in PostgreSQL
    await prisma.invitation.create({
      data: {
        id,
        email: invitation.email.toLowerCase(),
        name: invitation.name || null,
        inviteCode,
        inviteUrl: invitation.inviteUrl || `/invite/${inviteCode}`,
        status: 'PENDING',
        companyId: companyRecord?.id || '',
      }
    });
  }

  async updateInvitation(code: string, updates: Partial<Invitation>): Promise<boolean> {
    try {
      const statusMap: Record<string, string> = {
        'pending': 'PENDING',
        'sent': 'SENT',
        'opened': 'OPENED',
        'started': 'STARTED',
        'completed': 'COMPLETED'
      };

      const updateData: any = {};
      
      if (updates.status) {
        updateData.status = statusMap[updates.status];
      }
      if (updates.name) {
        updateData.name = updates.name;
      }
      if (updates.sentAt) {
        updateData.sentAt = new Date(updates.sentAt);
      }
      if (updates.openedAt) {
        updateData.openedAt = new Date(updates.openedAt);
      }
      if (updates.startedAt) {
        updateData.startedAt = new Date(updates.startedAt);
      }
      if (updates.completedAt) {
        updateData.completedAt = new Date(updates.completedAt);
      }

      const invitation = await prisma.invitation.findFirst({
        where: { inviteCode: code }
      });

      if (!invitation) return false;

      await prisma.invitation.update({
        where: { id: invitation.id },
        data: updateData
      });

      // Update metadata if provided
      if (updates.metadata) {
        await prisma.invitationMetadata.upsert({
          where: { invitationId: invitation.id },
          create: {
            invitationId: invitation.id,
            role: updates.metadata.role || null,
            toolsAccessed: updates.metadata.toolsAccessed || [],
            department: null
          },
          update: {
            role: updates.metadata.role || undefined,
            toolsAccessed: updates.metadata.toolsAccessed || undefined
          }
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to update invitation:', error);
      return false;
    }
  }

  async getInvitationsByEmail(email: string): Promise<Invitation[]> {
    const invitations = await prisma.invitation.findMany({
      where: { email: email.toLowerCase() },
      include: {
        company: true,
        metadata: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return invitations.map(inv => this.transformToInvitation(inv));
  }

  async getAllInvitations(): Promise<Invitation[]> {
    const invitations = await prisma.invitation.findMany({
      include: {
        company: true,
        metadata: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return invitations.map(inv => this.transformToInvitation(inv));
  }

  private transformToInvitation(dbInvitation: any): Invitation {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tools.getcampfire.com';
    const inviteUrl = `${baseUrl}/start?invite=${dbInvitation.inviteCode}`;
    
    const statusMap: Record<string, Invitation['status']> = {
      'PENDING': 'pending',
      'SENT': 'sent',
      'OPENED': 'opened',
      'STARTED': 'started',
      'COMPLETED': 'completed'
    };

    return {
      id: dbInvitation.id,
      email: dbInvitation.email,
      name: dbInvitation.name || undefined,
      company: dbInvitation.company?.name || undefined,
      inviteCode: dbInvitation.inviteCode,
      inviteUrl,
      status: statusMap[dbInvitation.status] || 'pending',
      createdAt: dbInvitation.createdAt.toISOString(),
      sentAt: dbInvitation.sentAt?.toISOString(),
      openedAt: dbInvitation.openedAt?.toISOString(),
      startedAt: dbInvitation.startedAt?.toISOString(),
      completedAt: dbInvitation.completedAt?.toISOString(),
      metadata: dbInvitation.metadata ? {
        role: dbInvitation.metadata.role || undefined,
        toolsAccessed: dbInvitation.metadata.toolsAccessed || [],
        companyId: dbInvitation.companyId || undefined
      } : undefined
    };
  }
}

export const invitationStorage = new InvitationStorage();