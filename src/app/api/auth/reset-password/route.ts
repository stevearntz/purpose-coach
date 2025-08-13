import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { z } from 'zod'

// Schema for request validation
const resetRequestSchema = z.object({
  email: z.string().email()
})

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8)
})

// Generate a secure reset token
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// Request password reset (sends token)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check which action to perform
    if (body.token && body.password) {
      // Reset password with token
      const { token, password } = resetPasswordSchema.parse(body)
      
      // For now, use a simple in-memory store or skip token validation
      // In production, you'd store this in Redis or database
      // Temporary: decode token to get email (insecure, just for testing)
      const decoded = Buffer.from(token, 'hex').toString('utf8')
      const [email, timestamp] = decoded.split('|')
      
      // Check if token is expired (1 hour)
      if (Date.now() - parseInt(timestamp) > 3600000) {
        return NextResponse.json(
          { error: 'Reset token has expired' },
          { status: 400 }
        )
      }
      
      const admin = await prisma.admin.findUnique({
        where: { email }
      })
      
      if (!admin) {
        return NextResponse.json(
          { error: 'Invalid or expired reset token' },
          { status: 400 }
        )
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 10)
      
      // Update password
      await prisma.admin.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword
        }
      })
      
      return NextResponse.json({ 
        success: true,
        message: 'Password reset successfully' 
      })
      
    } else {
      // Request reset token
      const { email } = resetRequestSchema.parse(body)
      
      // Find admin by email
      const admin = await prisma.admin.findUnique({
        where: { email }
      })
      
      if (!admin) {
        // Don't reveal if email exists
        return NextResponse.json({ 
          success: true,
          message: 'If an account exists with this email, a reset link will be sent.' 
        })
      }
      
      // Generate reset token with email and timestamp encoded
      // This is temporary - in production use proper token storage
      const tokenData = `${email}|${Date.now()}`
      const resetToken = Buffer.from(tokenData).toString('hex')
      
      // In production, you would send an email here
      // For now, we'll return the reset link (only in development)
      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`
      
      console.log('Password reset link:', resetLink)
      
      return NextResponse.json({ 
        success: true,
        message: 'Reset link generated',
        // Only include link in development
        ...(process.env.NODE_ENV === 'development' && { resetLink })
      })
    }
    
  } catch (error) {
    console.error('[reset-password] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process password reset' },
      { status: 500 }
    )
  }
}