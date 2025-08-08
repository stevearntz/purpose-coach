import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import invitationStorage from '@/lib/invitationStorage';
import companyStorage from '@/lib/companyStorage';

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
    const body = await request.json();
    console.log('Account creation request received:', { 
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      inviteCode: body.inviteCode,
      company: body.company
    });
    
    const { firstName, lastName, email, password, inviteCode, company } = body;
    
    // Basic validation
    if (!firstName || !email || !password) {
      console.error('Missing required fields:', { firstName: !!firstName, email: !!email, password: !!password });
      return NextResponse.json(
        { error: 'Missing required fields', message: 'Please fill in all required fields' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    if (users.has(email.toLowerCase())) {
      console.log('User already exists:', email);
      return NextResponse.json(
        { error: 'An account with this email already exists', message: 'Please sign in instead or use a different email' },
        { status: 409 }
      );
    }
    
    // If there's an invite code, validate it (but allow account creation without one)
    let invitation = null;
    if (inviteCode && inviteCode !== 'undefined' && inviteCode !== 'null') {
      console.log('Validating invite code:', inviteCode);
      invitation = await invitationStorage.getInvitationByCode(inviteCode);
      
      if (!invitation) {
        console.error('Invalid invitation code:', inviteCode);
        // Don't block account creation, just log the issue
        console.log('Proceeding without invitation');
      }
      
      if (invitation) {
        console.log('Invitation found:', { 
          invitationEmail: invitation.email || 'Generic invitation', 
          providedEmail: email,
          company: invitation.company,
          isGenericLink: invitation.metadata?.isGenericLink
        });
        
        // Only check email match if invitation has a specific email AND it's not a generic link
        // Allow flexibility for generic invitations and invitations without pre-set emails
        if (invitation.email && !invitation.metadata?.isGenericLink && 
            invitation.email.toLowerCase() !== email.toLowerCase()) {
          console.warn('Email mismatch - allowing anyway for flexibility');
          // Just log the mismatch but don't block account creation
          // This allows users to use a different email if needed
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
    }
    
    // Get or create company
    let companyObj = null;
    if (invitation?.metadata?.companyId) {
      companyObj = await companyStorage.getCompanyById(invitation.metadata.companyId);
    }
    if (!companyObj) {
      companyObj = await companyStorage.getOrCreateCompanyFromEmail(email, company || invitation?.company);
    }
    
    // Create or update user in company storage
    let companyUser = await companyStorage.getUserByEmail(email.toLowerCase());
    if (companyUser) {
      // Update existing invited user to active
      companyUser = await companyStorage.updateUser(email.toLowerCase(), {
        firstName,
        lastName: lastName || '',
        status: 'active',
        lastSignIn: new Date().toISOString()
      });
    } else {
      // Create new user
      companyUser = await companyStorage.createUser({
        email: email.toLowerCase(),
        firstName,
        lastName: lastName || '',
        companyId: companyObj.id,
        role: 'member',
        status: 'active'
      });
    }
    
    // Create user account
    const user = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      company: companyObj.name,
      companyId: companyObj.id,
      createdAt: new Date().toISOString(),
      inviteCode,
      emailVerified: !!inviteCode, // Auto-verify if from invitation
    };
    
    // Store user (in production, save to database)
    users.set(user.email, user);
    console.log('User account created successfully:', {
      id: user.id,
      email: user.email,
      company: user.company,
      companyId: user.companyId
    });
    
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { 
        error: 'Failed to create account', 
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Note: users Map is available within this module only