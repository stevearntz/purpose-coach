import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log('[signin] Attempting login for:', email)
    
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
      include: { company: true }
    })
    
    if (!admin || !admin.password) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password)
    
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }
    
    // Create JWT token
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || 'fallback-secret'
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        companyId: admin.companyId,
        companyName: admin.company?.name
      },
      secret,
      { expiresIn: '30d' }
    )
    
    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        company: admin.company?.name
      }
    })
    
    // Set cookie manually
    response.cookies.set({
      name: 'auth-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    })
    
    console.log('[signin] Login successful, cookie set')
    
    return response
  } catch (error) {
    console.error('[signin] Error:', error)
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 })
  }
}