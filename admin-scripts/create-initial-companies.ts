/**
 * Script to create initial companies
 * Run with: DATABASE_URL="your_database_url" npx tsx admin-scripts/create-initial-companies.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createInitialCompanies() {
  console.log('🏢 Creating initial companies...\n');
  
  const companies = [
    { name: 'GoSolo' },
    { name: 'CNH' },
    { name: 'BecauseMarket' }
  ];
  
  try {
    for (const company of companies) {
      try {
        const created = await prisma.company.create({
          data: {
            name: company.name
          }
        });
        console.log(`✅ Created company: ${created.name} (ID: ${created.id})`);
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Company "${company.name}" already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n📊 Final company list:');
    const allCompanies = await prisma.company.findMany({
      orderBy: { name: 'asc' }
    });
    
    allCompanies.forEach(c => {
      console.log(`  - ${c.name} (ID: ${c.id})`);
    });
    
    console.log('\n✨ Initial companies created successfully!');
    console.log('\n💡 Next steps:');
    console.log('  1. Access /admin with steve@getcampfire.com');
    console.log('  2. Manage these organizations from the admin panel');
    console.log('  3. Add users to each organization as needed');
    
  } catch (error) {
    console.error('❌ Error creating companies:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the creation
createInitialCompanies().catch(console.error);