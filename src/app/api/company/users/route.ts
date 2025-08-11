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
    
    // Get all admins for this company
    const admins = await prisma.admin.findMany({
      where: { companyId: company.id },
      select: {
        email: true,
        name: true,
        lastLogin: true,
        createdAt: true
        // lastAssessment: true // TODO: Add after migration is applied
      }
    });
    
    // Create a map of all users (combining invitations and admins)
    const userMap = new Map();
    
    // First, add all invitations
    invitations.forEach(inv => {
      userMap.set(inv.email, {
        email: inv.email,
        name: inv.name,
        status: inv.status,
        sentAt: inv.sentAt,
        completedAt: inv.completedAt,
        createdAt: inv.createdAt
      });
    });
    
    // Then, add or update with admin data
    admins.forEach(admin => {
      const existing = userMap.get(admin.email);
      if (existing) {
        // Update existing invitation with admin data
        existing.adminData = admin;
      } else {
        // Admin exists without invitation (e.g., company creator)
        userMap.set(admin.email, {
          email: admin.email,
          name: admin.name,
          status: 'COMPLETED', // If they're an admin, they're active
          completedAt: admin.createdAt,
          createdAt: admin.createdAt,
          adminData: admin
        });
      }
    });
    
    // Transform to users format
    const users = Array.from(userMap.values()).map(userData => {
      // Determine status
      let status: 'active' | 'invited' | 'created';
      if (userData.adminData || userData.status === 'COMPLETED') {
        status = 'active';
      } else if (userData.status === 'SENT' || userData.sentAt) {
        status = 'invited';
      } else {
        status = 'created';
      }
      
      const name = userData.adminData?.name || userData.name || userData.email.split('@')[0];
      
      return {
        id: userData.email,
        email: userData.email,
        name: name,
        firstName: name?.split(' ')[0] || userData.email.split('@')[0],
        lastName: name?.split(' ').slice(1).join(' ') || '',
        status,
        signedUp: userData.completedAt ? userData.completedAt.toISOString() : 
                  userData.sentAt ? 'Invited' : 'Created',
        lastSignIn: userData.adminData?.lastLogin?.toISOString() || null,
        lastAssessment: null, // TODO: userData.adminData?.lastAssessment?.toISOString() || null
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