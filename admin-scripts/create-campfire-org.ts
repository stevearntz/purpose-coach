/**
 * Script to create Campfire organization with domain
 * Run with: DATABASE_URL="your_database_url" npx tsx admin-scripts/create-campfire-org.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCampfireOrg() {
  console.log('🔥 Creating Campfire organization with domain\n');
  
  try {
    // Check if Campfire already exists
    const existing = await prisma.company.findUnique({
      where: { name: 'Campfire' }
    });
    
    if (existing) {
      // Update with domains
      const updated = await prisma.company.update({
        where: { id: existing.id },
        data: {
          domains: ['@getcampfire.com']
        }
      });
      console.log('✅ Updated existing Campfire organization with domain');
      console.log(`   - ID: ${updated.id}`);
      console.log(`   - Name: ${updated.name}`);
      console.log(`   - Domains: ${updated.domains.join(', ')}`);
    } else {
      // Create new
      const created = await prisma.company.create({
        data: {
          name: 'Campfire',
          logo: 'https://getcampfire.com/logo.png',
          domains: ['@getcampfire.com']
        }
      });
      console.log('✅ Created Campfire organization');
      console.log(`   - ID: ${created.id}`);
      console.log(`   - Name: ${created.name}`);
      console.log(`   - Domains: ${created.domains.join(', ')}`);
    }
    
    console.log('\n📝 Next steps:');
    console.log('   1. Go to Clerk Dashboard > Webhooks');
    console.log('   2. Create endpoint: https://your-domain.com/api/webhooks/clerk');
    console.log('   3. Select events: user.created, session.created');
    console.log('   4. Copy the signing secret to CLERK_WEBHOOK_SECRET in .env.local');
    console.log('   5. Create the Campfire org in Clerk through /admin/organizations');
    console.log('\nOnce set up, any user signing up with @getcampfire.com will auto-join!');
    
  } catch (error) {
    console.error('❌ Error creating Campfire org:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createCampfireOrg().catch(console.error);