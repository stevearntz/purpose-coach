import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// Simple storage for tool invitations (in production, use database)
const toolInvitations = new Map<string, any>();

export async function POST(request: NextRequest) {
  try {
    const { toolId, toolName, toolPath, users, message, senderEmail } = await request.json();
    
    if (!toolId || !users || users.length === 0) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:3000';
    const invitations = [];
    
    for (const userEmail of users) {
      const invitationId = nanoid();
      const invitation = {
        id: invitationId,
        toolId,
        toolName,
        toolPath,
        toolUrl: `${baseUrl}${toolPath}`,
        userEmail,
        senderEmail,
        message,
        createdAt: new Date().toISOString(),
        status: 'sent'
      };
      
      // Store invitation
      toolInvitations.set(invitationId, invitation);
      invitations.push(invitation);
      
      // In production, send actual email here
      console.log(`Tool invitation sent:`, {
        to: userEmail,
        tool: toolName,
        url: invitation.toolUrl,
        from: senderEmail
      });
    }
    
    return NextResponse.json({
      success: true,
      sent: invitations.length,
      invitations: invitations.map(inv => ({
        id: inv.id,
        userEmail: inv.userEmail,
        toolUrl: inv.toolUrl
      }))
    });
    
  } catch (error) {
    console.error('Failed to send tool invitations:', error);
    return NextResponse.json({ error: 'Failed to send invitations' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const toolId = searchParams.get('toolId');
    const userEmail = searchParams.get('userEmail');
    
    let invitations = Array.from(toolInvitations.values());
    
    if (toolId) {
      invitations = invitations.filter(inv => inv.toolId === toolId);
    }
    
    if (userEmail) {
      invitations = invitations.filter(inv => 
        inv.userEmail === userEmail || inv.senderEmail === userEmail
      );
    }
    
    return NextResponse.json({ invitations });
    
  } catch (error) {
    console.error('Failed to get tool invitations:', error);
    return NextResponse.json({ error: 'Failed to get invitations' }, { status: 500 });
  }
}