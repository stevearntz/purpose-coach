import { Resend } from 'resend';
import { ReactElement } from 'react';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

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
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions) {
  try {
    // Default from address - you'll need to verify this domain in Resend
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
    
    console.log('Email sent successfully:', {
      id: data.data?.id,
      to: options.to,
      subject: options.subject
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
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
  return !!process.env.RESEND_API_KEY;
}