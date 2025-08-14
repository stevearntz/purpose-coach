import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log('[test-login] Attempting login for:', email)
    
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
      console.log('[test-login] Admin not found')
      return NextResponse.json({ 
        success: false, 
        error: 'Admin not found',
        email: email 
      })
    }
    
    if (!admin.password) {
      console.log('[test-login] Admin has no password')
      return NextResponse.json({ 
        success: false, 
        error: 'Admin has no password set' 
      })
    }
    
    // Test password
    console.log('[test-login] Testing password...')
    const passwordMatch = await bcrypt.compare(password, admin.password)
    
    console.log('[test-login] Password match:', passwordMatch)
    console.log('[test-login] Hash prefix:', admin.password.substring(0, 10))
    
    return NextResponse.json({
      success: passwordMatch,
      admin: passwordMatch ? {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        companyId: admin.company?.id,
        companyName: admin.company?.name
      } : null,
      error: passwordMatch ? null : 'Password mismatch',
      debug: {
        emailProvided: email,
        emailInDb: admin.email,
        passwordLength: password?.length,
        hashPrefix: admin.password.substring(0, 10),
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    console.error('[test-login] Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
  }
}