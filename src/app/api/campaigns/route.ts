import { NextRequest, NextResponse } from 'next/server';
import { campaignStorage } from '@/lib/campaignStorage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      toolId,
      toolName,
      toolPath,
      name,
      description,
      startDate,
      deadline,
      participants,
      settings,
      createdBy,
      companyId
    } = body;

    if (!toolId || !name || !deadline || !participants || participants.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create campaign participants with proper structure
    const campaignParticipants = participants.map((p: any) => ({
      userId: p.userId || p.email,
      email: p.email,
      name: p.name,
      status: 'invited',
      invitedAt: new Date().toISOString(),
      remindersSent: 0
    }));

    // Create the campaign
    const campaign = await campaignStorage.createCampaign({
      companyId: companyId || 'default',
      toolId,
      toolName,
      toolPath,
      name,
      description,
      status: 'active',
      createdBy: createdBy || 'system',
      createdAt: new Date().toISOString(),
      startDate: startDate || new Date().toISOString(),
      deadline,
      participants: campaignParticipants,
      settings: {
        allowLateSubmissions: settings?.allowLateSubmissions ?? true,
        sendReminders: settings?.sendReminders ?? true,
        reminderFrequency: settings?.reminderFrequency || 'weekly',
        anonymousResults: settings?.anonymousResults ?? false,
        requiredCompletion: settings?.requiredCompletion ?? false,
        reminderDays: settings?.reminderDays
      },
      tags: settings?.tags,
      customMessage: description
    });

    console.log('Campaign created:', {
      id: campaign.id,
      name: campaign.name,
      participantCount: campaign.participants.length,
      uniqueLink: campaign.uniqueLink
    });

    // In production, send email invitations here
    // For now, log the campaign link for testing
    console.log(`Campaign link: ${campaign.uniqueLink}`);
    campaign.participants.forEach(p => {
      console.log(`Invitation for ${p.email}: ${campaign.uniqueLink}`);
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('companyId');
    const campaignId = searchParams.get('id');
    const code = searchParams.get('code');

    // Get specific campaign by ID
    if (campaignId) {
      const campaign = await campaignStorage.getCampaignById(campaignId);
      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(campaign);
    }

    // Get campaign by unique code
    if (code) {
      const campaign = await campaignStorage.getCampaignByCode(code);
      if (!campaign) {
        return NextResponse.json(
          { error: 'Campaign not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(campaign);
    }

    // Get all campaigns for a company
    if (companyId) {
      const campaigns = await campaignStorage.getCompanyCampaigns(companyId);
      return NextResponse.json({ campaigns });
    }

    // Get campaigns for current user's company
    const userCompany = request.headers.get('x-company-id') || 'default';
    const campaigns = await campaignStorage.getCompanyCampaigns(userCompany);
    
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Failed to get campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to get campaigns' },
      { status: 500 }
    );
  }
}