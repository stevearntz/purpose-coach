import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentAuthUser, getUserCompany } from '@/lib/auth-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: campaignId } = await params;
    
    // Get authenticated user
    const user = await getCurrentAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get company info
    const company = await getUserCompany();
    if (!company) {
      return NextResponse.json(
        { error: 'No company access found' },
        { status: 403 }
      );
    }
    
    // Get campaign to verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });
    
    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }
    
    if (campaign.companyId !== company.id) {
      return NextResponse.json(
        { error: 'Unauthorized access to campaign' },
        { status: 403 }
      );
    }
    
    // Get all invitations for this campaign
    // We match by campaign name in the URL since that's how they're linked
    const invitations = await prisma.invitation.findMany({
      where: {
        companyId: company.id,
        inviteUrl: {
          contains: `campaign=${encodeURIComponent(campaign.name)}`
        }
      },
      orderBy: [
        { status: 'desc' }, // COMPLETED first
        { createdAt: 'desc' }
      ]
    });
    
    // Parse metadata from campaign description to get tool info
    let metadata: any = {}
    if (campaign.description) {
      try {
        metadata = JSON.parse(campaign.description)
      } catch {
        metadata = { message: campaign.description }
      }
    }
    
    // Get assessment results for completed participants if toolId is available
    const participantsWithResults = await Promise.all(
      invitations.map(async (invitation) => {
        let assessmentData: any = null;
        
        // If participant completed the assessment, try to get their results
        if (invitation.status === 'COMPLETED' && metadata.toolId) {
          // Try to find assessment result by invitation
          const result = await prisma.assessmentResult.findFirst({
            where: {
              invitationId: invitation.id,
              toolId: metadata.toolId
            },
            orderBy: {
              completedAt: 'desc'
            }
          });
          
          if (result) {
            assessmentData = {
              responses: result.responses,
              scores: result.scores,
              summary: result.summary,
              insights: result.insights,
              recommendations: result.recommendations
            };
          }
        }
        
        return {
          id: invitation.id,
          name: invitation.name || invitation.email.split('@')[0],
          email: invitation.email,
          status: invitation.status,
          inviteCode: invitation.inviteCode,
          completedAt: invitation.completedAt?.toISOString() || undefined,
          startedAt: invitation.startedAt?.toISOString() || undefined,
          sentAt: invitation.createdAt.toISOString(),
          department: assessmentData?.responses?.department || 'N/A',
          teamSize: assessmentData?.responses?.teamSize || 'N/A',
          // Include any other relevant assessment data
          assessmentData: assessmentData ? {
            completed: true,
            completedAt: assessmentData.completedAt,
            toolId: metadata.toolId,
            toolName: metadata.toolName
          } : null
        };
      })
    );
    
    return NextResponse.json({
      participants: participantsWithResults,
      campaign: {
        id: campaign.id,
        name: campaign.name,
        toolName: metadata.toolName,
        toolId: metadata.toolId
      }
    });
    
  } catch (error) {
    console.error('[campaign-participants] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch participants' },
      { status: 500 }
    );
  }
}