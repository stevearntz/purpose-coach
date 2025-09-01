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
    // For v3 campaigns with participants array, match by email
    // For older campaigns, match by campaign name in URL
    const invitations = campaign.participants && campaign.participants.length > 0
      ? await prisma.invitation.findMany({
          where: {
            companyId: company.id,
            email: {
              in: campaign.participants
            }
          },
          include: {
            metadata: true // Include metadata for department/teamSize
          },
          orderBy: [
            { status: 'desc' }, // COMPLETED first
            { createdAt: 'desc' }
          ]
        })
      : await prisma.invitation.findMany({
          where: {
            companyId: company.id,
            inviteUrl: {
              contains: `campaign=${encodeURIComponent(campaign.name)}`
            }
          },
          include: {
            metadata: true // Include metadata for department/teamSize
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
    
    // If campaign has participants array, use that as the source of truth
    // Otherwise fall back to invitations
    const participantEmails = campaign.participants && campaign.participants.length > 0
      ? campaign.participants
      : invitations.map(inv => inv.email);
    
    // Map each participant email to their data
    const participantsWithResults = await Promise.all(
      participantEmails.map(async (email) => {
        const invitation = invitations.find(inv => inv.email === email);
        let assessmentData: any = null;
        
        // If participant completed the assessment, try to get their results
        if (invitation && invitation.status === 'COMPLETED' && metadata.toolId) {
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
        
        // Generate the individual invite link
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tools.getcampfire.com'
        const inviteLink = campaign.campaignCode && invitation?.inviteCode
          ? `${baseUrl}/assessment/${campaign.campaignCode}?invite=${invitation.inviteCode}`
          : invitation?.inviteUrl || ''
        
        return {
          id: invitation?.id || email,
          name: invitation?.name || email.split('@')[0],
          email: email,
          status: invitation?.status || 'PENDING',
          inviteCode: invitation?.inviteCode || '',
          inviteLink: inviteLink,
          completedAt: invitation?.completedAt?.toISOString() || undefined,
          startedAt: invitation?.startedAt?.toISOString() || undefined,
          sentAt: invitation?.createdAt?.toISOString() || undefined,
          department: invitation?.metadata?.department || assessmentData?.responses?.department || 'N/A',
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