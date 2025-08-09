import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const companies = await prisma.company.findMany({
      include: {
        _count: {
          select: {
            admins: true,
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
    const { name, logo } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }
    
    // Check if company already exists (case-insensitive)
    const existing = await prisma.company.findFirst({
      where: { 
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });
    
    if (existing) {
      return NextResponse.json({ 
        error: 'Company with this name already exists',
        company: existing 
      }, { status: 409 });
    }
    
    // Create new company
    const company = await prisma.company.create({
      data: {
        name,
        logo
      }
    });
    
    return NextResponse.json({ company }, { status: 201 });
  } catch (error) {
    console.error('Failed to create company:', error);
    return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
  }
}