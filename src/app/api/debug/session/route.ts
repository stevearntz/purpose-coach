import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    const { userId, sessionClaims } = await auth()
    const user = await currentUser()
    
    return NextResponse.json({
      userId,
      sessionClaims,
      userPublicMetadata: user?.publicMetadata,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}