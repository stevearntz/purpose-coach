import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { auth } from '@/auth'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
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
    
    if (!admin || !admin.password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password)
    
    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        error: 'Invalid credentials'
      }, { status: 401 })
    }
    
    // Create a JWT token compatible with NextAuth
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'fallback'
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        companyId: admin.company?.id,
        companyName: admin.company?.name,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      },
      secret
    )
    
    // Set the session cookie that NextAuth expects
    const cookieStore = cookies()
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieName = isProduction ? '__Secure-authjs.session-token' : 'authjs.session-token'
    
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    })
    
    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        companyId: admin.company?.id,
        companyName: admin.company?.name
      }
    })
    
  } catch (error) {
    console.error('[direct-login] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Authentication failed'
    }, { status: 500 })
  }
}