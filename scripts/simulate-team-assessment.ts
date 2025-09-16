import prisma from '../src/lib/prisma'

async function simulateTeamAssessment() {
  console.log('Simulating assessment completion through TEAM_SHARE campaign...\n')
  
  // Find a TEAM_SHARE campaign
  const campaign = await prisma.campaign.findFirst({
    where: {
      campaignType: 'TEAM_SHARE',
      createdBy: { not: null },
      campaignCode: { not: null }
    }
  })
  
  if (!campaign) {
    console.log('No TEAM_SHARE campaigns found')
    return
  }
  
  console.log(`Using campaign: ${campaign.name} (${campaign.campaignCode})`)
  console.log(`Created by: ${campaign.createdBy}`)
  
  // Find the invitation for this campaign
  const invitation = await prisma.invitation.findFirst({
    where: {
      inviteCode: campaign.campaignCode
    }
  })
  
  if (!invitation) {
    console.log('No invitation found for this campaign')
    return
  }
  
  console.log(`Found invitation: ${invitation.id}`)
  
  // Simulate API call data
  const testEmail = `test.member.${Date.now()}@example.com`
  const testName = 'Test Team Member'
  
  console.log(`\nSimulating assessment for:`)
  console.log(`  - Name: ${testName}`)
  console.log(`  - Email: ${testEmail}`)
  
  // Call the logic directly (simulating what the API would do)
  const assessmentResult = await prisma.assessmentResult.create({
    data: {
      invitationId: invitation.id,
      toolId: 'people-leader-needs',
      toolName: 'People Leadership Needs Assessment',
      responses: {
        categoryDetails: {
          performance: { challenges: ['Goal setting'] },
          leadership: { challenges: ['Team motivation'] }
        },
        skillGaps: ['Communication', 'Delegation'],
        supportNeeds: ['Training', 'Coaching'],
        selectedPriorities: ['team', 'culture']
      },
      userProfile: {
        name: testName,
        email: testEmail,
        role: 'Team Lead'
      },
      shareId: `test_${Date.now()}`,
      userEmail: testEmail,
      userName: testName,
      company: 'Test Company'
    }
  })
  
  console.log(`\n✓ Assessment result created: ${assessmentResult.id}`)
  
  // Now check if team member should be auto-created
  if (campaign.createdBy) {
    const managerProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: campaign.createdBy }
    })
    
    if (managerProfile) {
      console.log(`\nChecking for auto-creation...`)
      console.log(`Manager profile found: ${managerProfile.id}`)
      
      // Check if team member exists
      let teamMember = await prisma.teamMember.findFirst({
        where: {
          email: testEmail,
          managerId: managerProfile.id
        }
      })
      
      if (!teamMember) {
        // Create the team member
        teamMember = await prisma.teamMember.create({
          data: {
            managerId: managerProfile.id,
            name: testName,
            email: testEmail,
            role: 'Team Lead',
            status: 'ACTIVE',
            companyId: campaign.companyId
          }
        })
        
        // Create team membership
        await prisma.teamMembership.create({
          data: {
            teamMemberId: teamMember.id,
            teamOwnerId: managerProfile.id
          }
        })
        
        console.log(`✓ Team member auto-created: ${teamMember.id}`)
        console.log(`✓ Team membership created`)
      } else {
        console.log(`Team member already exists: ${teamMember.id}`)
      }
      
      // Verify the team member was created
      const allMembers = await prisma.teamMember.findMany({
        where: { managerId: managerProfile.id }
      })
      
      console.log(`\nManager now has ${allMembers.length} team member(s):`)
      allMembers.forEach(m => {
        console.log(`  - ${m.name} (${m.email}) - Status: ${m.status}`)
      })
    }
  }
}

simulateTeamAssessment()
  .catch(console.error)
  .finally(() => prisma.$disconnect())