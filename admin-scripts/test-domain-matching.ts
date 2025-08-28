/**
 * Script to test domain matching logic for organizations
 * Run with: DATABASE_URL="your_database_url" npx tsx admin-scripts/test-domain-matching.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDomainMatching() {
  console.log('🧪 Testing domain matching logic\n');
  
  try {
    // Test emails to check
    const testEmails = [
      'steve@getcampfire.com',
      'marinne@getcampfire.com',
      'john@gosolo.com',
      'jane@example.com',
      'admin@cnh.com',
      'user@bcausemarket.com'
    ];
    
    console.log('📧 Test emails:');
    testEmails.forEach(email => console.log(`   - ${email}`));
    console.log();
    
    // Get all companies with domains
    const companies = await prisma.company.findMany({
      where: {
        domains: {
          isEmpty: false
        }
      }
    });
    
    console.log('🏢 Organizations with domains:');
    companies.forEach(company => {
      console.log(`   - ${company.name}: ${company.domains.join(', ')}`);
    });
    console.log();
    
    // Test each email
    console.log('🔍 Domain matching results:');
    for (const email of testEmails) {
      const emailDomain = '@' + email.split('@')[1];
      
      const matchingCompany = await prisma.company.findFirst({
        where: {
          domains: {
            has: emailDomain
          }
        }
      });
      
      if (matchingCompany) {
        console.log(`   ✅ ${email} → ${matchingCompany.name} (matched ${emailDomain})`);
      } else {
        console.log(`   ❌ ${email} → No matching organization for ${emailDomain}`);
      }
    }
    
    console.log('\n📝 Summary:');
    console.log('   - Users with matching domains will auto-join their organization');
    console.log('   - Users without matching domains will need invitations');
    console.log('   - Make sure to set CLERK_WEBHOOK_SECRET in .env.local');
    console.log('   - Configure webhook endpoint in Clerk: /api/webhooks/clerk');
    
  } catch (error) {
    console.error('❌ Error testing domain matching:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDomainMatching().catch(console.error);