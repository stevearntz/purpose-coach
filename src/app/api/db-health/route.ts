import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// Store recent health checks in memory
const healthHistory: any[] = []
const MAX_HISTORY = 100

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`
    
    // Get connection pool stats (if available)
    const poolStats = await prisma.$queryRaw<Array<{
      total_connections: bigint,
      active: bigint,
      idle: bigint
    }>>`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle
      FROM pg_stat_activity
      WHERE datname = current_database()
    `.then(stats => stats?.[0] ? {
      total_connections: Number(stats[0].total_connections),
      active: Number(stats[0].active),
      idle: Number(stats[0].idle)
    } : null).catch(() => null)
    
    // Count records in main tables for monitoring
    const [userCount, assessmentCount, campaignCount] = await Promise.all([
      prisma.userProfile.count(),
      prisma.assessmentResult.count(), 
      prisma.campaign.count()
    ]).catch(() => [0, 0, 0])
    
    const responseTime = Date.now() - startTime
    
    const healthCheck = {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString(),
      stats: {
        users: userCount,
        assessments: assessmentCount,
        campaigns: campaignCount
      },
      pool: poolStats || null,
      performance: {
        rating: responseTime < 100 ? 'excellent' : 
                responseTime < 500 ? 'good' : 
                responseTime < 1000 ? 'fair' : 'poor'
      }
    }
    
    // Store in history
    healthHistory.unshift(healthCheck)
    if (healthHistory.length > MAX_HISTORY) {
      healthHistory.pop()
    }
    
    // Calculate average response time from history
    const avgResponseTime = healthHistory
      .slice(0, 10)
      .reduce((sum, h) => sum + parseInt(h.responseTime), 0) / Math.min(healthHistory.length, 10)
    
    return NextResponse.json({
      ...healthCheck,
      averageResponseTime: `${Math.round(avgResponseTime)}ms`,
      recentChecks: healthHistory.length
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    const healthCheck = {
      status: 'unhealthy',
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }
    
    healthHistory.unshift(healthCheck)
    if (healthHistory.length > MAX_HISTORY) {
      healthHistory.pop()
    }
    
    return NextResponse.json(healthCheck, { status: 503 })
  }
}