import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt for:', email);
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email },
      include: { company: true }
    });
    
    console.log('Admin found:', admin ? 'Yes' : 'No');
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Check if admin has a password set
    if (!(admin as any).password) {
      console.log('Admin has no password set');
      return NextResponse.json(
        { error: 'Please set up your password first. Check your invitation email for the setup link.' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValid = await verifyPassword(password, (admin as any).password);
    console.log('Password valid:', isValid);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    });
    
    // Generate token
    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      companyId: admin.companyId || ''
    });
    
    // Create response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        company: admin.company?.name || null
      }
    });
    
    // Set auth cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      domain: undefined // Let the browser handle the domain
    };
    
    console.log('[login] Setting auth cookie with options:', cookieOptions);
    response.cookies.set('campfire-auth', token, cookieOptions);
    console.log('[login] Cookie set on response');
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}