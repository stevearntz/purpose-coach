// TEMPORARY ENDPOINT - DELETE AFTER USE
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Only allow in production with secret key
const TEMP_SECRET = process.env.TEMP_RESET_SECRET || 'your-secret-key-here'

export async function POST(request: NextRequest) {
  try {
    const { email, password, secret } = await request.json()
    
    // Check secret
    if (secret !== TEMP_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    })
    
    if (!admin) {
      return NextResponse.json({ error: 'Admin not found' }, { status: 404 })
    }
    
    // Hash and update password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    await prisma.admin.update({
      where: { email },
      data: { password: hashedPassword }
    })
    
    // Delete this endpoint after use for security
    return NextResponse.json({ 
      success: true,
      message: 'Password reset successfully. DELETE THIS ENDPOINT NOW!' 
    })
    
  } catch (error) {
    console.error('Reset error:', error)
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 })
  }
}