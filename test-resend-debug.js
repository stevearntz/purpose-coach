// Debug Resend sending
require('dotenv').config({ path: '.env.local' });
const { Resend } = require('resend');

async function debugResend() {
  console.log('=== Resend Debug ===');
  console.log('API Key from env:', process.env.RESEND_API_KEY);
  console.log('API Key exists:', !!process.env.RESEND_API_KEY);
  
  if (!process.env.RESEND_API_KEY) {
    console.error('❌ No API key found!');
    return;
  }
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    console.log('\nSending email...');
    const result = await resend.emails.send({
      from: 'notifications@getcampfire.com',
      to: 'steve@getcampfire.com',
      subject: 'Debug Test - ' + new Date().toISOString(),
      html: '<p>If you see this, Resend is working!</p>',
    });
    
    console.log('\nFull result:', JSON.stringify(result, null, 2));
    
    if (result.data?.id) {
      console.log('\n✅ SUCCESS! Email ID:', result.data.id);
      console.log('Check: https://resend.com/emails');
    } else if (result.error) {
      console.log('\n❌ ERROR:', result.error);
    } else {
      console.log('\n⚠️ Unexpected result:', result);
    }
  } catch (error) {
    console.error('\n❌ Exception:', error);
    if (error.response) {
      console.error('Response:', error.response);
    }
  }
}

debugResend();