import prisma from '../src/lib/prisma'

async function testAutoTeamMemberAddition() {
  console.log('Testing automatic team member addition via TEAM_SHARE campaigns...\n')
  
  // Find a TEAM_SHARE campaign
  const teamShareCampaign = await prisma.campaign.findFirst({
    where: {
      campaignType: 'TEAM_SHARE',
      createdBy: { not: null }
    }
  })
  
  if (!teamShareCampaign) {
    console.log('No TEAM_SHARE campaigns found. Please create one first.')
    return
  }
  
  console.log(`Found TEAM_SHARE campaign:`)
  console.log(`  - Name: ${teamShareCampaign.name}`)
  console.log(`  - Code: ${teamShareCampaign.campaignCode}`)
  console.log(`  - Created by: ${teamShareCampaign.createdBy}`)
  console.log()
  
  // Find the manager's profile
  const managerProfile = await prisma.userProfile.findUnique({
    where: { clerkUserId: teamShareCampaign.createdBy! }
  })
  
  if (!managerProfile) {
    console.log('Manager profile not found')
    return
  }
  
  console.log(`Manager profile:`)
  console.log(`  - Name: ${managerProfile.name}`)
  console.log(`  - ID: ${managerProfile.id}`)
  console.log()
  
  // Check existing team members for this manager
  const existingMembers = await prisma.teamMember.findMany({
    where: { managerId: managerProfile.id },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`Existing team members (${existingMembers.length}):`)
  existingMembers.forEach(member => {
    console.log(`  - ${member.name} (${member.email}) - Status: ${member.status}`)
  })
  console.log()
  
  // Check assessment results linked to this campaign
  const assessmentResults = await prisma.assessmentResult.findMany({
    where: {
      invitation: {
        inviteCode: teamShareCampaign.campaignCode
      }
    },
    include: {
      invitation: true
    }
  })
  
  console.log(`Assessment results for this campaign (${assessmentResults.length}):`)
  assessmentResults.forEach(result => {
    const profile = result.userProfile as any
    console.log(`  - ${profile?.name || result.userName} (${profile?.email || result.userEmail})`)
  })
  console.log()
  
  // Check if team members were auto-created for these assessments
  console.log('Checking for auto-created team members:')
  for (const result of assessmentResults) {
    const profile = result.userProfile as any
    const email = profile?.email || result.userEmail
    
    if (email) {
      const teamMember = await prisma.teamMember.findFirst({
        where: {
          email,
          managerId: managerProfile.id
        }
      })
      
      if (teamMember) {
        console.log(`  ✓ Team member found for ${email}`)
        
        // Check team membership
        const membership = await prisma.teamMembership.findFirst({
          where: {
            teamMemberId: teamMember.id,
            teamOwnerId: managerProfile.id
          }
        })
        
        if (membership) {
          console.log(`    - Has team membership link`)
        } else {
          console.log(`    - Missing team membership link`)
        }
      } else {
        console.log(`  ✗ No team member record for ${email}`)
      }
    }
  }
}

testAutoTeamMemberAddition()
  .catch(console.error)
  .finally(() => prisma.$disconnect())