import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import prisma from '@/lib/prisma';
import { sendInvitationEmail, isEmailServiceConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { emails, message, senderEmail, company: companyName } = await request.json();
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Emails are required' }, { status: 400 });
    }
    
    if (!senderEmail) {
      return NextResponse.json({ error: 'Sender email is required' }, { status: 400 });
    }
    
    // Get or create company from sender's email
    let company = await prisma.company.findFirst({
      where: { 
        name: companyName || senderEmail.split('@')[1] 
      }
    });
    
    if (!company) {
      // Create new company
      company = await prisma.company.create({
        data: {
          name: companyName || senderEmail.split('@')[1],
          logo: null
        }
      });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    let sentCount = 0;
    const results = [];
    
    for (const email of emails) {
      try {
        // Parse name from email if not provided
        const emailParts = email.trim().split('@')[0];
        // Handle both dot and underscore separators
        const nameParts = emailParts.split(/[._-]/).filter((p: string) => p.length > 0);
        const fullName = nameParts.map((part: string) => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
        
        console.log('[invite] Creating invitation for:', email, 'with name:', fullName);
        
        // Check for existing invitation
        const existingInvitation = await prisma.invitation.findFirst({
          where: { 
            email: email.trim(),
            companyId: company.id
          }
        });
        
        if (existingInvitation) {
          console.log('[invite] User already has invitation:', email);
          results.push({
            email,
            success: false,
            error: 'User already invited',
            inviteUrl: existingInvitation.inviteUrl
          });
          continue;
        }
        
        // Create invitation in database
        const inviteCode = nanoid(10);
        const inviteUrl = `${baseUrl}/start?invite=${inviteCode}`;
        
        const invitation = await prisma.invitation.create({
          data: {
            email: email.trim(),
            name: fullName,
            inviteCode,
            inviteUrl,
            personalMessage: message || `You've been invited to join ${company.name} on Campfire`,
            companyId: company.id,
            status: 'SENT',
            sentAt: new Date()
          },
          include: {
            company: true
          }
        });
        
        console.log('[invite] Created invitation:', {
          id: invitation.id,
          email: invitation.email,
          name: invitation.name,
          company: invitation.company.name
        });
        
        // Send email if configured
        if (isEmailServiceConfigured()) {
          try {
            await sendInvitationEmail({
              to: email.trim(),
              recipientName: fullName,
              companyName: company.name,
              companyLogo: company.logo || undefined,
              inviteUrl,
              inviterName: senderEmail.split('@')[0],
              personalMessage: message
            });
            console.log('[invite] Email sent to:', email);
          } catch (emailError) {
            console.error('[invite] Failed to send email:', emailError);
            // Continue even if email fails - invitation is created
          }
        } else {
          console.log('[invite] Email service not configured - invitation created but email not sent');
        }
        
        sentCount++;
        results.push({
          email,
          success: true,
          inviteUrl: invitation.inviteUrl
        });
        
      } catch (error) {
        console.error(`Failed to invite ${email}:`, error);
        results.push({
          email,
          success: false,
          error: 'Failed to create invitation'
        });
      }
    }
    
    return NextResponse.json({
      sent: sentCount,
      total: emails.length,
      results
    });
    
  } catch (error) {
    console.error('Failed to send invitations:', error);
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 });
  }
}