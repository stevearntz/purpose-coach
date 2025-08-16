import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAuthUser, getUserCompany } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    
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
    
    // Build the where clause
    const whereClause: any = {
      companyId: company.id
    };
    
    // If campaignId is provided, filter by campaign
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId }
      });
      
      if (campaign) {
        whereClause.inviteUrl = {
          contains: `campaign=${encodeURIComponent(campaign.name)}`
        };
      }
    }
    
    // Get all invitations for this company with their assessment results
    const invitations = await prisma.invitation.findMany({
      where: whereClause,
      include: {
        assessmentResults: {
          orderBy: { completedAt: 'desc' },
          take: 1 // Get the most recent assessment for each invitation
        }
      },
      orderBy: { completedAt: 'desc' }
    });
    
    // Transform invitations into individual results
    const individualResults = await Promise.all(
      invitations.map(async (invitation) => {
        // Extract campaign name from URL if present
        let campaignName = null;
        if (invitation.inviteUrl) {
          // Try new format first: /assessment/campaignCode
          const newFormatMatch = invitation.inviteUrl.match(/\/assessment\/([a-zA-Z0-9]+)/);
          if (newFormatMatch) {
            // Get campaign by code from metadata
            const campaigns = await prisma.campaign.findMany({
              where: { companyId: company.id }
            });
            
            for (const campaign of campaigns) {
              if (campaign.description) {
                try {
                  const metadata = JSON.parse(campaign.description);
                  if (metadata.campaignCode === newFormatMatch[1]) {
                    campaignName = campaign.name;
                    break;
                  }
                } catch {}
              }
            }
          }
          
          // Fallback to old format: campaign=name
          if (!campaignName) {
            const oldFormatMatch = invitation.inviteUrl.match(/campaign=([^&]+)/);
            if (oldFormatMatch) {
              campaignName = decodeURIComponent(oldFormatMatch[1]);
            }
          }
        }
        
        // Get assessment data if available
        const latestAssessment = invitation.assessmentResults?.[0];
        
        return {
          id: invitation.id,
          participantName: invitation.name || invitation.email.split('@')[0],
          participantEmail: invitation.email,
          assessmentType: latestAssessment?.toolName || 'HR Partnership Assessment',
          campaignName,
          completedAt: invitation.completedAt?.toISOString() || null,
          status: invitation.status,
          inviteCode: invitation.inviteCode,
          // Include actual assessment data if needed
          department: (latestAssessment?.responses as any)?.department || 
                     (latestAssessment?.userProfile as any)?.department || null,
          teamSize: (latestAssessment?.responses as any)?.teamSize || null,
          hasResults: !!latestAssessment,
          assessmentId: latestAssessment?.id || null
        };
      })
    );
    
    return NextResponse.json({ results: individualResults });
    
  } catch (error) {
    console.error('[results-individuals] Error fetching individual results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch individual results' },
      { status: 500 }
    );
  }
}