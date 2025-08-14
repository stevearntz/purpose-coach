import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Check environment
    const envCheck = {
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL || 'not set',
      databaseUrl: !!process.env.DATABASE_URL
    }
    
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'Admin not found',
        email: email,
        envCheck
      })
    }
    
    if (!admin.password) {
      return NextResponse.json({
        success: false,
        error: 'Admin has no password set',
        adminFound: true,
        envCheck
      })
    }
    
    // Test password
    const passwordMatch = await bcrypt.compare(password, admin.password)
    
    return NextResponse.json({
      success: passwordMatch,
      adminFound: true,
      hasPassword: true,
      passwordMatch,
      admin: passwordMatch ? {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        companyId: admin.company?.id,
        companyName: admin.company?.name
      } : null,
      hashPrefix: admin.password.substring(0, 7), // Safe to log bcrypt version
      envCheck
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      envCheck: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    })
  }
}