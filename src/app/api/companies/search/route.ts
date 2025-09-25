import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

interface CompanyResult {
  id: string;
  name: string;
  logo: string | null;
}

// Validation schema
const SearchSchema = z.object({
  q: z.string().min(1).max(100)
});

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.length < 1) {
      return NextResponse.json({ companies: [] });
    }

    // Validate query parameter
    const validation = SearchSchema.safeParse({ q: query });
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid search query' }, { status: 400 });
    }
    
    // Get user's profile to check permissions
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Build where clause based on user permissions
    const whereClause: any = {
      name: {
        contains: query,
        mode: 'insensitive'
      }
    };

    // Non-admin users can only search within their own company
    if (userProfile.userType !== 'ADMIN' && userProfile.companyId) {
      whereClause.id = userProfile.companyId;
    } else if (userProfile.userType !== 'ADMIN') {
      // No company and not admin = no results
      return NextResponse.json({ companies: [] });
    }
    
    // Search for companies
    const companies = await prisma.company.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        logo: true
      },
      take: 10, // Limit results for performance
      orderBy: {
        name: 'asc'
      }
    });
    
    // Format response
    const results: CompanyResult[] = companies.map(company => ({
      id: company.id,
      name: company.name,
      logo: company.logo
    }));
    
    return NextResponse.json({ companies: results });
  } catch (error) {
    console.error('Company search error:', error);
    return NextResponse.json({ error: 'Failed to search companies' }, { status: 500 });
  }
}