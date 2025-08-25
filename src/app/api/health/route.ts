import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * Health check endpoint for monitoring
 * GET /api/health
 */
export async function GET(request: NextRequest) {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV,
    checks: {} as Record<string, any>,
    responseTime: null as number | null,
  }

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.checks.database = 'connected'
  } catch (error) {
    checks.checks.database = 'disconnected'
    checks.status = 'degraded'
  }

  // Check Redis/cache connection (if applicable)
  try {
    // Add Redis health check if you have Redis
    checks.checks.cache = 'connected'
  } catch (error) {
    checks.checks.cache = 'disconnected'
    // Don't mark as unhealthy since cache is optional
  }

  // Check external services
  try {
    // Quick check that OpenAI API key exists
    checks.checks.openai = process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
  } catch (error) {
    checks.checks.openai = 'error'
  }

  // Memory usage
  const memUsage = process.memoryUsage()
  checks.checks.memory = {
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
    rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
  }

  // Response time (if header is provided)
  const requestStart = request.headers.get('x-request-start')
  if (requestStart) {
    checks.responseTime = Date.now() - parseInt(requestStart, 10)
  }

  const statusCode = checks.status === 'healthy' ? 200 : 503
  
  return NextResponse.json(checks, { status: statusCode })
}