import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const {
      recipientEmail,
      recipientName,
      senderName,
      subject,
      message,
      assessmentType,
      status,
      campaignId,
      deadline
    } = await request.json();

    // Validate required fields
    if (!recipientEmail || !recipientName || !senderName || !subject || !message || !assessmentType || !status) {
      return NextResponse.json({
        error: 'Missing required fields',
        required: ['recipientEmail', 'recipientName', 'senderName', 'subject', 'message', 'assessmentType', 'status']
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json({
        error: 'Invalid email format'
      }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['completed', 'started', 'invited', 'pending'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        error: 'Invalid status',
        validStatuses
      }, { status: 400 });
    }

    // Assessment colors for gradients
    const assessmentColors: Record<string, { primary: string; secondary: string }> = {
      'HR Partnership Assessment': { primary: '#30C7C7', secondary: '#2A74B9' },
      'Trust Audit': { primary: '#FFA62A', secondary: '#DB4839' },
      'Burnout Assessment': { primary: '#74DEDE', secondary: '#30B859' },
      'Team Charter': { primary: '#FF6B6B', secondary: '#4ECDC4' },
      'Change Style Profile': { primary: '#F595B6', secondary: '#BF4C74' },
      'Decision Making Audit': { primary: '#6DC7FF', secondary: '#3C36FF' },
      'User Guide': { primary: '#30C7C7', secondary: '#2A74B9' },
    };

    const colors = assessmentColors[assessmentType] || { primary: '#8b5cf6', secondary: '#7c3aed' };

    // Get tagline for assessment type
    const getAssessmentTagline = (type: string) => {
      switch (type) {
        case 'HR Partnership Assessment':
          return 'Help us understand where you need support most, so we can better partner with you.';
        case 'Trust Audit':
          return 'Understand the trust dynamics within your team and identify areas for improvement.';
        case 'Burnout Assessment':
          return 'Assess your current stress levels and get personalized recommendations for well-being.';
        case 'Team Charter':
          return 'Define how your team works together and establish clear expectations.';
        case 'Change Style Profile':
          return 'Discover your preferred approach to change and how to work with others effectively.';
        case 'Decision Making Audit':
          return 'Evaluate your team\'s decision-making processes and improve effectiveness.';
        case 'User Guide':
          return 'Create a personal guide to help others understand how to work with you best.';
        default:
          return `Complete your ${type} assessment to get personalized insights.`;
      }
    };

    const tagline = getAssessmentTagline(assessmentType);

    // Construct HTML email template
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif; }
    table { border-collapse: collapse; }
    .email-container { max-width: 560px; margin: 0 auto; background-color: #f7f7f7; }
    .assessment-header {
      background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
      padding: 48px 32px;
      text-align: center;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    .assessment-icon { width: 60px; height: 60px; margin: 0 auto 16px; display: block; }
    .assessment-title {
      font-size: 28px;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.2;
      margin: 0 0 12px 0;
    }
    .assessment-subtitle {
      font-size: 16px;
      color: #ffffff;
      opacity: 0.95;
      line-height: 24px;
      margin: 0;
      max-width: 400px;
    }
    .content {
      background-color: #ffffff;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
      padding: 32px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .message-box {
      background-color: #f0f7ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .deadline-box {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 24px 0;
      border-radius: 4px;
      color: #92400e;
    }
    .button-container { text-align: center; margin: 32px 0; }
    .start-button {
      background-color: ${colors.primary};
      color: #ffffff;
      padding: 14px 40px;
      text-decoration: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      display: inline-block;
    }
    .footer-text {
      font-size: 13px;
      line-height: 20px;
      color: #888888;
      margin-top: 16px;
    }
    .hr { border: none; border-top: 1px solid #e5e5e5; margin: 32px 0; }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Assessment Header with Gradient -->
    <div class="assessment-header">
      <img src="https://tools.getcampfire.com/icons/lightbulb-white.png" alt="" class="assessment-icon">
      <h1 class="assessment-title">${assessmentType}</h1>
      <p class="assessment-subtitle">${tagline}</p>
    </div>

    <!-- Main Content -->
    <div class="content">
      <!-- Message from Sender -->
      <div class="message-box">
        <p style="margin: 0; font-size: 15px; line-height: 22px; color: #555555;">
          <strong>Message from ${senderName}:</strong><br>
          ${message}
        </p>
      </div>

      ${deadline && status !== 'completed' ? `
      <!-- Deadline Warning -->
      <div class="deadline-box">
        <p style="margin: 0; font-size: 15px; line-height: 22px; font-weight: bold;">
          📅 Please complete by: ${deadline}
        </p>
      </div>
      ` : ''}

      ${status !== 'completed' ? `
      <!-- Start Assessment Button -->
      <div class="button-container">
        <a href="#" class="start-button">Start Assessment</a>
      </div>

      <p style="font-size: 14px; color: #777777; margin-top: 16px; margin-bottom: 8px; text-align: center;">
        Or copy and paste this link into your browser:
      </p>
      <p style="text-align: center; font-size: 14px; word-break: break-all;">
        <a href="#" style="color: ${colors.primary}; text-decoration: underline;">[Assessment Link]</a>
      </p>

      <hr class="hr">

      <p style="font-size: 16px; line-height: 24px; color: #555555; margin-bottom: 16px;">
        <strong>What to expect:</strong>
      </p>
      <p style="font-size: 15px; line-height: 24px; color: #555555; margin-bottom: 8px; margin-left: 8px;">
        • Takes approximately 10-15 minutes to complete
      </p>
      <p style="font-size: 15px; line-height: 24px; color: #555555; margin-bottom: 8px; margin-left: 8px;">
        • Your responses help us understand your needs
      </p>
      <p style="font-size: 15px; line-height: 24px; color: #555555; margin-bottom: 8px; margin-left: 8px;">
        • Results will be shared with ${senderName} to improve support
      </p>
      <p style="font-size: 15px; line-height: 24px; color: #555555; margin-bottom: 8px; margin-left: 8px;">
        • All responses are confidential within your organization
      </p>

      <hr class="hr">
      ` : `
      <hr class="hr">
      `}

      <p class="footer-text">
        This assessment ${status === 'completed' ? 'notification' : 'invitation'} was sent by ${senderName}.
        ${status !== 'completed' ? 'If you have questions about this assessment, please contact them directly.' : ''}
      </p>

      <p class="footer-text">
        Powered by <a href="https://getcampfire.com" style="color: ${colors.primary}; text-decoration: underline;">Campfire</a>
        • Leadership Development Platform
      </p>
    </div>
  </div>
</body>
</html>`;

    // Return the constructed HTML template
    return NextResponse.json({
      success: true,
      message: 'Email template generated successfully',
      data: {
        recipientEmail,
        recipientName,
        senderName,
        subject,
        assessmentType,
        status,
        campaignId,
        deadline,
        htmlTemplate,
        colors: colors,
        previewText: `${senderName} sent you a message about the ${assessmentType}`
      }
    });

  } catch (error: any) {
    console.error('Send message error:', error);
    return NextResponse.json({
      error: 'Failed to generate email template',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Assessment email template API',
    usage: 'POST with required fields: recipientEmail, recipientName, senderName, subject, message, assessmentType, status',
    optionalFields: ['campaignId', 'deadline'],
    validStatuses: ['completed', 'started', 'invited', 'pending'],
    supportedAssessments: [
      'HR Partnership Assessment',
      'Trust Audit', 
      'Burnout Assessment',
      'Team Charter',
      'Change Style Profile',
      'Decision Making Audit',
      'User Guide'
    ]
  });
}