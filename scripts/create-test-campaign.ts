import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestCampaign() {
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
    
    // Create the campaign
    const campaign = await prisma.campaign.create({
      data: {
        name: 'August - HR Partnership Assessment',
        description: 'HR Partnership Assessment campaign for August',
        companyId: company.id,
        status: 'ACTIVE',
        startDate: new Date('2025-08-11'),
        endDate: new Date('2025-08-26')
      }
    });
    
    console.log('✅ Created test campaign:', campaign.name);
    console.log('   Status:', campaign.status);
    console.log('   Company:', company.name);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCampaign();