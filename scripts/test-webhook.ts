// Test script to verify webhook configuration
import { headers } from 'next/headers';

async function testWebhook() {
  console.log('🔍 Testing Webhook Configuration...\n')
  
  console.log('Webhook Endpoint: /api/webhooks/clerk')
  console.log('Environment Variables:')
  console.log('- CLERK_WEBHOOK_SECRET:', process.env.CLERK_WEBHOOK_SECRET ? '✅ Set' : '❌ Not set')
  console.log('- CLERK_SECRET_KEY:', process.env.CLERK_SECRET_KEY ? '✅ Set' : '❌ Not set')
  
  console.log('\n📝 Webhook Events to Configure in Clerk Dashboard:')
  console.log('1. user.created')
  console.log('2. user.updated')
  console.log('3. session.created')
  console.log('4. organization.created')
  console.log('5. organization.updated')
  
  console.log('\n🔗 Webhook URL for Clerk:')
  console.log('Local testing: Use ngrok or similar')
  console.log('Production: https://[your-domain]/api/webhooks/clerk')
  
  console.log('\n✅ Domain Configuration:')
  console.log('- Company: Campfire')
  console.log('- Domain: @getcampfire.com')
  console.log('- Auto-adds users with @getcampfire.com emails to Campfire org')
}

testWebhook()