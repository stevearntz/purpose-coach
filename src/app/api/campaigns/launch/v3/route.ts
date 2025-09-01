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
      
      // Extract email addresses from participants for the campaign
      const participantEmails = participants.map(p => p.email.toLowerCase().trim());
      
      // Create campaign with participants and tool info
      const campaign = await tx.campaign.create({
        data: {
          name: campaignName,
          description: customMessage || `${toolName} assessment campaign`,
          status: 'ACTIVE',
          startDate: new Date(startDate),
          endDate: deadline ? new Date(deadline) : null,
          companyId: company.id,
          toolId: toolId,
          toolName: toolName,
          toolPath: toolPath,
          participants: participantEmails,
          campaignCode: campaignCode,
          campaignLink: campaignLink
        }
      });
      
      // Create invitations for each participant (status: PENDING - not sent)
      const invitations = [];
      for (const participant of participants) {
        const inviteCode = nanoid(10);
        
        // Create individual link for this participant
        // Format: /assessment/campaignCode?invite=inviteCode
        const individualLink = `${baseUrl}/assessment/${campaignCode}?invite=${inviteCode}`;
        
        // Check for existing invitation
        let invitation = await tx.invitation.findFirst({
          where: { 
            email: participant.email,
            companyId: company.id
          }
        });
        
        if (!invitation) {
          // Create new invitation with individual link
          invitation = await tx.invitation.create({
            data: {
              email: participant.email,
              name: participant.name || participant.email.split('@')[0],
              inviteCode,
              inviteUrl: individualLink, // Individual link with invite code
              personalMessage: customMessage,
              companyId: company.id,
              status: 'PENDING', // Not sent, just created
              sentAt: null // No email sent
            }
          });
        } else {
          // Update existing invitation to link it to this campaign
          // Preserve their existing invite code if they have one
          const existingCode = invitation.inviteCode || inviteCode;
          const updatedLink = `${baseUrl}/assessment/${campaignCode}?invite=${existingCode}`;
          
          invitation = await tx.invitation.update({
            where: { id: invitation.id },
            data: {
              inviteCode: existingCode,
              inviteUrl: updatedLink, // Update URL to individual campaign link
              personalMessage: customMessage || invitation.personalMessage,
              // Keep existing status unless it's already completed
              status: invitation.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING'
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
          senderName: req.user.name?.split(' ')[0] || req.user.email.split('@')[0]
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