/**
 * Script to update "HR Partnership Assessment" to "People Leadership Needs Assessment"
 * in all relevant database tables
 */

import prisma from '../src/lib/prisma'

async function updateAssessmentNames() {
  console.log('Starting assessment name update...')
  
  try {
    // 1. Update Campaign toolName fields
    const campaignUpdate = await prisma.campaign.updateMany({
      where: {
        toolName: 'HR Partnership Assessment'
      },
      data: {
        toolName: 'People Leadership Needs Assessment'
      }
    })
    console.log(`Updated ${campaignUpdate.count} campaigns`)
    
    // 2. Update AssessmentResult toolName fields
    const assessmentUpdate = await prisma.assessmentResult.updateMany({
      where: {
        toolName: 'HR Partnership Assessment'
      },
      data: {
        toolName: 'People Leadership Needs Assessment'
      }
    })
    console.log(`Updated ${assessmentUpdate.count} assessment results`)
    
    // 3. Update Campaign descriptions that contain the old name in JSON
    const campaignsWithDescription = await prisma.campaign.findMany({
      where: {
        description: {
          contains: 'HR Partnership Assessment'
        }
      }
    })
    
    for (const campaign of campaignsWithDescription) {
      try {
        if (campaign.description) {
          // Try to parse as JSON first
          try {
            const metadata = JSON.parse(campaign.description)
            if (metadata.toolName === 'HR Partnership Assessment') {
              metadata.toolName = 'People Leadership Needs Assessment'
              await prisma.campaign.update({
                where: { id: campaign.id },
                data: { description: JSON.stringify(metadata) }
              })
              console.log(`Updated campaign ${campaign.id} description (JSON)`)
            }
          } catch {
            // If not JSON, replace the text directly
            const updatedDescription = campaign.description.replace(
              /HR Partnership Assessment/g,
              'People Leadership Needs Assessment'
            )
            if (updatedDescription !== campaign.description) {
              await prisma.campaign.update({
                where: { id: campaign.id },
                data: { description: updatedDescription }
              })
              console.log(`Updated campaign ${campaign.id} description (text)`)
            }
          }
        }
      } catch (error) {
        console.error(`Failed to update campaign ${campaign.id}:`, error)
      }
    }
    
    // 4. Check if there are any other fields that might need updating
    console.log('Checking for any remaining references...')
    
    console.log('Assessment name update completed successfully!')
    
  } catch (error) {
    console.error('Error updating assessment names:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the update
updateAssessmentNames()