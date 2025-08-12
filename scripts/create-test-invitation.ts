import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestInvitation() {
  try {
    // Find or create a company
    let company = await prisma.company.findFirst();
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Test Company',
          logo: null
        }
      });
    }
    
    // Create the invitation with the specific code from the URL
    const invitation = await prisma.invitation.create({
      data: {
        inviteCode: '2AvNGWQHr5',
        email: 'test@example.com',
        name: 'Test User',
        inviteUrl: 'http://localhost:3000/hr-partnership?invite=2AvNGWQHr5',
        companyId: company.id,
        status: 'SENT',
        sentAt: new Date()
      }
    });
    
    console.log('✅ Created test invitation:', invitation.inviteCode);
    console.log('   Email:', invitation.email);
    console.log('   Name:', invitation.name);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestInvitation();