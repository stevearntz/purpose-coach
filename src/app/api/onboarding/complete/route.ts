import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get current user metadata
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    // Update user's metadata to mark onboarding as complete
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...user.publicMetadata,
        onboardingComplete: true
      }
    })
    
    console.log(`[Onboarding] Completed for user: ${userId}`)
    
    return NextResponse.json({
      success: true
    })
    
  } catch (error) {
    console.error('Failed to complete onboarding:', error)
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    )
  }
}