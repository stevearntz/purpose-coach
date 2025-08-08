import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import invitationStorage from '@/lib/invitationStorage';

// Simple in-memory user storage (replace with database in production)
const users = new Map<string, any>();

// Hash password using crypto (in production, use bcrypt or argon2)
function hashPassword(password: string): string {
  return crypto
    .createHash('sha256')
    .update(password + process.env.PASSWORD_SALT || 'default-salt')
    .digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, inviteCode, company } = await request.json();
    
    // Basic validation
    if (!firstName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    if (users.has(email.toLowerCase())) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    
    // If there's an invite code, validate it
    let invitation = null;
    if (inviteCode) {
      invitation = await invitationStorage.getInvitationByCode(inviteCode);
      if (!invitation) {
        return NextResponse.json(
          { error: 'Invalid invitation code' },
          { status: 400 }
        );
      }
      
      // Check if invitation email matches (if provided in invitation)
      if (invitation.email && invitation.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Email does not match invitation' },
          { status: 400 }
        );
      }
      
      // Update invitation status
      await invitationStorage.updateInvitation(inviteCode, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        metadata: {
          ...invitation.metadata,
          accountCreated: true,
          accountEmail: email
        }
      });
    }
    
    // Create user account
    const user = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      company: company || invitation?.company,
      createdAt: new Date().toISOString(),
      inviteCode,
      emailVerified: !!inviteCode, // Auto-verify if from invitation
    };
    
    // Store user (in production, save to database)
    users.set(user.email, user);
    
    // Create session token (in production, use proper JWT or session management)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Return success with user info (excluding password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.company,
        emailVerified: user.emailVerified
      },
      sessionToken
    });
    
  } catch (error) {
    console.error('Account creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}

// Export users for potential future use
export { users };