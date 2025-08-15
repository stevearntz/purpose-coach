import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Count all records
    const [companies, invitations, campaigns] = await Promise.all([
      prisma.company.findMany({ select: { id: true, name: true }}),
      prisma.invitation.count(),
      prisma.campaign.count()
    ]);
    
    return NextResponse.json({
      companies: companies,
      companyCount: companies.length,
      invitationCount: invitations,
      campaignCount: campaigns
    });
  } catch (error) {
    console.error('Error checking data:', error);
    return NextResponse.json(
      { error: 'Failed to check data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const keepEmail = url.searchParams.get('keep');
    
    console.log('Flushing data, keeping:', keepEmail);
    
    // Start transaction to flush data
    const result = await prisma.$transaction(async (tx) => {
      // Delete all campaigns
      const campaigns = await tx.campaign.deleteMany();
      
      // Delete all invitations
      const invitations = await tx.invitation.deleteMany();
      
      // Delete all invitation metadata
      const metadata = await tx.invitationMetadata.deleteMany();
      
      // Delete all companies (no admin-specific logic needed)
      const companies = await tx.company.deleteMany();
      
      // Note: localStorage table may not exist in schema
      // const localStorage = await tx.localStorage.deleteMany();
      
      return {
        campaigns: campaigns.count,
        invitations: invitations.count,
        metadata: metadata.count,
        companies: companies.count
      };
    });
    
    return NextResponse.json({
      success: true,
      deleted: result,
      message: 'All data flushed'
    });
    
  } catch (error) {
    console.error('Error flushing data:', error);
    return NextResponse.json(
      { error: 'Failed to flush data' },
      { status: 500 }
    );
  }
}