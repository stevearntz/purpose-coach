// Email service selector
// This file acts as a proxy to use either SendGrid or Resend
// based on what's configured in environment variables

import { ReactElement } from 'react';

// Check which service is configured
const USE_SENDGRID = !!process.env.SENDGRID_API_KEY;
const USE_RESEND = !!process.env.RESEND_API_KEY && !USE_SENDGRID; // Prefer SendGrid if both are set

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react?: ReactElement;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
}

/**
 * Send an email using the configured service (SendGrid or Resend)
 */
export async function sendEmail(options: EmailOptions) {
  if (USE_SENDGRID) {
    // Use SendGrid
    const sendgrid = await import('./email-sendgrid');
    return sendgrid.sendEmail(options);
  } else if (USE_RESEND) {
    // Use Resend
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    try {
      // Use the verified domain
      const from = options.from || 'Campfire <notifications@getcampfire.com>';
      
      const data = await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        react: options.react,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo as any,
        cc: options.cc as any,
        bcc: options.bcc as any,
      } as any);
      
      console.log('Resend API response:', data);
      
      // Check if email was actually sent
      if (data.error) {
        console.error('Resend returned error:', data.error);
        return { success: false, error: data.error };
      }
      
      if (data.data?.id) {
        console.log('Email sent successfully via Resend:', {
          id: data.data.id,
          to: options.to,
          subject: options.subject
        });
        return { success: true, data };
      }
      
      // Unexpected response
      console.warn('Unexpected Resend response:', data);
      return { success: false, error: 'Unexpected response from Resend' };
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return { success: false, error };
    }
  } else {
    console.warn('No email service configured - invitation links must be copied manually');
    return { success: false, error: 'No email service configured - invitation links can be copied manually' };
  }
}

/**
 * Send an invitation email
 */
export async function sendInvitationEmail({
  to,
  recipientName,
  userName,
  companyName,
  companyLogo,
  inviteUrl,
  inviterName,
  personalMessage,
  assessmentName,
  deadline,
}: {
  to: string;
  recipientName?: string;
  userName?: string;
  companyName: string;
  companyLogo?: string;
  inviteUrl: string;
  inviterName?: string;
  personalMessage?: string;
  assessmentName?: string;
  deadline?: string | null;
}) {
  // If this is an assessment invitation, use the assessment template
  if (assessmentName) {
    // Dynamically import the assessment email template
    const { AssessmentInvitationEmail } = await import('@/emails/assessment-invitation');
    
    const emailElement = AssessmentInvitationEmail({
      userName: userName || recipientName || to.split('@')[0],
      inviterName: inviterName || 'Your organization',
      companyName,
      companyLogo,
      inviteUrl,
      personalMessage,
      assessmentName,
      deadline,
    });
    
    return sendEmail({
      to,
      subject: `Action Required: Complete your ${assessmentName}`,
      react: emailElement,
    });
  } else {
    // Use the general invitation template
    const { InvitationEmail } = await import('@/emails/invitation');
    
    const emailElement = InvitationEmail({
      inviteUrl,
      recipientName,
      recipientEmail: to,
      companyName,
      companyLogo,
      inviterName,
      personalMessage,
    });
    
    return sendEmail({
      to,
      subject: `You're invited to join ${companyName} on Campfire`,
      react: emailElement,
    });
  }
}

/**
 * Check if email service is configured
 */
export function isEmailServiceConfigured(): boolean {
  return USE_SENDGRID || USE_RESEND;
}

/**
 * Get configured email service name
 */
export function getEmailServiceName(): string {
  if (USE_SENDGRID) return 'SendGrid';
  if (USE_RESEND) return 'Resend';
  return 'None';
}