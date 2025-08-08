import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import invitationStorage from '@/lib/invitationStorage';
import companyStorage from '@/lib/companyStorage';

export async function POST(request: NextRequest) {
  try {
    const { emails, message, senderEmail, company: companyName } = await request.json();
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'Emails are required' }, { status: 400 });
    }
    
    if (!senderEmail) {
      return NextResponse.json({ error: 'Sender email is required' }, { status: 400 });
    }
    
    // Get or create company from sender's email
    const company = await companyStorage.getOrCreateCompanyFromEmail(senderEmail, companyName);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    let sentCount = 0;
    const results = [];
    
    for (const email of emails) {
      try {
        // Parse name from email if not provided
        const emailParts = email.trim().split('@')[0];
        // Handle both dot and underscore separators
        const nameParts = emailParts.split(/[._-]/).filter(p => p.length > 0);
        const fullName = nameParts.map(part => 
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');
        
        console.log('[invite] Creating invitation for:', email, 'with name:', fullName);
        
        // Create invitation
        const inviteCode = nanoid(10);
        const invitation = {
          id: nanoid(),
          email: email.trim(),
          name: fullName, // Add the name field
          company: company.name,
          companyLogo: company.logo,
          inviteCode,
          inviteUrl: `${baseUrl}/start?invite=${inviteCode}`,
          status: 'sent' as const,
          createdAt: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          personalMessage: message || `You've been invited to join ${company.name} on Campfire`,
          metadata: {
            invitedBy: senderEmail,
            companyId: company.id
          }
        };
        
        // Save invitation
        await invitationStorage.saveInvitation(invitation);
        
        // Verify it was saved correctly
        const savedInvite = await invitationStorage.getInvitationByCode(inviteCode);
        console.log('[invite] Verification - saved invitation:', savedInvite ? {
          name: savedInvite.name,
          email: savedInvite.email,
          company: savedInvite.company
        } : 'NOT FOUND');
        
        // Create user record as invited
        // Use the same parsed name we created for the invitation
        const firstSpaceIndex = fullName.indexOf(' ');
        const userFirstName = firstSpaceIndex > -1 ? fullName.substring(0, firstSpaceIndex) : fullName;
        const userLastName = firstSpaceIndex > -1 ? fullName.substring(firstSpaceIndex + 1) : '';
        
        await companyStorage.createUser({
          email: email.trim(),
          firstName: userFirstName || 'User',
          lastName: userLastName || '',
          companyId: company.id,
          role: 'member',
          status: 'invited',
          invitedAt: new Date().toISOString()
        });
        
        sentCount++;
        results.push({
          email,
          success: true,
          inviteUrl: invitation.inviteUrl
        });
        
        // In production, send actual email here
        console.log(`Invitation sent to ${email}: ${invitation.inviteUrl}`);
        
      } catch (error) {
        console.error(`Failed to invite ${email}:`, error);
        results.push({
          email,
          success: false,
          error: 'Failed to create invitation'
        });
      }
    }
    
    return NextResponse.json({
      sent: sentCount,
      total: emails.length,
      results
    });
    
  } catch (error) {
    console.error('Failed to send invitations:', error);
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 });
  }
}