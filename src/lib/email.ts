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
      const from = options.from || 'Campfire <notifications@getcampfire.com>';
      
      const data = await resend.emails.send({
        from,
        to: options.to,
        subject: options.subject,
        react: options.react,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      });
      
      console.log('Email sent successfully via Resend:', {
        id: data.data?.id,
        to: options.to,
        subject: options.subject
      });
      
      return { success: true, data };
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return { success: false, error };
    }
  } else {
    console.warn('No email service configured');
    return { success: false, error: 'No email service configured' };
  }
}

/**
 * Send an invitation email
 */
export async function sendInvitationEmail({
  to,
  recipientName,
  companyName,
  companyLogo,
  inviteUrl,
  inviterName,
  personalMessage,
}: {
  to: string;
  recipientName?: string;
  companyName: string;
  companyLogo?: string;
  inviteUrl: string;
  inviterName?: string;
  personalMessage?: string;
}) {
  // Dynamically import the email template to avoid client-side issues
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