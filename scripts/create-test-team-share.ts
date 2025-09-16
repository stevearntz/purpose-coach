#!/usr/bin/env npx tsx

import prisma from '../src/lib/prisma'

async function createTestTeamShare() {
  console.log('🚀 Creating test team share campaign with results\n')
  console.log('=' .repeat(60))
  
  try {
    // Get Steve's profile (the manager)
    const steve = await prisma.userProfile.findFirst({
      where: { 
        email: 'steve.arntz@getcampfire.com'
      }
    })
    
    if (!steve) {
      console.log('❌ Steve not found. Please run setup script first.')
      return
    }
    
    console.log('👤 Manager: Steve Arntz')
    console.log('   Email:', steve.email)
    console.log('   User ID:', steve.clerkUserId, '\n')
    
    // Get company
    const company = await prisma.company.findFirst({
      where: { clerkOrgId: 'org_31IuAOPrNHNfhSHyWeUFjIccpeK' }
    })
    
    if (!company) {
      console.log('❌ Company not found')
      return
    }
    
    // Create a TEAM_SHARE campaign
    console.log('📊 Creating team share campaign...')
    const campaignCode = 'TEST' + Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const campaign = await prisma.campaign.create({
      data: {
        name: 'Q4 Leadership Assessment',
        toolName: 'People Leadership Needs Assessment',
        toolPath: '/people-leader-needs',
        campaignCode,
        campaignLink: `http://localhost:3000/people-leader-needs?inviteCode=${campaignCode}`,
        status: 'ACTIVE',
        campaignType: 'TEAM_SHARE',
        createdBy: steve.clerkUserId!,
        companyId: company.id,
        description: JSON.stringify({
          message: 'Please complete this assessment to help us understand your leadership needs',
          toolId: 'people-leader-needs',
          toolName: 'People Leadership Needs Assessment'
        })
      }
    })
    
    console.log('✅ Campaign created:', campaign.name)
    console.log('   Code:', campaignCode, '\n')
    
    // Create team members who completed the assessment
    const teamMembers = [
      { name: 'Sarah Connor', email: 'sarah.connor@getcampfire.com' },
      { name: 'John McClane', email: 'john.mcclane@getcampfire.com' },
      { name: 'Ellen Ripley', email: 'ellen.ripley@getcampfire.com' }
    ]
    
    console.log('👥 Creating team member responses...\n')
    
    // First, create a single shared invitation for the campaign (like a generic link)
    const sharedInvitation = await prisma.invitation.create({
      data: {
        email: 'team@getcampfire.com',  // Generic email for team share
        name: 'Team Share',
        companyId: company.id,
        inviteCode: campaignCode,
        inviteUrl: campaign.campaignLink,
        status: 'SENT'  // Mark as sent since it's a share link
      }
    })
    
    for (let i = 0; i < teamMembers.length; i++) {
      const member = teamMembers[i]
      
      // Create assessment result with realistic data
      const challengeCategories = ['performance', 'leadership', 'compliance']
      const selectedCategory = challengeCategories[Math.floor(Math.random() * 3)]
      
      const categoryDetails: any = {}
      
      if (selectedCategory === 'performance') {
        categoryDetails.performance = {
          challenges: ['Managing underperformers', 'High performer growth', 'Coaching and feedback']
        }
      } else if (selectedCategory === 'leadership') {
        categoryDetails.leadership = {
          challenges: ['Leading through ambiguity', 'Decision-making', 'Managing change']
        }
      } else {
        categoryDetails.compliance = {
          challenges: ['Regulatory compliance', 'Documentation', 'Feedback and terminations']
        }
      }
      
      const skillGaps = [
        ['Feedback', 'Coaching', 'Alignment', 'Decision making'],
        ['Strategic thinking', 'Data analysis', 'Collaboration', 'Change management'],
        ['Communication', 'Delegation', 'Conflict resolution', 'Time management']
      ][Math.floor(Math.random() * 3)]
      
      const supportNeeds = [
        ['Compensation questions', 'Day-to-day people issues', 'Mental health resources'],
        ['Team dynamics', 'Performance management', 'Career development planning'],
        ['Budget planning', 'Hiring and onboarding', 'Policy clarification']
      ][Math.floor(Math.random() * 3)]
      
      const priorities = [
        ['revenue', 'strategy'],
        ['culture', 'operations'],
        ['innovation', 'customer']
      ][Math.floor(Math.random() * 3)]
      
      await prisma.assessmentResult.create({
        data: {
          invitationId: sharedInvitation.id,  // Use the shared invitation
          toolId: 'people-leader-needs',
          toolName: 'People Leadership Needs Assessment',
          userName: member.name,
          userEmail: member.email,
          company: company.name,
          responses: {
            name: member.name,
            email: member.email,
            categoryDetails,
            selectedCategories: [selectedCategory],
            skillGaps,
            supportNeeds,
            selectedPriorities: priorities,
            additionalInsights: `Looking forward to improving our team's ${selectedCategory} capabilities.`
          },
          scores: {
            categoryCount: 1,
            skillGapCount: skillGaps.length,
            challengeCount: 3,
            supportNeedCount: supportNeeds.length
          },
          summary: `Manager assessment completed with ${Object.keys(categoryDetails).length} challenge areas identified`,
          insights: {
            mainChallengeAreas: Object.entries(categoryDetails).map(([cat, details]: [string, any]) => ({
              category: cat,
              subcategories: details.challenges
            })),
            skillGaps,
            supportNeeds,
            priorities
          },
          recommendations: [
            'Focus on developing core leadership competencies',
            'Seek mentorship for strategic planning',
            'Implement regular team feedback sessions'
          ],
          userProfile: {
            name: member.name,
            email: member.email,
            role: 'Manager',
            teamSize: '10-20'
          },
          completedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last week
        }
      })
      
      console.log(`   ✅ ${member.name} - Assessment completed`)
    }
    
    console.log('\n' + '=' .repeat(60))
    console.log('✅ TEST DATA CREATED SUCCESSFULLY!\n')
    console.log('📌 Summary:')
    console.log(`   • Campaign: "${campaign.name}" (${campaignCode})`)
    console.log(`   • Type: TEAM_SHARE (Manager's team share)`)
    console.log(`   • Responses: ${teamMembers.length} team members`)
    console.log('\n🎯 Next Steps:')
    console.log('   1. Log in as steve.arntz@getcampfire.com')
    console.log('   2. Go to Dashboard → Team Results')
    console.log('   3. Click on "Shared" tab to see the campaign')
    console.log('   4. Expand the card to see aggregated results!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestTeamShare()