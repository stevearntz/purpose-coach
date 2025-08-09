import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface CompanyResult {
  id: string;
  name: string;
  logo: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    console.log('Company search query:', query);
    
    if (!query || query.length < 1) {
      return NextResponse.json({ companies: [] });
    }
    
    // Ensure connection
    await prisma.$connect();
    
    // Search for companies - fallback to simple contains
    // This should work with any Prisma provider
    const companies = await prisma.company.findMany({
      where: {
        name: {
          contains: query
        }
      },
      select: {
        id: true,
        name: true,
        logo: true
      },
      take: 10,
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log('Found companies:', companies);
    
    return NextResponse.json({ companies });
  } catch (error: any) {
    console.error('Failed to search companies:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta
    });
    return NextResponse.json({ 
      error: 'Failed to search companies',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}