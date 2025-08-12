import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Count all records
    const [admins, companies, invitations, campaigns] = await Promise.all([
      prisma.admin.findMany({ select: { email: true, name: true, companyId: true }}),
      prisma.company.findMany({ select: { id: true, name: true }}),
      prisma.invitation.count(),
      prisma.campaign.count()
    ]);
    
    return NextResponse.json({
      admins: admins,
      adminCount: admins.length,
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
      
      // Delete admins except the one to keep (if specified)
      let admins;
      if (keepEmail) {
        admins = await tx.admin.deleteMany({
          where: { email: { not: keepEmail } }
        });
      } else {
        admins = await tx.admin.deleteMany();
      }
      
      // Get the remaining admin's company (if any)
      let keepCompanyId = null;
      if (keepEmail) {
        const adminToKeep = await tx.admin.findUnique({
          where: { email: keepEmail }
        });
        keepCompanyId = adminToKeep?.companyId;
      }
      
      // Delete companies except the admin's company
      let companies;
      if (keepCompanyId) {
        companies = await tx.company.deleteMany({
          where: { id: { not: keepCompanyId } }
        });
      } else {
        companies = await tx.company.deleteMany();
      }
      
      // Note: localStorage table may not exist in schema
      // const localStorage = await tx.localStorage.deleteMany();
      
      return {
        campaigns: campaigns.count,
        invitations: invitations.count,
        metadata: metadata.count,
        admins: admins.count,
        companies: companies.count
      };
    });
    
    return NextResponse.json({
      success: true,
      deleted: result,
      message: keepEmail ? `Data flushed, kept admin: ${keepEmail}` : 'All data flushed'
    });
    
  } catch (error) {
    console.error('Error flushing data:', error);
    return NextResponse.json(
      { error: 'Failed to flush data' },
      { status: 500 }
    );
  }
}