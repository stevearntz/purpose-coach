/**
 * Production-grade Company Users API
 * Fully authenticated, validated, and secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import pino from 'pino';

// Production logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['email', 'password']
});

// Validation schema
const GetUsersSchema = z.object({
  limit: z.coerce.number().min(1).max(500).default(100),
  offset: z.coerce.number().min(0).default(0),
  status: z.enum(['active', 'invited', 'created', 'deactivated']).optional(),
  search: z.string().max(100).optional()
});

/**
 * GET /api/company/users/v2
 * Fetch company users with proper authorization
 */
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  logger.info({ requestId, userId: req.user.id }, 'Fetching company users');
  
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams);
    const validation = GetUsersSchema.safeParse(params);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }
    
    const { limit, offset, status, search } = validation.data;
    
    // Get user's company from their Clerk organization
    const { orgId } = req.user;
    let companyId: string | undefined;
    let companyName: string | undefined;
    
    // First, try to find company by Clerk org ID (most reliable)
    if (orgId) {
      const company = await prisma.company.findUnique({
        where: { clerkOrgId: orgId }
      });
      
      if (company) {
        companyId = company.id;
        companyName = company.name;
        logger.info({ requestId, companyName, companyId }, 'Found company by Clerk org ID');
      }
    }
    
    // Fallback: try to find by user profile
    if (!companyId) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { clerkUserId: req.user.id },
        include: { company: true }
      });
      
      if (userProfile?.company) {
        companyId = userProfile.company.id;
        companyName = userProfile.company.name;
        logger.info({ requestId, companyName, companyId }, 'Found company by user profile');
      }
    }
    
    // Last resort: try to find by email domain (less reliable)
    if (!companyId) {
      const emailDomain = req.user.email.split('@')[1];
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { domains: { has: `@${emailDomain}` } },
            { invitations: { some: { email: req.user.email } } }
          ]
        }
      });
      
      if (company) {
        companyId = company.id;
        companyName = company.name;
        logger.warn({ requestId, companyName, companyId }, 'Found company by email domain fallback');
      }
    }
    
    if (!companyId) {
      logger.warn({ requestId, email: req.user.email }, 'User has no company association');
      return NextResponse.json({ users: [] });
    }
    
    // Get all users associated with this company
    const users = await prisma.$transaction(async (tx) => {
      // Admin model removed - no admin data available
      const admins: any[] = [];
      
      // Get invitations to show invited users
      const invitations = await tx.invitation.findMany({
        where: {
          companyId: companyId,
          ...(search ? {
            OR: [
              { email: { contains: search } },
              { name: { contains: search } }
            ]
          } : {})
        },
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          sentAt: true,
          completedAt: true,
          createdAt: true,
          metadata: {
            select: {
              role: true,
              department: true
            }
          }
        }
      });
      
      // Combine and format users
      const allUsers: any[] = [];
      
      // Admin model removed - no admin users to add
      
      // Add invitations with proper status mapping
      invitations.forEach(inv => {
        const nameParts = (inv.name || inv.email.split('@')[0]).split(' ');
        let userStatus: 'active' | 'invited' | 'new' = 'new';
        
        // Simplified status logic:
        // Active - they've completed assessments (actively using tools)
        // Invited - they have invitations but haven't completed anything
        // New - no invitations sent yet
        if (inv.status === 'COMPLETED') {
          userStatus = 'active';  // Has completed an assessment - they're active users
        } else if (inv.status === 'SENT' || inv.status === 'OPENED' || inv.status === 'STARTED' || inv.status === 'PENDING') {
          // PENDING means they were added to a campaign (invitation created)
          // Even though email might not be sent, they're "invited" to participate
          userStatus = 'invited';  // Has been invited (campaign or direct)
        } else {
          userStatus = 'new';  // Brand new, no activity
        }
        
        allUsers.push({
          email: inv.email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          status: userStatus,
          role: inv.metadata?.role || 'Member',
          department: inv.metadata?.department || '',
          lastActive: inv.completedAt?.toISOString(), // Last active = last completed assessment
          invitedAt: inv.sentAt?.toISOString(),
          createdAt: inv.createdAt.toISOString()
        });
      });
      
      // Filter by status if provided
      let filteredUsers = allUsers;
      if (status) {
        filteredUsers = allUsers.filter(u => u.status === status);
      }
      
      // Sort by creation date (newest first)
      filteredUsers.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Apply pagination
      const paginatedUsers = filteredUsers.slice(offset, offset + limit);
      
      return {
        users: paginatedUsers,
        total: filteredUsers.length
      };
    });
    
    logger.info({ 
      requestId, 
      userCount: users.users.length,
      total: users.total 
    }, 'Company users fetched');
    
    return NextResponse.json({ 
      users: users.users,
      pagination: {
        total: users.total,
        limit,
        offset,
        hasMore: offset + limit < users.total
      }
    });
    
  } catch (error) {
    logger.error({ requestId, error }, 'Failed to fetch company users');
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

// Validation schema for creating users
const CreateUsersSchema = z.object({
  users: z.array(z.object({
    email: z.string().email(),
    name: z.string().min(1),
    role: z.enum(['admin', 'member', 'participant']).default('participant')
  })).min(1).max(100)
});

/**
 * POST /api/company/users/v2
 * Create multiple participants for the company
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  logger.info({ requestId, userId: req.user.id }, 'Creating company participants');
  
  try {
    const body = await req.json();
    const validation = CreateUsersSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: validation.error.errors.map(e => e.message)
        },
        { status: 400 }
      );
    }
    
    const { users } = validation.data;
    
    // Get user's company
    const { orgId } = req.user;
    let companyId: string | undefined;
    
    if (orgId) {
      const company = await prisma.company.findUnique({
        where: { clerkOrgId: orgId }
      });
      
      if (company) {
        companyId = company.id;
      }
    }
    
    if (!companyId) {
      const userProfile = await prisma.userProfile.findUnique({
        where: { clerkUserId: req.user.id },
        include: { company: true }
      });
      
      if (userProfile?.company) {
        companyId = userProfile.company.id;
      }
    }
    
    if (!companyId) {
      return NextResponse.json(
        { error: 'Company not found for user' },
        { status: 404 }
      );
    }
    
    // Create invitations for each user
    const createdInvitations = [];
    const errors = [];
    
    for (const user of users) {
      try {
        // Check if invitation already exists
        const existing = await prisma.invitation.findFirst({
          where: {
            email: user.email,
            companyId
          }
        });
        
        if (existing) {
          logger.info({ email: user.email }, 'Invitation already exists');
          createdInvitations.push(existing);
          continue;
        }
        
        // Create new invitation
        const inviteCode = nanoid(10);
        const invitation = await prisma.invitation.create({
          data: {
            email: user.email,
            name: user.name,
            inviteCode,
            inviteUrl: `${process.env.NEXT_PUBLIC_URL || 'https://tools.getcampfire.com'}/invite/${inviteCode}`,
            companyId,
            status: 'PENDING',
            metadata: {
              create: {
                role: user.role
              }
            }
          },
          include: {
            metadata: true
          }
        });
        
        createdInvitations.push(invitation);
        logger.info({ email: user.email, inviteCode }, 'Created participant invitation');
        
      } catch (error) {
        logger.error({ email: user.email, error }, 'Failed to create invitation');
        errors.push({ email: user.email, error: 'Failed to create invitation' });
      }
    }
    
    return NextResponse.json({
      success: true,
      invitations: createdInvitations,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        requested: users.length,
        created: createdInvitations.filter(inv => inv.status === 'PENDING').length,
        existing: createdInvitations.filter(inv => inv.status !== 'PENDING').length,
        failed: errors.length
      }
    });
    
  } catch (error) {
    logger.error({ requestId, error }, 'Failed to create participants');
    return NextResponse.json(
      { error: 'Failed to create participants' },
      { status: 500 }
    );
  }
});