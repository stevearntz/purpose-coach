import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAuthUser, getUserCompany } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Get authenticated user - NO FALLBACKS
    const user = await getCurrentAuthUser();
    
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
    
    // Get all campaigns for this company with completed assessments
    const campaigns = await prisma.campaign.findMany({
      where: { 
        companyId: company.id,
        status: { in: ['ACTIVE', 'COMPLETED'] }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Get results for each campaign
    const campaignResults = await Promise.all(
      campaigns.map(async (campaign) => {
        // Get invitations for this campaign
        const invitations = await prisma.invitation.findMany({
          where: {
            companyId: company.id,
            inviteUrl: {
              contains: `campaign=${encodeURIComponent(campaign.name)}`
            }
          }
        });
        
        const totalParticipants = invitations.length;
        const completedInvitations = invitations.filter(inv => inv.status === 'COMPLETED');
        const completedCount = completedInvitations.length;
        const completionRate = totalParticipants > 0 
          ? Math.round((completedCount / totalParticipants) * 100)
          : 0;
        
        // For now, we'll return basic stats
        // In a real implementation, we'd aggregate actual assessment data here
        let aggregatedData = null;
        
        if (completedCount > 0) {
          // Mock aggregated data for demonstration
          // In production, this would analyze actual assessment responses
          aggregatedData = {
            topChallenges: [
              { challenge: 'Managing underperformers', count: Math.floor(completedCount * 0.7) },
              { challenge: 'Team conflict resolution', count: Math.floor(completedCount * 0.6) },
              { challenge: 'Remote collaboration', count: Math.floor(completedCount * 0.5) },
              { challenge: 'Delegation', count: Math.floor(completedCount * 0.4) },
              { challenge: 'Setting boundaries', count: Math.floor(completedCount * 0.3) }
            ].filter(c => c.count > 0),
            topCapabilities: [
              { capability: 'Team building', count: Math.floor(completedCount * 0.8) },
              { capability: 'Communication', count: Math.floor(completedCount * 0.7) },
              { capability: 'Strategic thinking', count: Math.floor(completedCount * 0.5) }
            ].filter(c => c.count > 0)
          };
        }
        
        return {
          id: campaign.id,
          campaignName: campaign.name,
          assessmentType: 'HR Partnership Assessment', // Would be dynamic based on campaign
          startDate: campaign.startDate?.toISOString() || campaign.createdAt.toISOString(),
          endDate: campaign.endDate?.toISOString(),
          totalParticipants,
          completedCount,
          completionRate,
          aggregatedData
        };
      })
    );
    
    return NextResponse.json({ results: campaignResults });
    
  } catch (error) {
    console.error('[results-campaigns] Error fetching campaign results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign results' },
      { status: 500 }
    );
  }
}