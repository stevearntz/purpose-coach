/**
 * Production-grade Company Users API
 * Fully authenticated, validated, and secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware-simple';
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
    
    // If not in session, try to find in admin table
    if (!companyId) {
      const admin = await prisma.admin.findUnique({
        where: { email: req.user.email },
        include: {
          company: true
        }
      });
      
      if (admin?.company) {
        companyId = admin.company.id;
        companyName = admin.company.name;
      }
    }
    
    // If still no company, try to find by email domain
    if (!companyId) {
      const emailDomain = req.user.email.split('@')[1];
      const company = await prisma.company.findFirst({
        where: {
          OR: [
            { name: { contains: emailDomain } },
            { admins: { some: { email: req.user.email } } },
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
      // Get admins
      const admins = await tx.admin.findMany({
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
          createdAt: true
        }
      });
      
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
          createdAt: true
        }
      });
      
      // Combine and format users
      const allUsers: any[] = [];
      
      // Add admins as active users
      admins.forEach(admin => {
        const nameParts = (admin.name || admin.email.split('@')[0]).split(' ');
        allUsers.push({
          email: admin.email,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          status: 'active' as const,
          lastSignIn: undefined,
          createdAt: admin.createdAt.toISOString()
        });
      });
      
      // Add invitations as invited/created users (avoid duplicates)
      const adminEmails = new Set(admins.map(a => a.email));
      invitations.forEach(inv => {
        if (!adminEmails.has(inv.email)) {
          const nameParts = (inv.name || inv.email.split('@')[0]).split(' ');
          let userStatus: 'active' | 'invited' | 'created' = 'invited';
          
          if (inv.status === 'COMPLETED') {
            userStatus = 'active';
          } else if (inv.status === 'STARTED') {
            userStatus = 'created';
          }
          
          allUsers.push({
            email: inv.email,
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            status: userStatus,
            lastSignIn: inv.completedAt?.toISOString(),
            invitedAt: inv.sentAt?.toISOString(),
            createdAt: inv.createdAt.toISOString()
          });
        }
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
}, {
  requireAdmin: false, // Allow any authenticated user to view their company users
  rateLimit: true,
  maxRequests: 100,
  windowMs: '60s'
});