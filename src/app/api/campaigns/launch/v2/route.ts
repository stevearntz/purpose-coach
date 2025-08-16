/**
 * Production-grade Campaign Launch API
 * Fully validated, authenticated, and secure
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { CreateCampaignSchema, validateRequestBody } from '@/lib/api-validation';
import { sendInvitationEmailBatch } from '@/lib/email-batch';
import { isEmailServiceConfigured } from '@/lib/email';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import { z } from 'zod';
import pino from 'pino';

// Production logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['password', 'email', 'inviteCode'] // Redact sensitive data
});

// Prisma client with connection pooling
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

/**
 * POST /api/campaigns/launch/v2
 * Launch a new assessment campaign with email invitations
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  const startTime = Date.now();
  
  logger.info({ requestId, userId: req.user.id }, 'Campaign launch started');
  
  try {
    // 1. Validate request body
    const validation = await validateRequestBody(req, CreateCampaignSchema);
    
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
    
    const {
      toolId,
      toolName,
      toolPath,
      campaignName,
      customMessage,
      startDate,
      deadline,
      participants,
      senderEmail,
      companyName
    } = validation.data;
    
    // 2. Verify sender authorization (simplified since Admin model removed)
    // For now, only allow sending from the authenticated user's email
    if (senderEmail !== req.user.email) {
      logger.warn({ requestId, senderEmail }, 'Unauthorized sender email');
      return NextResponse.json(
        { error: 'Can only send from your authenticated email address' },
        { status: 403 }
      );
    }
    
    // 3. Check email service configuration
    const emailConfigured = isEmailServiceConfigured();
    if (!emailConfigured) {
      logger.warn({ requestId }, 'Email service not configured');
    }
    
    // 4. Execute database transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get or create company
      let company = await tx.company.findFirst({
        where: { name: companyName || senderEmail.split('@')[1] }
      });
      
      if (!company) {
        company = await tx.company.create({
          data: {
            name: companyName || senderEmail.split('@')[1],
            logo: null
          }
        });
        logger.info({ requestId, companyId: company.id }, 'Created new company');
      }
      
      // Create campaign
      const campaign = await tx.campaign.create({
        data: {
          name: campaignName,
          description: customMessage || `${toolName} assessment campaign`,
          companyId: company.id,
          status: 'ACTIVE',
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: deadline ? new Date(deadline) : null
        }
      });
      
      logger.info({ requestId, campaignId: campaign.id }, 'Created campaign');
      
      // Create invitations
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tools.getcampfire.com';
      const invitations = [];
      
      for (const participant of participants) {
        const inviteCode = nanoid(10);
        const assessmentUrl = `${baseUrl}${toolPath}?invite=${inviteCode}&campaign=${encodeURIComponent(campaignName)}`;
        
        // Check for existing invitation
        let invitation = await tx.invitation.findFirst({
          where: { 
            email: participant.email,
            companyId: company.id
          }
        });
        
        if (invitation) {
          // Update existing
          invitation = await tx.invitation.update({
            where: { id: invitation.id },
            data: {
              status: 'SENT',
              sentAt: new Date(),
              personalMessage: customMessage,
              inviteUrl: assessmentUrl
            }
          });
        } else {
          // Create new
          invitation = await tx.invitation.create({
            data: {
              email: participant.email,
              name: participant.name || participant.email.split('@')[0],
              inviteCode,
              inviteUrl: assessmentUrl,
              personalMessage: customMessage,
              companyId: company.id,
              status: 'SENT',
              sentAt: new Date()
            }
          });
        }
        
        invitations.push({
          id: invitation.id,
          email: invitation.email,
          name: invitation.name,
          inviteUrl: assessmentUrl
        });
      }
      
      return { campaign, company, invitations };
    });
    
    // 5. Send emails in batch (outside transaction)
    let emailResults: any[] = [];
    if (emailConfigured && result.invitations.length > 0) {
      const inviterName = formatName(senderEmail.split('@')[0]);
      
      const emailBatch = result.invitations.map(inv => ({
        to: inv.email,
        userName: inv.name || undefined,
        inviterName,
        companyName: result.company.name,
        companyLogo: result.company.logo || undefined,
        inviteUrl: inv.inviteUrl,
        personalMessage: customMessage,
        assessmentName: toolName,
        deadline: deadline ? new Date(deadline).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        }) : undefined
      }));
      
      try {
        emailResults = await sendInvitationEmailBatch(emailBatch, {
          maxConcurrent: 2,  // Resend limit is 2 per second
          delayBetweenBatches: 1500,
          retryFailures: true,
          maxRetries: 2
        });
        
        logger.info({ 
          requestId, 
          sent: emailResults.filter(r => r.success).length,
          failed: emailResults.filter(r => !r.success).length 
        }, 'Email batch completed');
        
      } catch (error) {
        logger.error({ requestId, error }, 'Email batch failed');
        // Continue - invitations are created even if emails fail
      }
    }
    
    // 6. Prepare response
    const response = {
      success: true,
      campaign: {
        id: result.campaign.id,
        name: result.campaign.name,
        startDate: result.campaign.startDate,
        endDate: result.campaign.endDate
      },
      summary: {
        totalParticipants: participants.length,
        invitationsCreated: result.invitations.length,
        emailsSent: emailResults.filter(r => r.success).length,
        emailsFailed: emailResults.filter(r => !r.success).length
      },
      details: result.invitations.map(inv => {
        const emailResult = emailResults.find(r => r.email === inv.email);
        return {
          email: inv.email,
          invitationCreated: true,
          emailSent: emailResult?.success || false,
          error: emailResult?.error
        };
      })
    };
    
    const duration = Date.now() - startTime;
    logger.info({ requestId, duration, campaignId: result.campaign.id }, 'Campaign launch completed');
    
    return NextResponse.json(response);
    
  } catch (error) {
    logger.error({ requestId, error }, 'Campaign launch failed');
    
    // Check for specific error types
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('P2002')) {
      return NextResponse.json(
        { error: 'Duplicate campaign name' },
        { status: 409 }
      );
    }
    
    // Generic error (don't expose internals)
    return NextResponse.json(
      { error: 'Failed to launch campaign' },
      { status: 500 }
    );
  }
});

// Removed verifySenderAuthorization function since Admin model is deprecated
// Users can now only send from their authenticated email address

/**
 * Format name for display
 */
function formatName(name: string): string {
  return name
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}