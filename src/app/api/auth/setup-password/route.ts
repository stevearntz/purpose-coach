import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { signIn } from '@/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { inviteCode, email, password, name } = await request.json();
    
    console.log('Setup password for:', email, 'with invite code:', inviteCode);
    console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
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
    
    // Hash password using bcrypt directly (NextAuth compatible)
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create or update admin account
    let admin = await prisma.admin.findUnique({
      where: { email }
    });
    
    console.log('Existing admin found:', !!admin);
    
    if (admin) {
      // Update existing admin with password
      console.log('Updating existing admin with password');
      admin = await prisma.admin.update({
        where: { email },
        data: {
          password: hashedPassword,
          name: name || (admin as any).name,
          lastLogin: new Date()
        }
      });
    } else {
      // Create new admin
      console.log('Creating new admin for company:', invitation.companyId);
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
    
    console.log('Admin account ready:', admin.id);
    
    // Update invitation status
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });
    
    // Return success - the client will need to call signIn separately
    // We can't call signIn from here because it needs to be called from the client
    return NextResponse.json({
      success: true,
      user: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        company: invitation.company.name
      },
      message: 'Account created successfully. Please sign in.'
    });
  } catch (error) {
    console.error('Setup password error:', error);
    // In production, log more details for debugging
    if (process.env.NODE_ENV === 'production') {
      console.error('Setup password detailed error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: error?.constructor?.name
      });
    }
    
    // Return more helpful error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to set up account';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}