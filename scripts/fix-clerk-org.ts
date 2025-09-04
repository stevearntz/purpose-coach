import { clerkClient } from '@clerk/nextjs/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixClerkOrg() {
  console.log('🔧 Fixing Clerk Organization Setup\n');
  
  try {
    const client = await clerkClient();
    
    // 1. List all existing organizations in Clerk
    console.log('📋 Existing Clerk Organizations:');
    const orgs = await client.organizations.getOrganizationList({ limit: 100 });
    
    if (orgs.data.length === 0) {
      console.log('   No organizations found in Clerk');
    } else {
      orgs.data.forEach((org: any) => {
        console.log(`   - ${org.name} (ID: ${org.id})`);
      });
    }
    console.log('');
    
    // 2. Check if Campfire org exists
    const campfireOrg = orgs.data.find((org: any) => org.name === 'Campfire');
    
    if (campfireOrg) {
      console.log('✅ Campfire organization exists in Clerk');
      console.log(`   ID: ${campfireOrg.id}`);
      
      // Update database with correct ID
      const company = await prisma.company.update({
        where: { name: 'Campfire' },
        data: { clerkOrgId: campfireOrg.id }
      });
      
      console.log('✅ Updated database with correct Clerk Org ID');
    } else {
      console.log('❌ Campfire organization not found in Clerk');
      console.log('🔨 Creating Campfire organization in Clerk...');
      
      // Create the organization
      const newOrg = await client.organizations.createOrganization({
        name: 'Campfire',
        slug: 'campfire',
        publicMetadata: {
          domains: ['@getcampfire.com']
        }
      });
      
      console.log('✅ Created Campfire organization in Clerk');
      console.log(`   ID: ${newOrg.id}`);
      
      // Update database with new ID
      const company = await prisma.company.update({
        where: { name: 'Campfire' },
        data: { clerkOrgId: newOrg.id }
      });
      
      console.log('✅ Updated database with new Clerk Org ID');
    }
    
    // 3. Verify the setup
    console.log('\n📊 Final Setup:');
    const finalCompany = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    });
    
    console.log(`   Company: ${finalCompany?.name}`);
    console.log(`   Database ID: ${finalCompany?.id}`);
    console.log(`   Clerk Org ID: ${finalCompany?.clerkOrgId}`);
    console.log(`   Domains: ${finalCompany?.domains.join(', ')}`);
    
    console.log('\n✨ Setup complete! Users with @getcampfire.com emails will now be auto-assigned.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixClerkOrg();