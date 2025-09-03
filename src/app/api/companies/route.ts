import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check their company
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Only return companies the user has access to
    // Admin users could see all, regular users only see their own
    const whereClause = userProfile.clerkRole === 'admin' 
      ? {} 
      : userProfile.companyId 
        ? { id: userProfile.companyId }
        : { id: 'no-access' }; // Ensures no results if user has no company

    const companies = await prisma.company.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            invitations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json({ error: 'Failed to fetch companies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile to check permissions
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Only admins can create companies
    if (userProfile.clerkRole !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { name, logo } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    
    // Check if company already exists
    const existingCompany = await prisma.company.findUnique({
      where: { name }
    });
    
    if (existingCompany) {
      return NextResponse.json({ error: 'Company already exists' }, { status: 400 });
    }
    
    const company = await prisma.company.create({
      data: {
        name,
        logo: logo || null,
        domains: [] // Initialize with empty domains array
      }
    });
    
    return NextResponse.json({ company });
  } catch (error) {
    console.error('Failed to create company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}