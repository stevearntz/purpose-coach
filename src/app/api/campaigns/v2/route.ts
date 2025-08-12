/**
 * Production-grade Campaigns API
 * Lists campaigns for authenticated users
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware-simple';
import prisma from '@/lib/prisma';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
});

/**
 * GET /api/campaigns/v2
 * Fetch campaigns for the authenticated user's company
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = Math.random().toString(36).substring(7);
  logger.info({ requestId, userId: req.user.id }, 'Fetching campaigns');
  
  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('id');
    
    // Get specific campaign by ID
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          company: true
        }
      });
      
      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      
      // Get invitation stats
      const invitations = await prisma.invitation.findMany({
        where: {
          companyId: campaign.companyId,
          inviteUrl: {
            contains: `campaign=${encodeURIComponent(campaign.name)}`
          }
        }
      });
      
      const totalParticipants = invitations.length;
      const completedCount = invitations.filter(inv => inv.status === 'COMPLETED').length;
      const completionRate = totalParticipants > 0 
        ? Math.round((completedCount / totalParticipants) * 100)
        : 0;
      
      return NextResponse.json({
        ...campaign,
        participantCount: totalParticipants,
        completionRate
      });
    }
    
    // For now, fetch all campaigns across all companies
    // since we don't have a reliable way to link users to companies yet
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    // Get invitation counts for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        // Count invitations for this campaign
        const invitations = await prisma.invitation.findMany({
          where: {
            companyId: campaign.companyId,
            inviteUrl: {
              contains: `campaign=${encodeURIComponent(campaign.name)}`
            }
          }
        });
        
        const totalParticipants = invitations.length;
        const completedCount = invitations.filter(inv => inv.status === 'COMPLETED').length;
        const completionRate = totalParticipants > 0 
          ? Math.round((completedCount / totalParticipants) * 100)
          : 0;
        
        return {
          id: campaign.id,
          name: campaign.name,
          description: campaign.description,
          status: campaign.status,
          startDate: campaign.startDate?.toISOString(),
          endDate: campaign.endDate?.toISOString(),
          createdAt: campaign.createdAt.toISOString(),
          participantCount: totalParticipants,
          completionRate,
          companyName: campaign.company.name
        };
      })
    );
    
    logger.info({ requestId, count: campaignsWithStats.length }, 'Campaigns fetched');
    
    return NextResponse.json({ campaigns: campaignsWithStats });
    
  } catch (error) {
    logger.error({ requestId, error }, 'Failed to fetch campaigns');
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}, {
  requireAdmin: false, // Any authenticated user can view campaigns
  rateLimit: true,
  maxRequests: 100,
  windowMs: '60s'
});