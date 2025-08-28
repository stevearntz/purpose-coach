import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook test endpoint is working',
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET ? 'Set' : 'NOT SET - This is the problem!',
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  console.log('Test webhook received:', {
    headers: Object.fromEntries(req.headers.entries()),
    body,
    timestamp: new Date().toISOString()
  });
  
  return NextResponse.json({ 
    received: true,
    message: 'Test webhook received',
    hasWebhookSecret: !!process.env.CLERK_WEBHOOK_SECRET
  });
}