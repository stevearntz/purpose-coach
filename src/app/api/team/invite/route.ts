import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { sendInvitationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { emails, companyId } = await request.json()
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: 'No emails provided' }, { status: 400 })
    }
    
    // Get the current user to get company details
    const clerk = await clerkClient()
    const currentUser = await clerk.users.getUser(userId)
    const companyName = currentUser.publicMetadata?.companyName as string || 'Your Company'
    
    const results = []
    
    for (const email of emails) {
      try {
        // Check if user already exists in Clerk
        const existingUsers = await clerk.users.getUserList({
          emailAddress: [email]
        })
        
        if (existingUsers.data.length > 0) {
          // User exists, just update their metadata
          const existingUser = existingUsers.data[0]
          await clerk.users.updateUser(existingUser.id, {
            publicMetadata: {
              ...existingUser.publicMetadata,
              companyId,
              companyName,
              role: 'member',
              invitedBy: userId
            }
          })
          
          results.push({ email, status: 'existing_user_updated' })
        } else {
          // Create invitation in Clerk
          const invitation = await clerk.invitations.createInvitation({
            emailAddress: email,
            publicMetadata: {
              companyId,
              companyName,
              role: 'member',
              invitedBy: userId
            },
            redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sign-up`
          })
          
          // Send custom email if email service is configured
          if (process.env.RESEND_API_KEY) {
            await sendInvitationEmail({
              to: email,
              companyName,
              inviteUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/sign-up?invitation=${invitation.id}`
            })
          }
          
          results.push({ email, status: 'invited', invitationId: invitation.id })
        }
      } catch (error) {
        console.error(`Failed to invite ${email}:`, error)
        results.push({ email, status: 'failed', error: error instanceof Error ? error.message : 'Unknown error' })
      }
    }
    
    return NextResponse.json({
      success: true,
      results
    })
    
  } catch (error) {
    console.error('Failed to invite team:', error)
    return NextResponse.json(
      { error: 'Failed to invite team members' },
      { status: 500 }
    )
  }
}