/**
 * Production-grade Campaign Results API
 * Fully authenticated, validated, and secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware-simple';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import pino from 'pino';

// Production logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['email']
});

// Validation schema
const GetCampaignResultsSchema = z.object({
  campaignId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
  includeDetails: z.coerce.boolean().default(false)
});

/**
 * GET /api/results/campaigns/v2
 * Fetch campaign results with proper authorization
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  logger.info({ requestId, userId: req.user.id }, 'Fetching campaign results');
  
  try {
    // Parse and validate query parameters
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    const validation = GetCampaignResultsSchema.safeParse(params);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }
    
    const { campaignId, limit, offset, includeDetails } = validation.data;
    
    // Get user's company
    const admin = await prisma.admin.findUnique({
      where: { email: req.user.email },
      include: {
        company: true
      }
    });
    
    if (!admin?.company) {
      logger.warn({ requestId }, 'User has no company association');
      return NextResponse.json(
        { error: 'No company association found' },
        { status: 403 }
      );
    }
    
    // Build query filter
    const where: any = {
      companyId: admin.company.id,
      status: { in: ['ACTIVE', 'COMPLETED'] }
    };
    
    if (campaignId) {
      where.id = campaignId;
    }
    
    // Execute query with transaction for consistency
    const campaigns = await prisma.$transaction(async (tx) => {
      const campaignList = await tx.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });
      
      // Get detailed results for each campaign
      const results = await Promise.all(
        campaignList.map(async (campaign) => {
          // Get invitations for this campaign
          const invitations = await tx.invitation.findMany({
            where: {
              companyId: admin.company?.id,
              inviteUrl: {
                contains: `campaign=${encodeURIComponent(campaign.name)}`
              }
            },
            include: includeDetails ? {
              metadata: true
            } : undefined
          });
          
          const totalParticipants = invitations.length;
          const completedInvitations = invitations.filter(inv => inv.status === 'COMPLETED');
          const completedCount = completedInvitations.length;
          const startedCount = invitations.filter(inv => 
            inv.status === 'STARTED' || inv.status === 'COMPLETED'
          ).length;
          
          // Calculate metrics
          const completionRate = totalParticipants > 0 
            ? Math.round((completedCount / totalParticipants) * 100)
            : 0;
          
          const engagementRate = totalParticipants > 0
            ? Math.round((startedCount / totalParticipants) * 100)
            : 0;
          
          // Aggregate assessment data from completed invitations
          let aggregatedData = null;
          if (completedCount > 0 && includeDetails) {
            // Aggregate challenges from metadata
            const challengeCounts = new Map<string, number>();
            const capabilityCounts = new Map<string, number>();
            
            completedInvitations.forEach((inv: any) => {
              if (inv.metadata?.challenges) {
                inv.metadata.challenges.forEach((challenge: string) => {
                  challengeCounts.set(challenge, (challengeCounts.get(challenge) || 0) + 1);
                });
              }
            });
            
            // Sort and format top items
            const topChallenges = Array.from(challengeCounts.entries())
              .map(([challenge, count]) => ({ challenge, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
            
            aggregatedData = {
              topChallenges,
              avgCompletionTime: calculateAvgCompletionTime(completedInvitations),
              participantBreakdown: {
                notStarted: totalParticipants - startedCount,
                started: startedCount - completedCount,
                completed: completedCount
              }
            };
          }
          
          return {
            id: campaign.id,
            campaignName: campaign.name,
            description: campaign.description,
            startDate: campaign.startDate?.toISOString(),
            endDate: campaign.endDate?.toISOString(),
            status: campaign.status,
            metrics: {
              totalParticipants,
              startedCount,
              completedCount,
              completionRate,
              engagementRate
            },
            aggregatedData: includeDetails ? aggregatedData : undefined
          };
        })
      );
      
      return results;
    });
    
    logger.info({ 
      requestId, 
      campaignCount: campaigns.length 
    }, 'Campaign results fetched');
    
    return NextResponse.json({ 
      success: true,
      results: campaigns,
      pagination: {
        limit,
        offset,
        hasMore: campaigns.length === limit
      }
    });
    
  } catch (error) {
    logger.error({ requestId, error }, 'Failed to fetch campaign results');
    return NextResponse.json(
      { error: 'Failed to fetch campaign results' },
      { status: 500 }
    );
  }
}, {
  requireAdmin: true,
  rateLimit: true,
  maxRequests: 50,
  windowMs: '60s'
});

/**
 * Calculate average completion time for invitations
 */
function calculateAvgCompletionTime(invitations: any[]): string {
  const times = invitations
    .filter(inv => inv.startedAt && inv.completedAt)
    .map(inv => {
      const start = new Date(inv.startedAt).getTime();
      const end = new Date(inv.completedAt).getTime();
      return end - start;
    });
  
  if (times.length === 0) return 'N/A';
  
  const avgMs = times.reduce((sum, time) => sum + time, 0) / times.length;
  const avgMinutes = Math.round(avgMs / 60000);
  
  if (avgMinutes < 60) {
    return `${avgMinutes} minutes`;
  } else {
    const hours = Math.floor(avgMinutes / 60);
    const minutes = avgMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
}