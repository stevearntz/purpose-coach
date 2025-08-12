/**
 * Public campaign results API for testing
 * Temporary endpoint without auth requirement
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }
    
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: {
        company: true
      }
    });
    
    if (!admin || !admin.company) {
      return NextResponse.json({
        results: [],
        message: 'No campaigns found'
      });
    }
    
    // Get all campaigns for the company
    const campaigns = await prisma.campaign.findMany({
      where: {
        companyId: admin.company.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Get campaign results with invitation stats
    const results = await Promise.all(
      campaigns.map(async (campaign) => {
        const invitations = await prisma.invitation.findMany({
          where: {
            companyId: campaign.companyId,
            inviteUrl: {
              contains: `campaign=${encodeURIComponent(campaign.name)}`
            }
          }
        });
        
        const participants = invitations.map(inv => ({
          id: inv.id,
          name: inv.name || 'Unknown',
          email: inv.email,
          status: inv.status === 'COMPLETED' ? 'completed' : 
                  inv.status === 'SENT' ? 'invited' : 'pending'
        }));
        
        const completedCount = participants.filter(p => p.status === 'completed').length;
        const totalCount = participants.length;
        
        return {
          id: campaign.id,
          campaignName: campaign.name,
          assessmentType: campaign.description || 'Assessment',
          startDate: campaign.startDate?.toISOString(),
          endDate: campaign.endDate?.toISOString(),
          participantCount: totalCount,
          totalParticipants: totalCount,  // Add this field
          completedCount: completedCount,  // Add this field  
          completionRate: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
          status: campaign.status || 'active',
          participants
        };
      })
    );
    
    return NextResponse.json({
      results,
      total: results.length
    });
    
  } catch (error) {
    console.error('[results/campaigns/public] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign results' },
      { status: 500 }
    );
  }
}