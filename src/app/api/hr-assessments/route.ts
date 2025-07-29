import { NextRequest, NextResponse } from 'next/server';
import Redis from 'ioredis';
import { nanoid } from 'nanoid';

// Types
interface HRAssessment {
  id: string;
  name: string;
  email: string;
  department: string;
  teamSize: string;
  selectedCategories: string[];
  categoryDetails: {
    [key: string]: {
      challenges: string[];
      details: string;
    }
  };
  skillGaps: string[];
  skillDetails: string;
  supportNeeds: string[];
  supportDetails: string;
  selectedPriorities: string[];
  customPriority?: string;
  teamPriorities: string;
  hrSupport: string;
  cultureNeeds: string[];
  cultureDetails: string;
  additionalInsights: string;
  aiFollowUp?: string;
  createdAt: string;
  domain: string;
}

// Get Redis client
function getRedisClient() {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL not configured');
  }
  return new Redis(process.env.REDIS_URL);
}

// Extract domain from email
function extractDomain(email: string): string {
  const parts = email.toLowerCase().split('@');
  return parts[1] || 'unknown';
}

// POST - Create new assessment
export async function POST(request: NextRequest) {
  let redis: Redis | null = null;
  
  try {
    const body = await request.json();
    const { managerData } = body;
    
    if (!managerData || !managerData.email) {
      return NextResponse.json(
        { error: 'Assessment data with email is required' },
        { status: 400 }
      );
    }
    
    redis = getRedisClient();
    
    // Create assessment object
    const assessment: HRAssessment = {
      id: nanoid(10),
      ...managerData,
      createdAt: new Date().toISOString(),
      domain: extractDomain(managerData.email)
    };
    
    // Store in Redis with multiple access patterns
    const pipeline = redis.pipeline();
    
    // 1. Store assessment by ID
    pipeline.set(
      `hr-assessment:${assessment.id}`,
      JSON.stringify(assessment),
      'EX',
      60 * 60 * 24 * 180 // 180 days
    );
    
    // 2. Add to assessments set (for listing all assessments)
    pipeline.zadd('hr-assessments:all', Date.now(), assessment.id);
    
    // 3. Add to domain-specific set
    pipeline.zadd(`hr-assessments:domain:${assessment.domain}`, Date.now(), assessment.id);
    
    // 4. Add to daily set (for daily reporting)
    const today = new Date().toISOString().split('T')[0];
    pipeline.sadd(`hr-assessments:daily:${today}`, assessment.id);
    pipeline.expire(`hr-assessments:daily:${today}`, 60 * 60 * 24 * 7); // Keep for 7 days
    
    // 5. Increment counters
    pipeline.incr('hr-assessments:total');
    pipeline.incr(`hr-assessments:domain-total:${assessment.domain}`);
    
    // 6. Track unique domains
    pipeline.sadd('hr-assessments:domains', assessment.domain);
    
    await pipeline.exec();
    
    // Optional: Send to external services (non-blocking)
    sendToExternalServices(assessment).catch(err => 
      console.error('Failed to send to external services:', err)
    );
    
    return NextResponse.json({ 
      success: true,
      assessmentId: assessment.id,
      message: 'Assessment saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving assessment:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
}

// GET - Retrieve assessments (admin endpoint)
export async function GET(request: NextRequest) {
  let redis: Redis | null = null;
  
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const domain = url.searchParams.get('domain');
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const password = url.searchParams.get('password');
    
    // Check password
    if (password !== 'G3t.c@mpf1r3.st3v3') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    redis = getRedisClient();
    
    // Get assessment IDs based on filter
    let assessmentIds: string[];
    if (domain) {
      assessmentIds = await redis.zrevrange(`hr-assessments:domain:${domain}`, 0, limit - 1);
    } else {
      assessmentIds = await redis.zrevrange('hr-assessments:all', 0, limit - 1);
    }
    
    // Get assessment data
    const pipeline = redis.pipeline();
    assessmentIds.forEach(id => pipeline.get(`hr-assessment:${id}`));
    const results = await pipeline.exec();
    
    const assessments = results
      ?.map(([err, data]) => data ? JSON.parse(data as string) : null)
      .filter(Boolean) || [];
    
    // Return CSV if requested
    if (format === 'csv') {
      const csv = generateCSV(assessments);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="hr-assessments-${domain || 'all'}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }
    
    // Get stats
    const stats = await getAssessmentStats(redis, domain || undefined);
    
    return NextResponse.json({
      assessments,
      total: assessments.length,
      stats
    });
    
  } catch (error) {
    console.error('Error retrieving assessments:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve assessments' },
      { status: 500 }
    );
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
}

// Helper: Generate CSV
function generateCSV(assessments: HRAssessment[]): string {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Domain',
    'Department',
    'Team Size',
    'Challenge Areas',
    'Skills to Develop',
    'Support Needs',
    'Priorities',
    'Created At'
  ];
  
  const rows = assessments.map(assessment => [
    assessment.id,
    assessment.name,
    assessment.email,
    assessment.domain,
    assessment.department,
    assessment.teamSize,
    assessment.selectedCategories.join('; '),
    assessment.skillGaps.join('; '),
    assessment.supportNeeds.join('; '),
    [...assessment.selectedPriorities, assessment.customPriority].filter(Boolean).join('; '),
    assessment.createdAt
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

// Helper: Get assessment statistics
async function getAssessmentStats(redis: Redis, domain?: string) {
  const pipeline = redis.pipeline();
  
  if (domain) {
    pipeline.get(`hr-assessments:domain-total:${domain}`);
    pipeline.zcard(`hr-assessments:domain:${domain}`);
  } else {
    pipeline.get('hr-assessments:total');
    pipeline.scard('hr-assessments:domains');
  }
  
  const today = new Date().toISOString().split('T')[0];
  pipeline.scard(`hr-assessments:daily:${today}`);
  
  const results = await pipeline.exec();
  
  return {
    total: parseInt(results?.[0]?.[1] as string || '0'),
    uniqueDomains: domain ? 1 : parseInt(results?.[1]?.[1] as string || '0'),
    today: results?.[2]?.[1] || 0
  };
}

// Helper: Send to external services
async function sendToExternalServices(assessment: HRAssessment) {
  // Slack notification
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const challengesList = assessment.selectedCategories.join(', ');
      const skillsList = assessment.skillGaps.join(', ');
      const supportList = assessment.supportNeeds.join(', ');
      
      const slackMessage = {
        text: `🏢 New HR Partnership Assessment!`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*🏢 New HR Partnership Assessment*\n*Manager:* ${assessment.name}\n*Email:* ${assessment.email}\n*Company:* ${assessment.domain}`
            }
          },
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Department:*\n${assessment.department}`
              },
              {
                type: "mrkdwn",
                text: `*Team Size:*\n${assessment.teamSize}`
              }
            ]
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Challenge Areas:*\n${challengesList || 'None'}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Skills to Develop:*\n${skillsList || 'None'}`
            }
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Support Needs:*\n${supportList || 'None'}`
            }
          },
          {
            type: "context",
            elements: [
              {
                type: "mrkdwn",
                text: `Completed at ${new Date(assessment.createdAt).toLocaleString()}`
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
  
  console.log('HR assessment sent to external services:', assessment.email);
}

// DELETE - Clear assessments for a specific domain (admin endpoint)
export async function DELETE(request: NextRequest) {
  let redis: Redis | null = null;
  
  try {
    const url = new URL(request.url);
    const domain = url.searchParams.get('domain');
    const password = url.searchParams.get('password');
    
    // Check password
    if (password !== 'G3t.c@mpf1r3.st3v3') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required' },
        { status: 400 }
      );
    }
    
    redis = getRedisClient();
    
    // Get all assessment IDs for domain
    const assessmentIds = await redis.zrange(`hr-assessments:domain:${domain}`, 0, -1);
    
    if (assessmentIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No assessments to delete',
        deletedCount: 0
      });
    }
    
    // Delete all assessment data
    const pipeline = redis.pipeline();
    
    // Delete individual assessment records
    assessmentIds.forEach(id => {
      pipeline.del(`hr-assessment:${id}`);
      pipeline.zrem('hr-assessments:all', id);
    });
    
    // Clear the domain set
    pipeline.del(`hr-assessments:domain:${domain}`);
    
    // Reset domain counter
    pipeline.del(`hr-assessments:domain-total:${domain}`);
    
    await pipeline.exec();
    
    return NextResponse.json({
      success: true,
      message: `All assessments for domain ${domain} deleted successfully`,
      deletedCount: assessmentIds.length
    });
    
  } catch (error) {
    console.error('Error deleting assessments:', error);
    return NextResponse.json(
      { error: 'Failed to delete assessments', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
}