import prisma from '../src/lib/prisma';

async function checkMatthew() {
  const invitations = await prisma.invitation.findMany({
    where: {
      OR: [
        { email: { contains: 'matthew' } },
        { name: { contains: 'matthew', mode: 'insensitive' } }
      ]
    },
    include: {
      metadata: true,
      company: true
    }
  });
  
  console.log('Found invitations for Matthew:');
  invitations.forEach(inv => {
    console.log('---');
    console.log('Name:', inv.name);
    console.log('Email:', inv.email);
    console.log('Company:', inv.company.name);
    console.log('Department from metadata:', inv.metadata?.department || 'NOT SET');
    console.log('Role from metadata:', inv.metadata?.role || 'NOT SET');
    console.log('Has metadata?', Boolean(inv.metadata));
    if (inv.metadata) {
      console.log('Full metadata:', inv.metadata);
    }
  });
  
  await prisma.$disconnect();
}

checkMatthew();