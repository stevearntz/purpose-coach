import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Get company from email domain
    const domain = email.split('@')[1];
    const companyName = domain.split('.')[0];
    
    // Find or create company
    let company = await prisma.company.findFirst({
      where: {
        OR: [
          { name: { contains: companyName } },
          { name: 'Campfire' } // Default to Campfire for getcampfire.com emails
        ]
      }
    });
    
    if (!company) {
      // Create company if doesn't exist
      company = await prisma.company.create({
        data: {
          name: companyName.charAt(0).toUpperCase() + companyName.slice(1)
        }
      });
    }
    
    // Get all invitations for this company
    const invitations = await prisma.invitation.findMany({
      where: { companyId: company.id },
      select: {
        email: true,
        name: true,
        status: true,
        createdAt: true,
        sentAt: true,
        completedAt: true
      }
    });
    
    // Get all admins for this company to track last login and last assessment
    const admins = await prisma.admin.findMany({
      where: { companyId: company.id },
      select: {
        email: true,
        lastLogin: true,
        lastAssessment: true
      }
    });
    
    // Transform invitations to users format
    const users = invitations.map(inv => {
      // Find corresponding admin for last login
      const admin = admins.find(a => a.email === inv.email);
      
      // Determine status: COMPLETED = active, SENT = invited, PENDING = created
      let status: 'active' | 'invited' | 'created';
      if (inv.status === 'COMPLETED') {
        status = 'active';
      } else if (inv.status === 'SENT' || inv.sentAt) {
        status = 'invited';
      } else {
        status = 'created';
      }
      
      return {
        id: inv.email,
        email: inv.email,
        name: inv.name || inv.email.split('@')[0],
        firstName: inv.name?.split(' ')[0] || inv.email.split('@')[0],
        lastName: inv.name?.split(' ').slice(1).join(' ') || '',
        status,
        signedUp: inv.completedAt ? inv.completedAt.toISOString() : 
                  inv.sentAt ? 'Invited' : 'Created',
        lastSignIn: admin?.lastLogin?.toISOString() || null,
        lastAssessment: admin?.lastAssessment?.toISOString() || null,
        role: 'user'
      };
    });
    
    // Find current user
    const currentUser = users.find(u => u.email === email) || {
      id: email,
      email,
      name: email.split('@')[0],
      firstName: email.split('@')[0],
      lastName: '',
      status: 'active',
      role: 'admin'
    };
    
    return NextResponse.json({
      company,
      currentUser,
      users: users.filter(u => u.email !== email) // Exclude current user from list
    });
  } catch (error) {
    console.error('Failed to fetch company users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}