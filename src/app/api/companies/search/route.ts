import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json({ companies: [] });
    }
    
    // Search for companies with name containing the query
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
    
    return NextResponse.json({ companies });
  } catch (error) {
    console.error('Failed to search companies:', error);
    return NextResponse.json({ error: 'Failed to search companies' }, { status: 500 });
  }
}