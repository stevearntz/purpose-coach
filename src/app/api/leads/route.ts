import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { z } from 'zod';

// Validation schemas
const CreateLeadSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().max(255).optional(),
  source: z.string().max(100).optional(),
  metadata: z.record(z.any()).optional()
});

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
// NOTE: This endpoint allows unauthenticated access for lead capture forms
// BUT includes rate limiting and validation for security
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    // Basic rate limiting check (should use Redis in production)
    // For now, we'll just validate heavily
    
    const body = await request.json();
    
    // Validate input
    const validation = CreateLeadSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.flatten() },
        { status: 400 }
      );
    }
    
    const { email, name, source, metadata } = validation.data;
    
    // Check for duplicate lead in last 5 minutes (prevent spam)
    const recentLead = await prisma.lead.findFirst({
      where: {
        email: email.toLowerCase(),
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
        }
      }
    });
    
    if (recentLead) {
      return NextResponse.json(
        { error: 'Please wait before submitting again' },
        { status: 429 }
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
          ip: ip, // Store IP for abuse tracking
          timestamp: new Date().toISOString()
        }
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        email: lead.email
      }
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// GET - Fetch leads (MUST be authenticated)
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user is admin
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId }
    });
    
    if (!userProfile || userProfile.userType !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // Validate pagination params
    if (limit > 1000 || limit < 1) {
      return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
    }
    
    const leads = await prisma.lead.findMany({
      take: Math.min(limit, 1000),
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        email: true,
        name: true,
        source: true,
        toolName: true,
        toolId: true,
        metadata: true,
        createdAt: true
      }
    });
    
    const totalCount = await prisma.lead.count();
    
    return NextResponse.json({
      leads,
      totalCount,
      limit,
      offset
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}