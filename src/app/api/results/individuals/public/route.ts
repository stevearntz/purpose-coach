/**
 * Public individual results API for testing
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
        message: 'No results found'
      });
    }
    
    // Get all invitations for the company
    const invitations = await prisma.invitation.findMany({
      where: {
        companyId: admin.company.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Map invitations to individual results format
    const results = invitations.map(invitation => {
      // Parse campaign name from URL if present
      let campaignName = 'Direct Invitation';
      if (invitation.inviteUrl) {
        const urlParams = new URLSearchParams(invitation.inviteUrl.split('?')[1] || '');
        campaignName = urlParams.get('campaign') || 'Direct Invitation';
      }
      
      // Determine assessment type from URL
      let assessmentType = 'Assessment';
      if (invitation.inviteUrl) {
        if (invitation.inviteUrl.includes('/hr-partnership')) {
          assessmentType = 'HR Partnership';
        } else if (invitation.inviteUrl.includes('/trust-audit')) {
          assessmentType = 'Trust Audit';
        } else if (invitation.inviteUrl.includes('/burnout-assessment')) {
          assessmentType = 'Burnout Assessment';
        }
      }
      
      return {
        id: invitation.id,
        participantName: invitation.name || 'Unknown',
        participantEmail: invitation.email,
        department: invitation.department || 'Not specified',
        teamSize: invitation.teamSize || 'Unknown',
        assessmentType,
        campaignName,
        completedAt: invitation.completedAt?.toISOString(),
        startedAt: invitation.sentAt?.toISOString(),
        status: invitation.status === 'COMPLETED' ? 'completed' as const : 
                invitation.status === 'SENT' ? 'invited' as const : 
                'pending' as const
      };
    });
    
    return NextResponse.json({
      results,
      total: results.length
    });
    
  } catch (error) {
    console.error('[results/individuals/public] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch individual results' },
      { status: 500 }
    );
  }
}