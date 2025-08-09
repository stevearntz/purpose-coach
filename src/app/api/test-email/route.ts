import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendInvitationEmail, isEmailServiceConfigured } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { to, type = 'test' } = await request.json();
    
    if (!to) {
      return NextResponse.json({ 
        error: 'Email address is required' 
      }, { status: 400 });
    }
    
    // Check if email service is configured
    if (!isEmailServiceConfigured()) {
      return NextResponse.json({ 
        error: 'Email service not configured',
        message: 'Please set RESEND_API_KEY in environment variables',
        configured: false
      }, { status: 503 });
    }
    
    let result;
    
    if (type === 'invitation') {
      // Send a test invitation email
      result = await sendInvitationEmail({
        to,
        recipientName: 'Test User',
        companyName: 'Test Company',
        inviteUrl: 'https://tools.getcampfire.com/test-invite',
        personalMessage: 'This is a test invitation email to verify the email service is working correctly.'
      });
    } else {
      // Send a simple test email
      result = await sendEmail({
        to,
        subject: 'Campfire Email Test',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Test Successful!</h2>
            <p>This is a test email from your Campfire application.</p>
            <p>If you're seeing this, your email configuration is working correctly.</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              Sent from Campfire at ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        text: 'Email Test Successful! This is a test email from your Campfire application.'
      });
    }
    
    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: 'Test email sent successfully',
        emailId: result.data?.data?.id
      });
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Failed to send test email',
        details: result.error
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Test email error:', error);
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const configured = isEmailServiceConfigured();
  
  return NextResponse.json({
    configured,
    message: configured 
      ? 'Email service is configured' 
      : 'Email service not configured - set RESEND_API_KEY',
    provider: 'Resend',
    testEndpoint: '/api/test-email',
    usage: 'POST { "to": "email@example.com", "type": "test" | "invitation" }'
  });
}