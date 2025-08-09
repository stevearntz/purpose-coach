import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, email, password, name } = await request.json();
    
    if (!inviteCode || !email || !password) {
      return NextResponse.json(
        { error: 'Invite code, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Find invitation
    const invitation = await prisma.invitation.findUnique({
      where: { inviteCode },
      include: { company: true }
    });
    
    if (!invitation || invitation.email !== email) {
      return NextResponse.json(
        { error: 'Invalid invitation code or email' },
        { status: 401 }
      );
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create or update admin account
    let admin = await prisma.admin.findUnique({
      where: { email }
    });
    
    if (admin) {
      // Update existing admin with password
      admin = await prisma.admin.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: name || admin.name,
          lastLogin: new Date()
        }
      });
    } else {
      // Create new admin
      admin = await prisma.admin.create({
        data: {
          email,
          name: name || invitation.name,
          password: hashedPassword,
          companyId: invitation.companyId,
          lastLogin: new Date()
        }
      });
    }
    
    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    // Generate token
    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      companyId: admin.companyId
    });
    
    // Create response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        company: invitation.company.name
      }
    });
    
    // Set auth cookie
    response.cookies.set('campfire-auth', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Setup password error:', error);
    return NextResponse.json(
      { error: 'Failed to set up account' },
      { status: 500 }
    );
  }
}