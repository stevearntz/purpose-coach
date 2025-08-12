/**
 * Production-grade Admin Invitations API
 * Fully authenticated, validated, and secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware-simple';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import { sendInvitationEmail, isEmailServiceConfigured } from '@/lib/email';
import { validateRequestBody, EmailSchema, NameSchema } from '@/lib/api-validation';
import pino from 'pino';

// Production logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['email', 'inviteCode']
});

// Validation schemas
const CreateInvitationSchema = z.object({
  email: EmailSchema,
  name: NameSchema.optional(),
  companyId: z.string().min(1, 'Company ID is required'),
  personalMessage: z.string().max(1000).optional(),
  sendImmediately: z.boolean().default(false)
});

const GetInvitationsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['PENDING', 'SENT', 'OPENED', 'STARTED', 'COMPLETED']).optional(),
  companyId: z.string().optional()
});

/**
 * GET /api/admin/invitations/v2
 * Fetch invitations with pagination and filtering
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  logger.info({ requestId, userId: req.user.id }, 'Fetching invitations');
  
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    const validation = GetInvitationsSchema.safeParse(params);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }
    
    const { limit, offset, status, companyId } = validation.data;
    
    // Build query filter
    const where: any = {};
    if (status) where.status = status;
    if (companyId) where.companyId = companyId;
    
    // No filtering by company - show all invitations
    // This is a general invitation management portal
    
    // Execute query with transaction
    const [invitations, total] = await prisma.$transaction([
      prisma.invitation.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          },
          metadata: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        skip: offset
      }),
      prisma.invitation.count({ where })
    ]);
    
    logger.info({ requestId, count: invitations.length, total }, 'Invitations fetched');
    
    // Transform data (remove sensitive fields)
    const transformedInvitations = invitations.map(inv => ({
      id: inv.id,
      email: inv.email,
      name: inv.name,
      company: {
        id: inv.company.id,
        name: inv.company.name,
        logo: inv.company.logo
      },
      status: inv.status,
      createdAt: inv.createdAt.toISOString(),
      sentAt: inv.sentAt?.toISOString(),
      openedAt: inv.openedAt?.toISOString(),
      startedAt: inv.startedAt?.toISOString(),
      completedAt: inv.completedAt?.toISOString(),
      currentStage: inv.currentStage,
      metadata: inv.metadata ? {
        role: inv.metadata.role,
        toolsAccessed: inv.metadata.toolsAccessed || []
      } : undefined
    }));
    
    return NextResponse.json({ 
      invitations: transformedInvitations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    });
    
  } catch (error) {
    logger.error({ requestId, error }, 'Failed to fetch invitations');
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}, {
  requireAdmin: true,
  rateLimit: true,
  maxRequests: 100,
  windowMs: '60s'
});

/**
 * POST /api/admin/invitations/v2
 * Create a new invitation
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  logger.info({ requestId, userId: req.user.id }, 'Creating invitation');
  
  try {
    // Validate request body
    const validation = await validateRequestBody(req, CreateInvitationSchema);
    
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
    
    const { email, name, companyId, personalMessage, sendImmediately } = validation.data;
    
    // No company restrictions - admin portal can manage invitations for any company
    // This is a general invitation management system
    
    // Execute transaction
    const result = await prisma.$transaction(async (tx) => {
      // Verify company exists
      const company = await tx.company.findUnique({
        where: { id: companyId }
      });
      
      if (!company) {
        throw new Error('Company not found');
      }
      
      // Check for existing invitation
      const existing = await tx.invitation.findFirst({
        where: { email, companyId }
      });
      
      if (existing) {
        throw new Error(`Invitation already exists for ${email}`);
      }
      
      // Generate secure invitation code
      const inviteCode = nanoid(16);
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tools.getcampfire.com';
      const inviteUrl = `${baseUrl}/start?invite=${inviteCode}`;
      
      // Create invitation
      const invitation = await tx.invitation.create({
        data: {
          email,
          name: name || email.split('@')[0],
          inviteCode,
          inviteUrl,
          personalMessage,
          companyId,
          status: sendImmediately ? 'SENT' : 'PENDING',
          sentAt: sendImmediately ? new Date() : undefined
        },
        include: {
          company: true
        }
      });
      
      return invitation;
    });
    
    // Send email if requested (outside transaction)
    let emailSent = false;
    if (sendImmediately && isEmailServiceConfigured()) {
      try {
        const emailResult = await sendInvitationEmail({
          to: result.email,
          recipientName: result.name || undefined,
          companyName: result.company.name,
          companyLogo: result.company.logo || undefined,
          inviteUrl: result.inviteUrl,
          personalMessage
        });
        
        emailSent = emailResult.success;
        if (!emailSent) {
          logger.warn({ requestId, error: (emailResult as any).error }, 'Email send failed');
        }
      } catch (error) {
        logger.error({ requestId, error }, 'Email send error');
      }
    }
    
    logger.info({ 
      requestId, 
      invitationId: result.id,
      emailSent 
    }, 'Invitation created');
    
    // Return sanitized response
    return NextResponse.json({
      success: true,
      invitation: {
        id: result.id,
        email: result.email,
        name: result.name,
        company: result.company.name,
        status: result.status,
        emailSent,
        createdAt: result.createdAt.toISOString()
      }
    });
    
  } catch (error: any) {
    logger.error({ requestId, error }, 'Failed to create invitation');
    
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    if (error.message === 'Company not found') {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}, {
  requireAdmin: true,
  rateLimit: true,
  maxRequests: 20,
  windowMs: '60s'
});