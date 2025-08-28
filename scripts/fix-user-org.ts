/**
 * Script to manually assign a user to Campfire org and skip onboarding
 * Run with: CLERK_SECRET_KEY=sk_test_... npx tsx scripts/fix-user-org.ts <user-email>
 */

import { createClerkClient } from '@clerk/backend';

async function fixUserOrg() {
  const userEmail = process.argv[2];
  
  if (!userEmail) {
    console.log('Usage: npx tsx scripts/fix-user-org.ts <user-email>');
    return;
  }
  
  console.log(`Fixing organization for ${userEmail}...`);
  
  try {
    const client = createClerkClient({ 
      secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_NDrPCfkRsO6aMvTUUzkhMmJrNDvZpg6T5xWKliimal' 
    });
    
    // Find the user
    const users = await client.users.getUserList({
      emailAddress: [userEmail]
    });
    
    if (!users.data.length) {
      console.log('User not found');
      return;
    }
    
    const user = users.data[0];
    console.log(`Found user: ${user.id}`);
    
    // Add user to Campfire org
    const campfireOrgId = 'org_31IuAOPrNHNfhSHyWeUFjIccpeK';
    
    try {
      await client.organizations.createOrganizationMembership({
        organizationId: campfireOrgId,
        userId: user.id,
        role: 'org:member'
      });
      console.log('✅ Added to Campfire organization');
    } catch (err: any) {
      if (err.errors?.[0]?.code === 'already_a_member_in_organization') {
        console.log('Already a member of Campfire');
      } else {
        throw err;
      }
    }
    
    // Update user metadata to skip onboarding
    await client.users.updateUserMetadata(user.id, {
      publicMetadata: {
        organizationId: campfireOrgId,
        companyName: 'Campfire',
        onboardingComplete: true
      }
    });
    
    console.log('✅ Updated metadata - onboarding should be skipped');
    console.log('User can now access /dashboard directly');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

fixUserOrg();