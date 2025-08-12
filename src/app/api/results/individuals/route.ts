import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from '@/lib/auth-helpers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get('campaignId');
    
    // Get authenticated user
    const user = await getServerSession();
    const email = user?.email || searchParams.get('email'); // Fallback for backwards compatibility
    
    if (!email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
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
    
    // Get all invitations for this company
    const invitations = await prisma.invitation.findMany({
      where: whereClause,
      orderBy: { completedAt: 'desc' }
    });
    
    // Transform invitations into individual results
    const individualResults = await Promise.all(
      invitations.map(async (invitation) => {
        // Extract campaign name from URL if present
        let campaignName = null;
        if (invitation.inviteUrl) {
          const match = invitation.inviteUrl.match(/campaign=([^&]+)/);
          if (match) {
            campaignName = decodeURIComponent(match[1]);
          }
        }
        
        return {
          id: invitation.id,
          participantName: invitation.name || invitation.email.split('@')[0],
          participantEmail: invitation.email,
          assessmentType: 'HR Partnership Assessment', // Would be dynamic
          campaignName,
          completedAt: invitation.completedAt?.toISOString() || null,
          status: invitation.status,
          inviteCode: invitation.inviteCode
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