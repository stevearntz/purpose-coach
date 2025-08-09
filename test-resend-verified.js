// Test with verified domain
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function testWithVerifiedDomain() {
  console.log('Testing with verified domain...');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    // Now using YOUR verified domain
    const data = await resend.emails.send({
      from: 'Campfire <notifications@tools.getcampfire.com>',
      to: 'steve@getcampfire.com',
      subject: 'Test from Verified Domain - ' + new Date().toLocaleTimeString(),
      html: '<h2>Success!</h2><p>This email was sent from your verified domain.</p><p>Time: ' + new Date().toLocaleString() + '</p>',
    });
    
    console.log('Result:', JSON.stringify(data, null, 2));
    
    if (data.data?.id) {
      console.log('✅ Email sent successfully!');
      console.log('Email ID:', data.data.id);
      console.log('Check your inbox at steve@getcampfire.com');
    } else if (data.error) {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testWithVerifiedDomain();