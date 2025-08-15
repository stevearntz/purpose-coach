import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAuthUser, getUserCompany } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('id');
    
    // Get authenticated user - NO FALLBACKS
    const user = await getCurrentAuthUser();
    const email = user?.email;
    
    // Get specific campaign by ID
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
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
    
    // REQUIRE authentication
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get company info from Clerk metadata
    const company = await getUserCompany();
    
    if (!company) {
      return NextResponse.json(
        { error: 'No company access found. Please contact support.' },
        { status: 403 }
      );
    }
    
    // Get all campaigns for this company
    const campaigns = await prisma.campaign.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: 'desc' }
    });
    
    // Get invitation counts for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        // Count invitations for this campaign (by matching campaign name in URL)
        const invitations = await prisma.invitation.findMany({
          where: {
            companyId: company.id,
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
          completionRate
        };
      })
    );
    
    return NextResponse.json({ campaigns: campaignsWithStats });
    
  } catch (error) {
    console.error('[campaigns] Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}