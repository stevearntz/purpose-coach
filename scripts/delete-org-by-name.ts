#!/usr/bin/env npx tsx
import prisma from '@/lib/prisma';

async function deleteOrgByName(name: string) {
  console.log(`Looking for organization: "${name}"`);
  
  const company = await prisma.company.findFirst({
    where: { name }
  });
  
  if (company) {
    console.log('Found company:', {
      id: company.id,
      name: company.name,
      clerkOrgId: company.clerkOrgId
    });
    
    // First delete related data
    console.log('Deleting related data...');
    
    // Delete team members
    await prisma.teamMember.deleteMany({
      where: { companyId: company.id }
    });
    
    // Delete user profiles associated with this company
    await prisma.userProfile.deleteMany({
      where: { companyId: company.id }
    });
    
    // Delete invitations
    await prisma.invitation.deleteMany({
      where: { companyId: company.id }
    });
    
    // Delete campaigns
    await prisma.campaign.deleteMany({
      where: { companyId: company.id }
    });
    
    // Now delete the company
    await prisma.company.delete({
      where: { id: company.id }
    });
    
    console.log('✅ Company deleted from database');
  } else {
    console.log('❌ No company found with that name');
  }
  
  // Show remaining companies
  const remaining = await prisma.company.findMany({
    select: { name: true, clerkOrgId: true }
  });
  
  console.log('\nRemaining companies:', remaining);
}

const orgName = process.argv[2] || 'stevearntz.com';
deleteOrgByName(orgName)
  .catch(console.error)
  .finally(() => prisma.$disconnect());