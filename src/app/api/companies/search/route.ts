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
    
    // Search for companies with name containing the query
    // Using ILIKE for PostgreSQL case-insensitive search
    const companies = await prisma.$queryRaw<CompanyResult[]>`
      SELECT id, name, logo 
      FROM "Company" 
      WHERE name ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT 10
    `;
    
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