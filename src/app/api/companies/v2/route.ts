/**
 * Production-grade Companies API
 * Fully authenticated, validated, and secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware-simple';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import { validateRequestBody, CompanyNameSchema } from '@/lib/api-validation';
import pino from 'pino';

// Production logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['email']
});

// Validation schemas
const CreateCompanySchema = z.object({
  name: CompanyNameSchema,
  logo: z.string().url().optional().nullable()
});

const GetCompaniesSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().max(100).optional()
});

/**
 * GET /api/companies/v2
 * Fetch companies with pagination
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  logger.info({ requestId, userId: req.user.id }, 'Fetching companies');
  
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    const validation = GetCompaniesSchema.safeParse(params);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }
    
    const { limit, offset, search } = validation.data;
    
    // Build query filter
    const where: any = {};
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      };
    }
    
    // If user has a company, only show their company
    if (req.user.companyId) {
      where.id = req.user.companyId;
    }
    
    // Execute query with transaction
    const [companies, total] = await prisma.$transaction([
      prisma.company.findMany({
        where,
        include: {
          _count: {
            select: {
              admins: true,
              invitations: true,
              campaigns: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.company.count({ where })
    ]);
    
    logger.info({ requestId, count: companies.length, total }, 'Companies fetched');
    
    // Transform data
    const transformedCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      logo: company.logo,
      stats: {
        admins: company._count.admins,
        invitations: company._count.invitations,
        campaigns: company._count.campaigns
      },
      createdAt: company.createdAt.toISOString()
    }));
    
    return NextResponse.json({ 
      companies: transformedCompanies,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
    
  } catch (error) {
    logger.error({ requestId, error }, 'Failed to fetch companies');
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}, {
  requireAdmin: true,
  rateLimit: true
});

/**
 * POST /api/companies/v2
 * Create a new company
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  logger.info({ requestId, userId: req.user.id }, 'Creating company');
  
  try {
    // Validate request body
    const validation = await validateRequestBody(req, CreateCompanySchema);
    
    if (!validation.success) {
      logger.warn({ requestId, errors: validation.errors }, 'Validation failed');
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.errors
        },
        { status: 400 }
      );
    }
    
    const { name, logo } = validation.data;
    
    // Check for duplicate in transaction
    const company = await prisma.$transaction(async (tx) => {
      // Check if company exists
      const existing = await tx.company.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive'
          }
        }
      });
      
      if (existing) {
        throw new Error(`Company "${name}" already exists`);
      }
      
      // Create company
      return await tx.company.create({
        data: {
          name,
          logo
        }
      });
    });
    
    logger.info({ requestId, companyId: company.id }, 'Company created');
    
    return NextResponse.json({
      success: true,
      company: {
        id: company.id,
        name: company.name,
        logo: company.logo,
        createdAt: company.createdAt.toISOString()
      }
    }, { status: 201 });
    
  } catch (error: any) {
    logger.error({ requestId, error }, 'Failed to create company');
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    );
  }
}, {
  requireAdmin: true,
  rateLimit: true,
  maxRequests: 10,
  windowMs: '60s'
});