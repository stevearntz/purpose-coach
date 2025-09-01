import prisma from '../src/lib/prisma';
import { nanoid } from 'nanoid';

async function createTestCampaign() {
  try {
    console.log('Creating People Leadership Needs Assessment campaign...\n');
    
    // Find the Campfire company
    let company = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'Campfire',
          logo: null
        }
      });
    }
    
    // Generate campaign codes
    const campaignCode = nanoid(10);
    const baseUrl = 'https://tools.getcampfire.com';
    const campaignLink = `${baseUrl}/assessment/${campaignCode}`;
    
    // Create the campaign with participants and tool info
    const campaign = await prisma.campaign.create({
      data: {
        name: 'People Leadership Needs - January 2025',
        description: 'Understand and support your leadership needs',
        companyId: company.id,
        status: 'ACTIVE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
        toolId: 'people-leader-needs',
        toolName: 'People Leadership Needs Assessment',
        toolPath: '/people-leader-needs',
        participants: ['steve.arntz@getcampfire.com'],
        campaignCode: campaignCode,
        campaignLink: campaignLink
      }
    });
    
    console.log('✅ Created test campaign:', campaign.name);
    console.log('   Status:', campaign.status);
    console.log('   Company:', company.name);
    console.log('   Tool:', campaign.toolName);
    console.log('   Path:', campaign.toolPath);
    console.log('   Participants:', campaign.participants);
    console.log('   Campaign Link:', campaignLink);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCampaign();