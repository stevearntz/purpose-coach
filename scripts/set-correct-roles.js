#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setCorrectRoles() {
  console.log('🔧 Setting correct user roles...\n');

  try {
    // Set steve@getcampfire.com as ADMIN
    const adminUpdate = await prisma.userProfile.update({
      where: {
        email: 'steve@getcampfire.com'
      },
      data: {
        userType: 'ADMIN'
      }
    });
    console.log(`✅ Set ${adminUpdate.email} as ADMIN`);

    // Set steve.arntz@getcampfire.com as MANAGER
    const managerUpdate = await prisma.userProfile.update({
      where: {
        email: 'steve.arntz@getcampfire.com'
      },
      data: {
        userType: 'MANAGER'
      }
    });
    console.log(`✅ Set ${managerUpdate.email} as MANAGER`);

    // Verify the changes
    const users = await prisma.userProfile.findMany({
      where: {
        email: {
          in: ['steve@getcampfire.com', 'steve.arntz@getcampfire.com']
        }
      },
      select: {
        email: true,
        userType: true
      }
    });

    console.log('\n📊 Current roles:');
    for (const user of users) {
      console.log(`   ${user.email}: ${user.userType}`);
    }

    console.log('\n📝 How this works:');
    console.log('   - steve@getcampfire.com (ADMIN): Can create HR campaigns, manage company');
    console.log('   - steve.arntz@getcampfire.com (MANAGER): Can create team shares, manage team members');
    console.log('\n💡 Note: If you need both admin AND manager features, you\'ll need to switch between accounts');
    console.log('   Future enhancement: Support multiple roles per user');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setCorrectRoles();