import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Try to connect to database
    const adminCount = await prisma.admin.count()
    const companyCount = await prisma.company.count()
    
    // Try to find steve
    const steve = await prisma.admin.findUnique({
      where: { email: 'steve@getcampfire.com' },
      select: {
        id: true,
        email: true,
        password: true,
        company: {
          select: {
            name: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      database: 'connected',
      adminCount,
      companyCount,
      steveExists: !!steve,
      steveHasPassword: !!(steve?.password),
      steveCompany: steve?.company?.name,
      passwordHashStart: steve?.password?.substring(0, 7)
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      database: 'connection failed'
    })
  }
}