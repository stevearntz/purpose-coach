import prisma from '../src/lib/prisma';

async function flushCompanyParticipants(companyName: string) {
  try {
    console.log(`🔍 Looking for company: ${companyName}`);
    
    // Find the company
    const company = await prisma.company.findFirst({
      where: { name: companyName }
    });
    
    if (!company) {
      console.log(`❌ Company "${companyName}" not found`);
      return;
    }
    
    console.log(`✅ Found company: ${company.name} (ID: ${company.id})`);
    
    // Count existing invitations
    const invitationCount = await prisma.invitation.count({
      where: { companyId: company.id }
    });
    
    console.log(`📊 Found ${invitationCount} participants for ${companyName}`);
    
    if (invitationCount === 0) {
      console.log('No participants to delete.');
      return;
    }
    
    // Delete all invitations for this company
    const deleted = await prisma.invitation.deleteMany({
      where: { companyId: company.id }
    });
    
    console.log(`🗑️  Deleted ${deleted.count} participants for ${companyName}`);
    
    // Verify deletion
    const remaining = await prisma.invitation.count({
      where: { companyId: company.id }
    });
    
    console.log(`✅ Verification: ${remaining} participants remaining (should be 0)`);
    
  } catch (error) {
    console.error('Error flushing participants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
const companyName = process.argv[2] || 'Bonfire9';
console.log(`\n🚀 Flushing participants for: ${companyName}\n`);
flushCompanyParticipants(companyName);