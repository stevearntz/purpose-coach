import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Find the admin by email
    const admin = await prisma.admin.findUnique({
      where: { email }
    });
    
    if (!admin) {
      return NextResponse.json({ results: [] });
    }
    
    // Get the company
    const company = await prisma.company.findFirst({
      where: { 
        admins: {
          some: { id: admin.id }
        }
      }
    });
    
    if (!company) {
      return NextResponse.json({ results: [] });
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