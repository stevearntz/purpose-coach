import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

// Types
interface Lead {
  id: string;
  email: string;
  name?: string;
  source: string;
  selectedChallenges?: string[];
  recommendedTools?: string[];
  userRole?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, source, metadata } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Create lead in PostgreSQL
    const lead = await prisma.lead.create({
      data: {
        email: email.toLowerCase(),
        name: name || null,
        source: source || 'personal-development-plan',
        toolName: metadata?.toolName || null,
        toolId: metadata?.toolId || null,
        metadata: {
          ...metadata,
          selectedChallenges: metadata?.selectedChallenges,
          recommendedTools: metadata?.recommendedTools,
          userRole: metadata?.userRole
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email,
        name: lead.name,
        source: lead.source,
        createdAt: lead.createdAt.toISOString(),
        metadata: lead.metadata
      }
    });
    
  } catch (error) {
    console.error('Failed to create lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// GET - Retrieve leads
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const source = searchParams.get('source');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const where: any = {};
    if (email) where.email = email.toLowerCase();
    if (source) where.source = source;
    
    const leads = await prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit
    });
    
    return NextResponse.json({
      success: true,
      leads: leads.map(lead => ({
        id: lead.id,
        email: lead.email,
        name: lead.name,
        source: lead.source,
        createdAt: lead.createdAt.toISOString(),
        metadata: lead.metadata
      })),
      count: leads.length
    });
    
  } catch (error) {
    console.error('Failed to retrieve leads:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve leads' },
      { status: 500 }
    );
  }
}