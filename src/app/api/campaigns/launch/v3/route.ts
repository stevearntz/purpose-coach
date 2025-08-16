/**
 * Simplified Campaign Launch API v3
 * Creates campaign and participants without sending emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/auth-middleware';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
});

// Simplified validation schema
const CreateCampaignSchema = z.object({
  toolId: z.string().min(1).max(50),
  toolName: z.string().min(1).max(100),
  toolPath: z.string().regex(/^\/[a-z0-9-\/]*$/, 'Invalid path format'),
  campaignName: z.string().min(1).max(200).transform(val => val.trim()),
  customMessage: z.string().max(1000).optional(),
  startDate: z.string(),
  deadline: z.string(),
  participants: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional()
  })).min(1).max(500),
  senderEmail: z.string().email(),
  companyName: z.string().optional()
});

/**
 * POST /api/campaigns/launch/v3
 * Create campaign with participants (no email sending)
 */
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  const requestId = nanoid(10);
  logger.info({ requestId, userId: req.user.id }, 'Campaign creation started (v3)');
  
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = CreateCampaignSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validation.error.errors.map(e => e.message) 
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
    
    // Generate campaign link
    const campaignCode = nanoid(10);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tools.getcampfire.com';
    const campaignLink = `${baseUrl}/assessment/${campaignCode}`;
    
    // Execute database transaction
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
      }
      
      // Create campaign (store extra data in description for now)
      const campaignData = {
        toolId,
        toolName,
        toolPath,
        campaignCode,
        campaignLink,
        message: customMessage
      };
      
      const campaign = await tx.campaign.create({
        data: {
          name: campaignName,
          description: JSON.stringify(campaignData), // Store as JSON in description field
          status: 'ACTIVE',
          startDate: new Date(startDate),
          endDate: deadline ? new Date(deadline) : null,
          companyId: company.id
        }
      });
      
      // Create invitations for each participant (status: PENDING - not sent)
      const invitations = [];
      for (const participant of participants) {
        const inviteCode = nanoid(10);
        
        // Check for existing invitation
        let invitation = await tx.invitation.findFirst({
          where: { 
            email: participant.email,
            companyId: company.id
          }
        });
        
        if (!invitation) {
          // Create new invitation
          invitation = await tx.invitation.create({
            data: {
              email: participant.email,
              name: participant.name || participant.email.split('@')[0],
              inviteCode,
              inviteUrl: campaignLink, // Same link for everyone
              personalMessage: customMessage,
              companyId: company.id,
              status: 'PENDING', // Not sent, just created
              sentAt: null // No email sent
            }
          });
        }
        
        invitations.push(invitation);
      }
      
      return { campaign, company, invitations };
    });
    
    // Prepare response
    const response = {
      success: true,
      campaign: {
        id: result.campaign.id,
        name: result.campaign.name,
        link: campaignLink,
        startDate: result.campaign.startDate,
        endDate: result.campaign.endDate
      },
      summary: {
        totalParticipants: participants.length,
        invitationsCreated: result.invitations.length,
        campaignLink
      },
      emailHelper: {
        participantEmails: participants.map(p => p.email).join(', '),
        emailTemplate: generateEmailTemplate({
          toolName,
          campaignLink,
          deadline: deadline ? new Date(deadline).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }) : 'soon',
          companyName: result.company.name,
          senderName: req.user.firstName || req.user.name?.split(' ')[0] || req.user.email.split('@')[0]
        }),
        emailSubject: `Action Required: Complete Your ${toolName}`
      }
    };
    
    logger.info({ 
      requestId, 
      campaignId: result.campaign.id,
      participantCount: participants.length 
    }, 'Campaign created successfully');
    
    return NextResponse.json(response);
    
  } catch (error) {
    logger.error({ requestId, error }, 'Failed to create campaign');
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
});

function generateEmailTemplate({
  toolName,
  campaignLink,
  deadline,
  companyName,
  senderName
}: {
  toolName: string;
  campaignLink: string;
  deadline: string;
  companyName: string;
  senderName: string;
}) {
  return `Hi team,

I've set up an assessment for our team to better understand how we can improve our ${toolName.toLowerCase().replace('assessment', '').trim()} processes.

Please take 5 minutes to complete this assessment by ${deadline}:
${campaignLink}

Your responses are confidential and will help us identify areas for improvement and better support our team's needs.

Thanks for your participation!

Best,
${senderName}`;
}