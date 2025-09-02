import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`
    
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    const responseTime = Date.now() - startTime
    
    return NextResponse.json({
      status: 'unhealthy',
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}