import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get full admin details
    const admin = await prisma.admin.findUnique({
      where: { id: authUser.userId },
      include: { 
        company: {
          select: {
            id: true,
            name: true,
            logo: true
            // Exclude domain field which doesn't exist in production
          }
        }
      }
    });
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Admin not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      company: admin.company?.name || null,
      companyId: admin.companyId,
      lastLogin: admin.lastLogin
    });
  } catch (error) {
    console.error('Failed to get user:', error);
    return NextResponse.json(
      { error: 'Failed to get user information' },
      { status: 500 }
    );
  }
}