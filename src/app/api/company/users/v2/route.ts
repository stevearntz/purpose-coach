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
    
    // Get user's company - check both admin table and session
    let companyId = req.user.companyId;
    let companyName = req.user.companyName;
    
    // Admin model removed - can't lookup by admin table
    
    // If still no company, try to find by email domain
    if (!companyId) {
      const emailDomain = req.user.email.split('@')[1];
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { name: { contains: emailDomain } },
            { invitations: { some: { email: req.user.email } } }
          ]
        }
      });
      
      if (company) {
        companyId = company.id;
        companyName = company.name;
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
        
        if (inv.status === 'COMPLETED') {
          userStatus = 'active';  // Has completed an assessment
        } else if (inv.status === 'SENT' || inv.status === 'OPENED' || inv.status === 'STARTED') {
          userStatus = 'invited';  // Has been invited through a campaign
        } else if (inv.status === 'PENDING') {
          userStatus = 'new';  // Just added, not yet invited
        }
        
        allUsers.push({
          email: inv.email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          status: userStatus,
          role: inv.metadata?.role || 'Member',
          department: inv.metadata?.department || '',
          lastSignIn: inv.completedAt?.toISOString(),
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