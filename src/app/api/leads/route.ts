import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';

// Types
interface Lead {
  id: string;
  email: string;
  name?: string;
  source: string;
  selectedChallenges?: string[];
  recommendedTools?: string[];
  userRole?: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

// Get Redis client
function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL not configured');
  }
  return new Redis(process.env.REDIS_URL);
}

// POST - Create new lead
export async function POST(request: NextRequest) {
  let redis: Redis | null = null;
  
  try {
    const body = await request.json();
    const { email, name, source, metadata } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    redis = getRedisClient();
    
    // Create lead object
    const lead: Lead = {
      id: nanoid(10),
      email: email.toLowerCase(),
      name,
      source: source || 'personal-development-plan',
      createdAt: new Date().toISOString(),
      ...metadata // Spread any additional metadata
    };
    
    // Store in Redis with multiple access patterns
    const pipeline = redis.pipeline();
    
    // 1. Store lead by ID
    pipeline.set(
      `lead:${lead.id}`,
      JSON.stringify(lead),
      'EX',
      60 * 60 * 24 * 90 // 90 days
    );
    
    // 2. Add to leads set (for listing all leads)
    pipeline.zadd('leads:all', Date.now(), lead.id);
    
    // 3. Add to email index (for duplicate checking)
    pipeline.set(
      `lead:email:${lead.email}`,
      lead.id,
      'EX',
      60 * 60 * 24 * 90
    );
    
    // 4. Add to daily set (for daily reporting)
    const today = new Date().toISOString().split('T')[0];
    pipeline.sadd(`leads:daily:${today}`, lead.id);
    pipeline.expire(`leads:daily:${today}`, 60 * 60 * 24 * 7); // Keep for 7 days
    
    // 5. Increment counters
    pipeline.incr('leads:total');
    pipeline.incr(`leads:source:${lead.source}`);
    
    await pipeline.exec();
    
    // Optional: Send to external services (non-blocking)
    sendToExternalServices(lead).catch(err => 
      console.error('Failed to send to external services:', err)
    );
    
    return NextResponse.json({ 
      success: true,
      leadId: lead.id,
      message: 'Lead captured successfully'
    });
    
  } catch (error) {
    console.error('Error capturing lead:', error);
    return NextResponse.json(
      { error: 'Failed to capture lead', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
}

// GET - Retrieve leads (admin endpoint - add auth in production!)
export async function GET(request: NextRequest) {
  let redis: Redis | null = null;
  
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const source = url.searchParams.get('source');
    
    redis = getRedisClient();
    
    // Get lead IDs
    let leadIds: string[];
    if (source) {
      // This would need a source index implementation
      leadIds = await redis.zrevrange('leads:all', 0, limit - 1);
    } else {
      leadIds = await redis.zrevrange('leads:all', 0, limit - 1);
    }
    
    // Get lead data
    const pipeline = redis.pipeline();
    leadIds.forEach(id => pipeline.get(`lead:${id}`));
    const results = await pipeline.exec();
    
    const leads = results
      ?.map(([err, data]) => data ? JSON.parse(data as string) : null)
      .filter(Boolean) || [];
    
    // Filter by source if specified
    const filteredLeads = source 
      ? leads.filter(lead => lead.source === source)
      : leads;
    
    // Return CSV if requested
    if (format === 'csv') {
      const csv = generateCSV(filteredLeads);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="leads-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // Get stats
    const stats = await getLeadStats(redis);
    
    return NextResponse.json({
      leads: filteredLeads,
      total: filteredLeads.length,
      stats
    });
    
  } catch (error) {
    console.error('Error retrieving leads:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve leads' },
      { status: 500 }
    );
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
}

// Helper: Generate CSV
function generateCSV(leads: Lead[]): string {
  const headers = ['ID', 'Email', 'Name', 'Source', 'Created At', 'Role', 'Challenges/Tool', 'Recommended Tools'];
  const rows = leads.map(lead => [
    lead.id,
    lead.email,
    lead.name || '',
    lead.source,
    lead.createdAt,
    lead.userRole || lead.metadata?.userRole || '',
    lead.source === 'tool' 
      ? (lead.metadata?.toolName || lead.toolName || '')
      : (lead.selectedChallenges?.join('; ') || ''),
    lead.recommendedTools?.join('; ') || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

// Helper: Get lead statistics
async function getLeadStats(redis: Redis) {
  const pipeline = redis.pipeline();
  pipeline.get('leads:total');
  pipeline.get('leads:source:personal-development-plan');
  pipeline.get('leads:source:tool');
  
  const today = new Date().toISOString().split('T')[0];
  pipeline.scard(`leads:daily:${today}`);
  
  const results = await pipeline.exec();
  
  return {
    total: parseInt(results?.[0]?.[1] as string || '0'),
    bySource: {
      personalDevelopmentPlan: parseInt(results?.[1]?.[1] as string || '0'),
      tool: parseInt(results?.[2]?.[1] as string || '0')
    },
    today: results?.[3]?.[1] || 0
  };
}

// Helper: Send to external services
async function sendToExternalServices(lead: Lead) {
  // Example integrations - implement as needed
  
  // Slack notification
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const isToolLead = lead.source === 'tool';
      const toolName = lead.metadata?.toolName || lead.toolName || 'Unknown Tool';
      const challengesList = lead.selectedChallenges?.join(', ') || 'None';
      const toolsList = lead.recommendedTools?.join(', ') || 'None';
      const userRole = lead.userRole || lead.metadata?.userRole || 'Not specified';
      
      let messageBlocks = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*🔥 New Lead Captured!*\n*Email:* ${lead.email}${lead.name ? `\n*Name:* ${lead.name}` : ''}`
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Role:*\n${userRole}`
            },
            {
              type: "mrkdwn",
              text: `*Source:*\n${lead.source.replace('-', ' ')}`
            }
          ]
        }
      ];
      
      if (isToolLead) {
        messageBlocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Tool Used:*\n${toolName}`
          }
        });
      } else {
        messageBlocks.push(
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Challenges:*\n${challengesList}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Recommended Tools:*\n${toolsList}`
            }
          }
        );
      }
      
      const slackMessage = {
        text: `🔥 New Campfire Lead!`,
        blocks: [
          ...messageBlocks,
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Captured at ${new Date(lead.createdAt).toLocaleString()}`
              }
            ]
          }
        ]
      };
      
      await fetch(process.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }
  
  // Mailchimp
  if (process.env.MAILCHIMP_API_KEY) {
    // await sendToMailchimp(lead);
  }
  
  // HubSpot
  if (process.env.HUBSPOT_API_KEY) {
    // await sendToHubspot(lead);
  }
  
  // Generic Webhook
  if (process.env.LEAD_WEBHOOK_URL) {
    await fetch(process.env.LEAD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead)
    });
  }
  
  console.log('Lead sent to external services:', lead.email);
}