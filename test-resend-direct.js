// Direct test of Resend API
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function testResendDirectly() {
  console.log('Testing Resend directly...');
  console.log('API Key exists:', !!process.env.RESEND_API_KEY);
  console.log('API Key:', process.env.RESEND_API_KEY?.substring(0, 15) + '...');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    const data = await resend.emails.send({
      from: 'Campfire <onboarding@resend.dev>', // Using Resend's test domain
      to: 'steve@getcampfire.com',
      subject: 'Test Email from Campfire (Direct Resend Test)',
      html: '<p>This is a test email sent directly through Resend API.</p><p>If you receive this, Resend is working!</p>',
    });
    
    console.log('Success! Email sent:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testResendDirectly();