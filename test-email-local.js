// Test email sending locally
require('dotenv').config({ path: '.env.local' });

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY);
  console.log('API Key prefix:', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
  
  try {
    const response = await fetch('http://localhost:3001/api/test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'steve@getcampfire.com',
        type: 'test'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmail();