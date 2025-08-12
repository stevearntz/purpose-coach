/**
 * Public campaigns API for testing
 * Temporary endpoint without auth requirement
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
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
      
      const stats = {
        total: invitations.length,
        sent: invitations.filter(i => i.status === 'SENT').length,
        completed: invitations.filter(i => i.status === 'COMPLETED').length
      };
      
      return NextResponse.json({
        ...campaign,
        invitationStats: stats,
        participantCount: stats.total,
        completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
      });
    }
    
    // Get all campaigns
    const campaigns = await prisma.campaign.findMany({
      include: {
        company: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Add stats to each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        const invitations = await prisma.invitation.findMany({
          where: {
            companyId: campaign.companyId,
            inviteUrl: {
              contains: `campaign=${encodeURIComponent(campaign.name)}`
            }
          }
        });
        
        const stats = {
          total: invitations.length,
          sent: invitations.filter(i => i.status === 'SENT').length,
          completed: invitations.filter(i => i.status === 'COMPLETED').length
        };
        
        return {
          ...campaign,
          participantCount: stats.total,
          completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0
        };
      })
    );
    
    return NextResponse.json({
      campaigns: campaignsWithStats,
      total: campaignsWithStats.length
    });
    
  } catch (error) {
    console.error('[campaigns/public] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}