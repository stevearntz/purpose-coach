/**
 * Script to set up admin user with correct password
 * Run with: npx tsx scripts/setup-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupAdmin() {
  const email = 'steve@getcampfire.com';
  const password = 'Campfire2024!';
  const name = 'Steve Arntz';
  
  console.log('🔧 Setting up admin user:', email);
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });
    
    if (existingAdmin) {
      // Update existing admin
      console.log('📝 Updating existing admin user...');
      await prisma.admin.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: name
        }
      });
      console.log('✅ Admin password updated!');
    } else {
      // Create new admin
      console.log('🆕 Creating new admin user...');
      
      // First, get or create a company
      let company = await prisma.company.findFirst({
        where: {
          name: { contains: 'Campfire' }
        }
      });
      
      if (!company) {
        company = await prisma.company.create({
          data: {
            name: 'Campfire',
            logo: null
          }
        });
        console.log('🏢 Created company:', company.name);
      }
      
      // Create admin
      await prisma.admin.create({
        data: {
          email,
          password: hashedPassword,
          name,
          companyId: company.id
        }
      });
      console.log('✅ Admin user created!');
    }
    
    console.log('\n📋 Login credentials:');
    console.log('   Email:', email);
    console.log('   Password:', password);
    console.log('\n🚀 You can now login at: https://tools.getcampfire.com/login');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupAdmin().catch(console.error);