import sgMail from '@sendgrid/mail';
import { ReactElement } from 'react';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

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
 * Send an email using SendGrid
 */
export async function sendEmail(options: EmailOptions) {
  try {
    // Default from address - using subdomain to avoid conflicts
    const from = options.from || {
      email: 'notifications@tools.getcampfire.com',
      name: 'Campfire Tools'
    };
    
    // For React elements, we'll render them differently in Next.js
    let html = options.html;
    if (options.react) {
      // Import dynamically to avoid client-side issues
      const ReactDOMServer = await import('react-dom/server');
      html = ReactDOMServer.renderToStaticMarkup(options.react);
    }
    
    const msg = {
      to: options.to,
      from,
      subject: options.subject,
      html: html || '',
      text: options.text || '',
      replyTo: options.replyTo,
      cc: options.cc,
      bcc: options.bcc,
    };
    
    const response = await sgMail.send(msg as any);
    
    console.log('Email sent successfully via SendGrid:', {
      statusCode: response[0].statusCode,
      to: options.to,
      subject: options.subject
    });
    
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Failed to send email via SendGrid:', error);
    if (error.response) {
      console.error('SendGrid error body:', error.response.body);
    }
    return { success: false, error };
  }
}

/**
 * Send an invitation email using SendGrid
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
  return !!process.env.SENDGRID_API_KEY;
}