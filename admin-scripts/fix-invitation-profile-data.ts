/**
 * Script to update invitation metadata with department and teamSize from assessment results
 */

import prisma from '../src/lib/prisma'

async function fixInvitationProfileData() {
  console.log('Starting invitation profile data fix...')
  
  try {
    // Find all completed invitations
    const invitations = await prisma.invitation.findMany({
      where: {
        status: 'COMPLETED'
      },
      include: {
        assessmentResults: {
          orderBy: { completedAt: 'desc' },
          take: 1
        },
        metadata: true
      }
    })
    
    console.log(`Found ${invitations.length} invitations to update`)
    
    let updatedCount = 0
    
    for (const invitation of invitations) {
      const assessment = invitation.assessmentResults[0]
      
      if (assessment && assessment.responses) {
        const responses = assessment.responses as any
        const userProfile = assessment.userProfile as any
        
        const updates: any = {}
        
        // Get department from responses or userProfile
        if (!invitation.department) {
          updates.department = responses?.department || userProfile?.department || null
        }
        
        // Get teamSize from responses or userProfile
        if (!invitation.teamSize) {
          updates.teamSize = responses?.teamSize || userProfile?.teamSize || null
        }
        
        // Update name if not present
        if (!invitation.name && (responses?.name || userProfile?.name)) {
          updates.name = responses?.name || userProfile?.name
        }
        
        if (Object.keys(updates).length > 0) {
          await prisma.invitation.update({
            where: { id: invitation.id },
            data: updates
          })
          
          console.log(`Updated invitation ${invitation.id} (${invitation.email}):`, updates)
          updatedCount++
        }
      }
    }
    
    console.log(`Profile data fix completed! Updated ${updatedCount} invitations`)
    
  } catch (error) {
    console.error('Error fixing invitation profile data:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the fix
fixInvitationProfileData()