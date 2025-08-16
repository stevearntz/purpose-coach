import prisma from '../src/lib/prisma';

async function flushCampaignsData() {
  try {
    console.log('🗑️  Starting to flush campaigns data...\n');

    // Get counts before deletion
    const campaignCount = await prisma.campaign.count();
    const invitationCount = await prisma.invitation.count();
    const invitationMetadataCount = await prisma.invitationMetadata.count();

    console.log('📊 Current data:');
    console.log(`   - Campaigns: ${campaignCount}`);
    console.log(`   - Invitations: ${invitationCount}`);
    console.log(`   - Invitation Metadata: ${invitationMetadataCount}`);
    console.log('');

    if (campaignCount === 0 && invitationCount === 0 && invitationMetadataCount === 0) {
      console.log('✅ No data to flush - database is already clean');
      process.exit(0);
    }

    // Delete all invitation metadata first (foreign key constraint)
    console.log('🗑️  Deleting all invitation metadata...');
    const deletedMetadata = await prisma.invitationMetadata.deleteMany({});
    console.log(`   ✓ Deleted ${deletedMetadata.count} invitation metadata records`);

    // Delete all invitations
    console.log('🗑️  Deleting all invitations...');
    const deletedInvitations = await prisma.invitation.deleteMany({});
    console.log(`   ✓ Deleted ${deletedInvitations.count} invitations`);

    // Delete all campaigns
    console.log('🗑️  Deleting all campaigns...');
    const deletedCampaigns = await prisma.campaign.deleteMany({});
    console.log(`   ✓ Deleted ${deletedCampaigns.count} campaigns`);

    console.log('\n✅ Successfully flushed all campaigns data!');

    // Verify deletion
    const finalCampaignCount = await prisma.campaign.count();
    const finalInvitationCount = await prisma.invitation.count();
    const finalMetadataCount = await prisma.invitationMetadata.count();

    console.log('\n📊 Final verification:');
    console.log(`   - Campaigns: ${finalCampaignCount}`);
    console.log(`   - Invitations: ${finalInvitationCount}`);
    console.log(`   - Invitation Metadata: ${finalMetadataCount}`);

  } catch (error) {
    console.error('❌ Error flushing campaigns data:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
flushCampaignsData();