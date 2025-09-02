import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

export async function GET(req: NextRequest) {
  try {
    console.log('[Test Clerk] Starting...')
    const { userId } = await auth()
    console.log('[Test Clerk] userId:', userId)
    
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated', userId: null }, { status: 401 })
    }
    
    return NextResponse.json({ 
      success: true, 
      userId,
      message: 'Authentication working!'
    })
  } catch (error) {
    console.error('[Test Clerk] Error:', error)
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}