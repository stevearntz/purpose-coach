import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendInvitationEmail, isEmailServiceConfigured } from '@/lib/email';
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
    
    // Create the campaign record
    const campaign = await prisma.campaign.create({
      data: {
        name: campaignName,
        description: customMessage || `${toolName} assessment campaign`,
        companyId: company.id,
        status: 'ACTIVE',
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: deadline ? new Date(deadline) : null
      }
    });
    
    console.log('[campaign-launch] Created campaign:', campaign.id, campaign.name);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    const results = [];
    let sentCount = 0;
    let errorCount = 0;
    
    // Process each participant
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
        
        // Send email if service is configured
        if (emailConfigured) {
          try {
            await sendInvitationEmail({
              to: email,
              userName: name || email.split('@')[0],
              inviterName: senderEmail.split('@')[0],
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
            
            console.log(`[campaign-launch] ✅ Email sent to ${email}`);
            sentCount++;
            
            results.push({
              email,
              success: true,
              message: 'Invitation sent successfully'
            });
          } catch (emailError) {
            console.error(`[campaign-launch] Failed to send email to ${email}:`, emailError);
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
        console.error(`[campaign-launch] Failed to process participant ${participant.email}:`, error);
        errorCount++;
        results.push({
          email: participant.email,
          success: false,
          message: 'Failed to create invitation',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
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