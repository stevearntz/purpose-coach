/**
 * Production-grade Campaign Results API
 * Fully authenticated, validated, and secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
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
  campaignId: z.string().optional(), // Remove UUID validation - campaigns use cuid format
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
    
    // Get user's company from session (Admin model removed)
    const companyId = req.user.companyId;
    
    if (!companyId) {
      logger.warn({ requestId }, 'User has no company association');
      return NextResponse.json(
        { error: 'No company association found' },
        { status: 403 }
      );
    }
    
    // Build query filter
    const where: any = {
      companyId: companyId,
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
          // Parse campaign metadata to get campaign code
          let campaignCode = '';
          if (campaign.description) {
            try {
              const metadata = JSON.parse(campaign.description);
              campaignCode = metadata.campaignCode || '';
            } catch {
              // Not JSON
            }
          }
          
          // Get invitations for this campaign (by campaign code in URL)
          const invitations = await tx.invitation.findMany({
            where: {
              companyId: companyId,
              OR: [
                // Match by campaign code in URL
                campaignCode ? {
                  inviteUrl: {
                    contains: `/assessment/${campaignCode}`
                  }
                } : {},
                // Fallback to old format
                {
                  inviteUrl: {
                    contains: `campaign=${encodeURIComponent(campaign.name)}`
                  }
                }
              ]
            },
            include: {
              assessmentResults: {
                orderBy: { completedAt: 'desc' },
                take: 1 // Get most recent assessment
              },
              metadata: includeDetails ? true : undefined
            }
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
            // Aggregate data from actual assessment results
            const challengeCounts = new Map<string, number>();
            const skillGapCounts = new Map<string, number>();
            const supportNeedCounts = new Map<string, number>();
            const priorityCounts = new Map<string, number>();
            
            completedInvitations.forEach((inv: any) => {
              // Get assessment data
              const assessment = inv.assessmentResults?.[0];
              if (assessment?.responses) {
                const responses = assessment.responses;
                
                // Count challenges from category details
                if (responses.categoryDetails) {
                  Object.entries(responses.categoryDetails).forEach(([category, details]: [string, any]) => {
                    if (details.challenges) {
                      details.challenges.forEach((challenge: string) => {
                        const key = `${category}: ${challenge}`;
                        challengeCounts.set(key, (challengeCounts.get(key) || 0) + 1);
                      });
                    }
                  });
                }
                
                // Count skill gaps
                if (responses.skillGaps) {
                  responses.skillGaps.forEach((skill: string) => {
                    skillGapCounts.set(skill, (skillGapCounts.get(skill) || 0) + 1);
                  });
                }
                
                // Count support needs
                if (responses.supportNeeds) {
                  responses.supportNeeds.forEach((need: string) => {
                    supportNeedCounts.set(need, (supportNeedCounts.get(need) || 0) + 1);
                  });
                }
                
                // Count priorities
                if (responses.selectedPriorities) {
                  responses.selectedPriorities.forEach((priority: string) => {
                    priorityCounts.set(priority, (priorityCounts.get(priority) || 0) + 1);
                  });
                }
              }
            });
            
            // Sort and format ALL items (don't limit to top 5)
            const topChallenges = Array.from(challengeCounts.entries())
              .map(([challenge, count]) => ({ challenge, count }))
              .sort((a, b) => b.count - a.count);
            
            const topSkillGaps = Array.from(skillGapCounts.entries())
              .map(([skill, count]) => ({ skill, count }))
              .sort((a, b) => b.count - a.count);
            
            const topSupportNeeds = Array.from(supportNeedCounts.entries())
              .map(([need, count]) => ({ need, count }))
              .sort((a, b) => b.count - a.count);
            
            const topPriorities = Array.from(priorityCounts.entries())
              .map(([priority, count]) => ({ priority, count }))
              .sort((a, b) => b.count - a.count);
            
            aggregatedData = {
              topChallenges,
              topSkillGaps,
              topSupportNeeds,
              topPriorities,
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