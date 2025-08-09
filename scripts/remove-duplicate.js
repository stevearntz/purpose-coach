const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeDuplicate() {
  try {
    // Find all invitations for steve@getcampfire.com
    const invitations = await prisma.invitation.findMany({
      where: { email: 'steve@getcampfire.com' },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log(`Found ${invitations.length} invitations for steve@getcampfire.com`);
    
    if (invitations.length > 1) {
      // Keep the first one, delete the rest
      const toDelete = invitations.slice(1);
      
      for (const inv of toDelete) {
        // Delete metadata first if exists
        await prisma.invitationMetadata.deleteMany({
          where: { invitationId: inv.id }
        });
        
        // Delete invitation
        await prisma.invitation.delete({
          where: { id: inv.id }
        });
        
        console.log(`Deleted duplicate invitation: ${inv.id}`);
      }
      
      console.log(`Removed ${toDelete.length} duplicate(s)`);
    }
  } catch (error) {
    console.error('Error removing duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeDuplicate();