import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

// DELETE - Delete an organization
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id: organizationId } = await context.params;
    
    // Check if user is system admin
    const adminEmails = ['steve@getcampfire.com'];
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);
    const userEmail = user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress;
    
    if (!userEmail || !adminEmails.includes(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Get the organization
    const organization = await prisma.company.findUnique({
      where: { id: organizationId },
      include: {
        userProfiles: true,
        invitations: true
      }
    });
    
    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }
    
    // Delete from Clerk first if it has Clerk integration
    if (organization.clerkOrgId) {
      try {
        await client.organizations.deleteOrganization(organization.clerkOrgId);
        console.log(`Deleted Clerk organization: ${organization.clerkOrgId}`);
      } catch (error: any) {
        // If Clerk deletion fails with not found, continue anyway
        if (!error.message?.includes('not found')) {
          console.error('Failed to delete from Clerk:', error);
          return NextResponse.json({ 
            error: 'Failed to delete organization from Clerk. Please try again.' 
          }, { status: 500 });
        }
      }
    }
    
    // Start database transaction to delete all related data
    try {
      await prisma.$transaction(async (tx) => {
        // Delete all user profiles associated with this company
        await tx.userProfile.deleteMany({
          where: { companyId: organizationId }
        });
        
        // Delete all invitations
        await tx.invitation.deleteMany({
          where: { companyId: organizationId }
        });
        
        // Delete all invitation metadata (if not cascade deleted)
        const invitationIds = organization.invitations.map(i => i.id);
        if (invitationIds.length > 0) {
          await tx.invitationMetadata.deleteMany({
            where: { invitationId: { in: invitationIds } }
          });
        }
        
        // Delete all assessment campaigns
        await tx.assessmentCampaign.deleteMany({
          where: { companyId: organizationId }
        });
        
        // Delete the company itself
        await tx.company.delete({
          where: { id: organizationId }
        });
      });
      
      console.log(`Successfully deleted organization: ${organization.name} (${organizationId})`);
      
      return NextResponse.json({ 
        success: true,
        message: `Organization "${organization.name}" and all related data have been deleted`,
        deletedCounts: {
          userProfiles: organization.userProfiles.length,
          invitations: organization.invitations.length
        }
      });
      
    } catch (dbError: any) {
      console.error('Failed to delete from database:', dbError);
      
      // Try to recreate in Clerk if database deletion failed
      if (organization.clerkOrgId) {
        try {
          await client.organizations.createOrganization({
            name: organization.name,
            publicMetadata: {
              companyId: organization.id
            }
          });
        } catch (recreateError) {
          console.error('Failed to recreate in Clerk after DB failure:', recreateError);
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to delete organization data. The organization may be partially deleted.' 
      }, { status: 500 });
    }
    
  } catch (error: any) {
    console.error('Failed to delete organization:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to delete organization' 
    }, { status: 500 });
  }
}