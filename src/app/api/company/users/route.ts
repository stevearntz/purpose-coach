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
    
    // Admin model has been removed - no admin data available
    const admins: any[] = [];
    
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
    
    // Admin model removed - no admin data to merge
    
    // Transform to users format
    const users = Array.from(userMap.values()).map(userData => {
      // Determine status (simplified without admin data)
      let status: 'active' | 'invited' | 'created';
      if (userData.status === 'COMPLETED') {
        status = 'active';
      } else if (userData.status === 'SENT' || userData.sentAt) {
        status = 'invited';
      } else {
        status = 'created';
      }
      
      const name = userData.name || userData.email.split('@')[0];
      
      return {
        id: userData.email,
        email: userData.email,
        name: name,
        firstName: name?.split(' ')[0] || userData.email.split('@')[0],
        lastName: name?.split(' ').slice(1).join(' ') || '',
        status,
        signedUp: userData.completedAt ? userData.completedAt.toISOString() : 
                  userData.sentAt ? 'Invited' : 'Created',
        lastSignIn: null, // Admin data no longer available
        lastAssessment: null,
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
      users // Include all users, including current user
    });
  } catch (error) {
    console.error('Failed to fetch company users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}