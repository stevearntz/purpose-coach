import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isEmailServiceConfigured } from '@/lib/email';
import { sendInvitationEmailBatch } from '@/lib/email-batch';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
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
    } = await request.json();
    
    console.log('[campaign-launch] Launching campaign:', campaignName);
    console.log('[campaign-launch] Participants:', participants.length);
    
    // Check if email service is configured
    const emailConfigured = isEmailServiceConfigured();
    if (!emailConfigured) {
      console.warn('[campaign-launch] Email service not configured, will create invitations without sending');
    }
    
    // Get or create company
    let company = await prisma.company.findFirst({
      where: { name: companyName || senderEmail.split('@')[1] }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: companyName || senderEmail.split('@')[1],
          logo: null
        }
      });
    }
    
    // Extract email addresses from participants
    const participantEmails = participants.map((p: any) => p.email.toLowerCase().trim());
    
    // Create the campaign record with participants and tool info
    const campaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        description: customMessage || `${toolName} assessment campaign`,
        companyId: company.id,
        status: 'ACTIVE',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: deadline ? new Date(deadline) : null,
        toolId: toolId || null,
        toolName: toolName || null,
        toolPath: toolPath || null,
        participants: participantEmails
      }
    });
    
    console.log('[campaign-launch] Created campaign:', campaign.id, campaign.name);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    const invitationsToSend: any[] = [];
    const results: any[] = [];
    
    // First, create all invitations in the database
    for (const participant of participants) {
      try {
        const { email, name } = participant;
        
        // Check for existing invitation
        let invitation = await prisma.invitation.findFirst({
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
          invitation = await prisma.invitation.update({
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
          invitation = await prisma.invitation.create({
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
        
        // Prepare email data for batch sending
        if (emailConfigured) {
          // Capitalize the inviter's name properly
          const inviterName = senderEmail.split('@')[0];
          const capitalizedInviterName = inviterName.charAt(0).toUpperCase() + inviterName.slice(1).toLowerCase();
          
          invitationsToSend.push({
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
        }
        
        // Track invitation creation
        results.push({
          email,
          success: true,
          message: 'Invitation created',
          inviteUrl: assessmentUrl
        });
        
      } catch (error) {
        console.error(`[campaign-launch] Failed to create invitation for ${participant.email}:`, error);
        results.push({
          email: participant.email,
          success: false,
          message: 'Failed to create invitation',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Send all emails in batch with rate limiting
    let sentCount = 0;
    let errorCount = 0;
    
    if (emailConfigured && invitationsToSend.length > 0) {
      console.log(`[campaign-launch] Sending ${invitationsToSend.length} emails in batch...`);
      
      try {
        const emailResults = await sendInvitationEmailBatch(invitationsToSend, {
          maxConcurrent: 3,  // Send 3 emails at a time
          delayBetweenBatches: 1500,  // 1.5 seconds between batches
          retryFailures: true,
          maxRetries: 2
        });
        
        // Update results with email sending status
        emailResults.forEach(emailResult => {
          const resultIndex = results.findIndex(r => r.email === emailResult.email);
          if (resultIndex !== -1) {
            if (emailResult.success) {
              results[resultIndex].message = 'Invitation sent successfully';
              results[resultIndex].emailSent = true;
              sentCount++;
            } else {
              results[resultIndex].message = 'Invitation created but email failed';
              results[resultIndex].emailError = emailResult.error;
              errorCount++;
            }
          }
        });
        
        console.log(`[campaign-launch] Email batch complete: ${sentCount} sent, ${errorCount} failed`);
        
      } catch (batchError) {
        console.error('[campaign-launch] Batch email sending failed:', batchError);
        errorCount = invitationsToSend.length;
      }
    }
    
    // Log summary
    console.log('[campaign-launch] Campaign launch complete:', {
      campaignName,
      totalParticipants: participants.length,
      emailsSent: sentCount,
      errors: errorCount
    });
    
    return NextResponse.json({
      success: true,
      campaignName,
      totalParticipants: participants.length,
      emailsSent: sentCount,
      errors: errorCount,
      results
    });
    
  } catch (error) {
    console.error('[campaign-launch] Failed to launch campaign:', error);
    return NextResponse.json(
      { error: 'Failed to launch campaign' },
      { status: 500 }
    );
  }
}