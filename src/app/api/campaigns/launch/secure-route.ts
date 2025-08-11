import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendInvitationEmail, isEmailServiceConfigured } from '@/lib/email';
import { nanoid } from 'nanoid';
import { createCampaignSchema, validateAndSanitize } from '@/lib/validation';
import { auth } from '@/auth';

// Rate limiting map (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000) {
  const now = Date.now();
  const userLimit = rateLimitMap.get(identifier);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  if (userLimit.count >= maxRequests) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // 2. Rate limiting
    if (!rateLimit(session.user.email, 5, 60000)) { // 5 campaigns per minute
      return NextResponse.json(
        { error: 'Too many requests. Please wait before creating another campaign.' },
        { status: 429 }
      );
    }
    
    // 3. Input validation
    const body = await request.json();
    const validation = validateAndSanitize(createCampaignSchema, body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid input',
          details: validation.errors.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
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
    
    // 4. Verify sender authorization
    if (senderEmail !== session.user.email) {
      const admin = await prisma.admin.findUnique({
        where: { email: session.user.email },
        select: { 
          company: {
            select: {
              admins: {
                where: { email: senderEmail },
                select: { id: true }
              }
            }
          }
        }
      });
      
      if (!admin?.company?.admins?.length) {
        return NextResponse.json(
          { error: 'Not authorized to send from this email' },
          { status: 403 }
        );
      }
    }
    
    console.log('[campaign-launch-secure] Launching campaign:', campaignName);
    console.log('[campaign-launch-secure] Participants:', participants.length);
    
    // Check if email service is configured
    const emailConfigured = isEmailServiceConfigured();
    if (!emailConfigured) {
      console.warn('[campaign-launch-secure] Email service not configured');
    }
    
    // Use transaction for atomicity
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
      
      // Create the campaign record
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
      
      console.log('[campaign-launch-secure] Created campaign:', campaign.id, campaign.name);
      
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
      const results = [];
      let sentCount = 0;
      let errorCount = 0;
      
      // Process each participant
      for (const participant of participants) {
        try {
          const { email, name } = participant;
          
          // Check for existing invitation
          let invitation = await tx.invitation.findFirst({
            where: { 
              email: email.trim(),
              companyId: company.id
            }
          });
          
          // Generate unique assessment link
          const inviteCode = invitation?.inviteCode || nanoid(10);
          const assessmentUrl = `${baseUrl}${toolPath}?invite=${inviteCode}&campaign=${encodeURIComponent(campaignName)}`;
          
          if (invitation) {
            // Update existing invitation
            invitation = await tx.invitation.update({
              where: { id: invitation.id },
              data: {
                status: 'SENT',
                sentAt: new Date(),
                personalMessage: customMessage || `You've been invited to complete the ${toolName} assessment`,
                inviteUrl: assessmentUrl
              }
            });
          } else {
            // Create new invitation
            invitation = await tx.invitation.create({
              data: {
                email: email.trim(),
                name: name || email.split('@')[0],
                inviteCode,
                inviteUrl: assessmentUrl,
                personalMessage: customMessage || `You've been invited to complete the ${toolName} assessment`,
                companyId: company.id,
                status: 'SENT',
                sentAt: new Date()
              }
            });
          }
          
          // Send email if service is configured
          if (emailConfigured) {
            try {
              // Capitalize the inviter's name properly
              const inviterName = senderEmail.split('@')[0];
              const capitalizedInviterName = inviterName.charAt(0).toUpperCase() + inviterName.slice(1).toLowerCase();
              
              await sendInvitationEmail({
                to: email,
                userName: name || email.split('@')[0],
                inviterName: capitalizedInviterName,
                companyName: company.name,
                companyLogo: company.logo || undefined,
                inviteUrl: assessmentUrl,
                personalMessage: customMessage,
                assessmentName: toolName,
                deadline: deadline ? new Date(deadline).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                }) : undefined
              });
              
              console.log(`[campaign-launch-secure] ✅ Email sent to ${email}`);
              sentCount++;
              
              results.push({
                email,
                success: true,
                message: 'Invitation sent successfully'
              });
            } catch (emailError) {
              console.error(`[campaign-launch-secure] Failed to send email to ${email}:`, emailError);
              errorCount++;
              results.push({
                email,
                success: false,
                message: 'Failed to send email',
                error: emailError instanceof Error ? emailError.message : 'Unknown error'
              });
            }
          } else {
            // No email sent, but invitation created
            results.push({
              email,
              success: true,
              message: 'Invitation created (email service not configured)',
              inviteUrl: assessmentUrl
            });
          }
          
        } catch (error) {
          console.error(`[campaign-launch-secure] Failed to process participant ${participant.email}:`, error);
          errorCount++;
          results.push({
            email: participant.email,
            success: false,
            message: 'Failed to create invitation',
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
      
      return {
        campaign,
        results,
        sentCount,
        errorCount
      };
    });
    
    // Log summary
    console.log('[campaign-launch-secure] Campaign launch complete:', {
      campaignName,
      totalParticipants: participants.length,
      emailsSent: result.sentCount,
      errors: result.errorCount
    });
    
    return NextResponse.json({
      success: true,
      campaignName,
      campaignId: result.campaign.id,
      totalParticipants: participants.length,
      emailsSent: result.sentCount,
      errors: result.errorCount,
      results: result.results
    });
    
  } catch (error) {
    console.error('[campaign-launch-secure] Failed to launch campaign:', error);
    
    // Don't expose internal errors to client
    return NextResponse.json(
      { error: 'Failed to launch campaign. Please try again.' },
      { status: 500 }
    );
  }
}