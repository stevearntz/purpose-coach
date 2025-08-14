#!/usr/bin/env npx tsx
/**
 * Populate production database with comprehensive sample data
 * This creates realistic data for all dashboard tabs
 * Run: npx tsx admin-scripts/populate-sample-data.ts
 */

import prisma from '../src/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

// Sample names and companies for realistic data
const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 
                    'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Michael',
                    'Sarah', 'David', 'Rachel', 'John', 'Jennifer', 'Robert', 'Lisa', 'Daniel', 'Amy', 'Christopher'];

const lastNames = ['Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
                   'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White'];

const departments = ['Engineering', 'Sales', 'Marketing', 'Product', 'Design', 'Operations', 'Finance', 'HR', 'Customer Success', 'Legal'];

const roles = ['Software Engineer', 'Sales Manager', 'Marketing Director', 'Product Manager', 'UX Designer', 
               'Operations Lead', 'Financial Analyst', 'HR Business Partner', 'Customer Success Manager', 'Legal Counsel',
               'Senior Developer', 'Account Executive', 'Content Strategist', 'Data Scientist', 'DevOps Engineer'];

const challenges = [
  'Improving team communication',
  'Managing remote work effectively', 
  'Balancing work and personal life',
  'Developing leadership skills',
  'Navigating organizational change',
  'Building stronger relationships',
  'Increasing productivity',
  'Managing stress and burnout',
  'Career advancement',
  'Conflict resolution'
];

const tools = ['purpose', 'values', 'strengths', 'trust-audit', 'burnout-assessment', 'team-charter', 'connection-sorter'];

async function populateSampleData() {
  console.log('🚀 Starting sample data population for production...')
  console.log('=' .repeat(60))
  
  try {
    // Get the Campfire company
    const company = await prisma.company.findFirst({
      where: { name: 'Campfire' }
    })
    
    if (!company) {
      console.error('❌ Campfire company not found. Please ensure the admin user exists first.')
      return
    }
    
    console.log('✅ Found Campfire company:', company.id)
    
    // Get the admin user
    const admin = await prisma.admin.findFirst({
      where: { email: 'steve@getcampfire.com' }
    })
    
    if (!admin) {
      console.error('❌ Admin user not found')
      return
    }
    
    console.log('✅ Found admin user:', admin.email)
    
    // 1. CREATE INVITATIONS (Users Tab)
    console.log('\n📧 Creating invitations...')
    const invitations = []
    const statuses = ['PENDING', 'SENT', 'OPENED', 'STARTED', 'COMPLETED']
    
    for (let i = 0; i < 25; i++) {
      const firstName = firstNames[i % firstNames.length]
      const lastName = lastNames[i % lastNames.length]
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
      const status = statuses[Math.min(i, statuses.length - 1)]
      
      const invitation = await prisma.invitation.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          inviteCode: uuidv4().substring(0, 8),
          inviteUrl: `https://tools.getcampfire.com/start?code=${uuidv4().substring(0, 8)}`,
          status: status as any,
          personalMessage: i % 3 === 0 ? `Hi ${firstName}, excited to have you join our culture transformation journey!` : null,
          companyId: company.id,
          adminId: admin.id,
          createdAt: new Date(Date.now() - (25 - i) * 24 * 60 * 60 * 1000), // Stagger creation dates
          sentAt: ['SENT', 'OPENED', 'STARTED', 'COMPLETED'].includes(status) 
            ? new Date(Date.now() - (24 - i) * 24 * 60 * 60 * 1000) 
            : null,
          openedAt: ['OPENED', 'STARTED', 'COMPLETED'].includes(status)
            ? new Date(Date.now() - (23 - i) * 24 * 60 * 60 * 1000)
            : null,
          startedAt: ['STARTED', 'COMPLETED'].includes(status)
            ? new Date(Date.now() - (22 - i) * 24 * 60 * 60 * 1000)
            : null,
          completedAt: status === 'COMPLETED'
            ? new Date(Date.now() - (20 - i) * 24 * 60 * 60 * 1000)
            : null,
          currentStage: status === 'STARTED' ? `Step ${(i % 3) + 1} of 5` : null
        }
      })
      
      // Add metadata for some invitations
      if (i < 15) {
        await prisma.invitationMetadata.create({
          data: {
            invitationId: invitation.id,
            role: roles[i % roles.length],
            challenges: challenges.slice(i % 3, (i % 3) + 3),
            toolsAccessed: status === 'COMPLETED' ? tools.slice(0, (i % 4) + 1) : [],
            accountCreated: ['STARTED', 'COMPLETED'].includes(status),
            accountEmail: ['STARTED', 'COMPLETED'].includes(status) ? email : null
          }
        })
      }
      
      invitations.push(invitation)
    }
    
    console.log(`✅ Created ${invitations.length} invitations`)
    
    // 2. CREATE CAMPAIGNS
    console.log('\n🎯 Creating campaigns...')
    const campaigns = []
    const campaignNames = [
      'Q1 2024 Culture Assessment',
      'Leadership Development Program',
      'Team Effectiveness Initiative',
      'Annual Engagement Survey',
      'New Manager Onboarding'
    ]
    
    for (let i = 0; i < 5; i++) {
      const participantCount = 5 + (i * 3)
      const selectedInvitations = invitations.slice(i * 5, (i * 5) + participantCount)
      
      const campaign = await prisma.campaign.create({
        data: {
          name: campaignNames[i],
          description: `${campaignNames[i]} - Building stronger teams and culture`,
          status: i === 0 ? 'active' : i === 4 ? 'draft' : 'completed',
          companyId: company.id,
          createdBy: admin.id,
          participantEmails: selectedInvitations.map(inv => inv.email),
          participantNames: selectedInvitations.map(inv => inv.name || ''),
          totalParticipants: participantCount,
          completedParticipants: i === 4 ? 0 : Math.floor(participantCount * (0.6 + (i * 0.1))),
          createdAt: new Date(Date.now() - (30 - (i * 5)) * 24 * 60 * 60 * 1000),
          launchedAt: i !== 4 ? new Date(Date.now() - (25 - (i * 5)) * 24 * 60 * 60 * 1000) : null,
          completedAt: i > 0 && i < 4 ? new Date(Date.now() - (10 - (i * 2)) * 24 * 60 * 60 * 1000) : null
        }
      })
      
      campaigns.push(campaign)
      
      // Link invitations to campaign
      for (const invitation of selectedInvitations) {
        await prisma.campaignInvitation.create({
          data: {
            campaignId: campaign.id,
            invitationId: invitation.id
          }
        })
      }
    }
    
    console.log(`✅ Created ${campaigns.length} campaigns`)
    
    // 3. CREATE ASSESSMENT RESULTS
    console.log('\n📊 Creating assessment results...')
    let resultsCount = 0
    
    for (const invitation of invitations.filter(inv => inv.status === 'COMPLETED')) {
      // Purpose assessment results
      await prisma.assessmentResult.create({
        data: {
          invitationId: invitation.id,
          toolId: 'purpose',
          toolName: 'Purpose Discovery',
          data: {
            purpose: "To inspire and empower others to reach their full potential",
            values: ["Growth", "Authenticity", "Impact", "Connection", "Innovation"],
            strengths: ["Strategic Thinking", "Communication", "Empathy", "Problem Solving"],
            score: 85 + Math.floor(Math.random() * 15)
          },
          completedAt: invitation.completedAt || new Date()
        }
      })
      
      // Values assessment results
      await prisma.assessmentResult.create({
        data: {
          invitationId: invitation.id,
          toolId: 'values',
          toolName: 'Values Assessment',
          data: {
            coreValues: ["Integrity", "Excellence", "Collaboration", "Innovation", "Respect"],
            alignment: 78 + Math.floor(Math.random() * 20),
            conflicts: ["Work-life balance", "Speed vs Quality"],
            recommendations: ["Focus on team collaboration", "Prioritize value-driven decisions"]
          },
          completedAt: invitation.completedAt || new Date()
        }
      })
      
      // Trust audit results
      if (Math.random() > 0.3) {
        await prisma.assessmentResult.create({
          data: {
            invitationId: invitation.id,
            toolId: 'trust-audit',
            toolName: 'Trust Audit',
            data: {
              trustScore: 70 + Math.floor(Math.random() * 25),
              dimensions: {
                credibility: 85,
                reliability: 78,
                intimacy: 72,
                selfOrientation: 65
              },
              strengths: ["Consistent delivery", "Technical expertise"],
              improvements: ["Increase vulnerability", "Better follow-through"]
            },
            completedAt: invitation.completedAt || new Date()
          }
        })
      }
      
      // Burnout assessment results
      if (Math.random() > 0.5) {
        await prisma.assessmentResult.create({
          data: {
            invitationId: invitation.id,
            toolId: 'burnout-assessment',
            toolName: 'Burnout Assessment',
            data: {
              burnoutRisk: ['Low', 'Moderate', 'High'][Math.floor(Math.random() * 3)],
              exhaustionLevel: 3 + Math.floor(Math.random() * 7),
              engagementLevel: 4 + Math.floor(Math.random() * 6),
              stressors: ["Workload", "Deadlines", "Unclear expectations"],
              recommendations: ["Take regular breaks", "Set boundaries", "Seek support"]
            },
            completedAt: invitation.completedAt || new Date()
          }
        })
      }
      
      resultsCount += 2 + (Math.random() > 0.3 ? 1 : 0) + (Math.random() > 0.5 ? 1 : 0)
    }
    
    console.log(`✅ Created ${resultsCount} assessment results`)
    
    // 4. CREATE AI RECOMMENDATIONS
    console.log('\n🤖 Creating AI recommendations...')
    const recommendations = []
    
    const recTemplates = [
      {
        title: "Enhance Team Communication",
        description: "Based on assessment results, improving team communication could significantly boost productivity and morale.",
        priority: "high",
        category: "Team Dynamics",
        actionItems: [
          "Implement weekly team check-ins",
          "Create shared communication guidelines",
          "Use collaboration tools more effectively"
        ]
      },
      {
        title: "Leadership Development Opportunity",
        description: "Several team members show strong leadership potential and would benefit from formal development.",
        priority: "medium",
        category: "Leadership",
        actionItems: [
          "Enroll high-potentials in leadership training",
          "Create mentorship programs",
          "Provide stretch assignments"
        ]
      },
      {
        title: "Address Burnout Risk",
        description: "Multiple team members showing signs of burnout. Immediate intervention recommended.",
        priority: "high",
        category: "Wellbeing",
        actionItems: [
          "Review workload distribution",
          "Implement flexible work policies",
          "Provide mental health resources"
        ]
      },
      {
        title: "Strengthen Company Culture",
        description: "Opportunity to better align individual values with company mission.",
        priority: "medium",
        category: "Culture",
        actionItems: [
          "Clarify company values and mission",
          "Create culture champions program",
          "Celebrate wins more frequently"
        ]
      },
      {
        title: "Improve Onboarding Process",
        description: "New hires taking longer than expected to reach full productivity.",
        priority: "low",
        category: "Operations",
        actionItems: [
          "Create comprehensive onboarding checklist",
          "Assign dedicated buddies",
          "Schedule 30/60/90 day check-ins"
        ]
      }
    ]
    
    for (let i = 0; i < campaigns.length - 1; i++) {
      const campaign = campaigns[i]
      const template = recTemplates[i % recTemplates.length]
      
      await prisma.recommendation.create({
        data: {
          campaignId: campaign.id,
          companyId: company.id,
          title: template.title,
          description: template.description,
          priority: template.priority as any,
          category: template.category,
          actionItems: template.actionItems,
          status: i === 0 ? 'in_progress' : i === 1 ? 'completed' : 'pending',
          impact: ['high', 'medium', 'low'][i % 3] as any,
          effort: ['low', 'medium', 'high'][i % 3] as any,
          createdAt: new Date(Date.now() - (20 - (i * 4)) * 24 * 60 * 60 * 1000)
        }
      })
    }
    
    console.log(`✅ Created ${recTemplates.length} AI recommendations`)
    
    // 5. Add some aggregate stats
    console.log('\n📈 Creating aggregate statistics...')
    
    // Summary stats
    const stats = {
      totalInvitations: invitations.length,
      completedAssessments: invitations.filter(i => i.status === 'COMPLETED').length,
      activeCampaigns: campaigns.filter(c => c.status === 'active').length,
      totalRecommendations: recTemplates.length,
      averageEngagement: '76%',
      topTools: ['Purpose Discovery', 'Values Assessment', 'Trust Audit']
    }
    
    console.log('\n✨ Sample Data Population Complete!')
    console.log('=' .repeat(60))
    console.log('Summary:')
    console.log(`  • ${stats.totalInvitations} Invitations created`)
    console.log(`  • ${campaigns.length} Campaigns launched`)
    console.log(`  • ${resultsCount} Assessment results`)
    console.log(`  • ${stats.totalRecommendations} AI recommendations`)
    console.log(`  • ${stats.completedAssessments} Completed assessments`)
    console.log('\n🎉 Your dashboard should now be fully populated!')
    console.log('Visit: https://tools.getcampfire.com/dashboard')
    
  } catch (error) {
    console.error('❌ Error populating data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the population
populateSampleData().catch(console.error)