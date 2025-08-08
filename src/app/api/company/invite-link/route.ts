import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import invitationStorage from '@/lib/invitationStorage';
import companyStorage from '@/lib/companyStorage';

export async function POST(request: NextRequest) {
  try {
    const { senderEmail, company: companyName } = await request.json();
    
    if (!senderEmail) {
      return NextResponse.json({ error: 'Sender email is required' }, { status: 400 });
    }
    
    // Get or create company from sender's email
    const company = await companyStorage.getOrCreateCompanyFromEmail(senderEmail, companyName);
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    
    // Create a generic invitation for the company
    const inviteCode = nanoid(10);
    const invitation = {
      id: nanoid(),
      email: '', // Generic invitation without specific email
      name: '', // Generic - no specific name
      company: company.name || companyName || 'Your Company',
      companyLogo: company.logo || '',
      inviteCode,
      inviteUrl: `${baseUrl}/start?invite=${inviteCode}`,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      personalMessage: `Welcome to ${company.name || companyName || 'Campfire'}! Your team has partnered with Campfire to provide you with leadership development tools and resources.`,
      metadata: {
        invitedBy: senderEmail,
        companyId: company.id,
        isGenericLink: true
      }
    };
    
    // Save invitation
    console.log('[invite-link] Saving invitation with code:', inviteCode);
    await invitationStorage.saveInvitation(invitation);
    
    // Verify it was saved
    const saved = await invitationStorage.getInvitationByCode(inviteCode);
    console.log('[invite-link] Verification - invitation saved?', saved ? 'Yes' : 'No');
    
    console.log('[invite-link] Created generic invite link:', invitation.inviteUrl);
    
    return NextResponse.json({
      inviteUrl: invitation.inviteUrl,
      inviteCode,
      company: company.name
    });
    
  } catch (error) {
    console.error('Failed to create invite link:', error);
    return NextResponse.json({ error: 'Failed to create invite link' }, { status: 500 });
  }
}