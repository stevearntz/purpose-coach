import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    console.log('[Profile API] Starting POST request')
    const { userId } = await auth()
    
    if (!userId) {
      console.error('[Profile API] No userId found in auth')
      return NextResponse.json({ error: 'Unauthorized - no user ID' }, { status: 401 })
    }
    
    console.log('[Profile API] User authenticated:', userId)

    const body = await req.json()
    console.log('[Profile API] Request body:', JSON.stringify(body))
    const { 
      firstName, 
      lastName, 
      role, 
      department, 
      teamSize,
      teamName, 
      teamPurpose, 
      teamEmoji,
      companyId,
      partialUpdate = false // Flag to indicate partial update
    } = body

    // Get user from Clerk first
    console.log('[Profile API] Getting Clerk client...')
    let client
    try {
      client = await clerkClient()
    } catch (error) {
      console.error('[Profile API] Failed to get Clerk client:', error)
      throw error
    }
    
    console.log('[Profile API] Getting user from Clerk...')
    let user
    try {
      user = await client.users.getUser(userId)
    } catch (error) {
      console.error('[Profile API] Failed to get user from Clerk:', error)
      throw error
    }
    
    const email = user.emailAddresses[0]?.emailAddress
    console.log('[Profile API] User email:', email)

    if (!email) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 })
    }

    // Build update objects dynamically for partial updates
    const clerkUpdateData: any = {}
    const dbUpdateData: any = { email } // Always include email
    const publicMetadata: any = {}

    // Only include fields that are provided
    if (firstName !== undefined) {
      clerkUpdateData.firstName = firstName
      dbUpdateData.firstName = firstName
    }
    if (lastName !== undefined) {
      clerkUpdateData.lastName = lastName
      dbUpdateData.lastName = lastName
    }
    if (role !== undefined) {
      publicMetadata.role = role
      dbUpdateData.role = role
    }
    if (department !== undefined) {
      publicMetadata.department = department
      dbUpdateData.department = department
    }
    if (teamSize !== undefined) {
      publicMetadata.teamSize = teamSize
      dbUpdateData.teamSize = teamSize
    }
    if (teamName !== undefined) {
      dbUpdateData.teamName = teamName
    }
    if (teamPurpose !== undefined) {
      dbUpdateData.teamPurpose = teamPurpose
    }
    if (teamEmoji !== undefined) {
      dbUpdateData.teamEmoji = teamEmoji
    }
    // Handle companyId - expecting the database Company ID, not Clerk org ID
    if (companyId !== undefined) {
      dbUpdateData.companyId = companyId
    }

    // Only set onboardingComplete if all required fields are present or if explicitly not a partial update
    if (!partialUpdate) {
      publicMetadata.onboardingComplete = true
      dbUpdateData.onboardingComplete = true
    }

    // Update Clerk if there's data to update
    if (Object.keys(clerkUpdateData).length > 0 || Object.keys(publicMetadata).length > 0) {
      const updatePayload: any = { ...clerkUpdateData }
      if (Object.keys(publicMetadata).length > 0) {
        updatePayload.publicMetadata = publicMetadata
      }
      console.log('[Profile API] Updating Clerk user with:', JSON.stringify(updatePayload))
      try {
        await client.users.updateUser(userId, updatePayload)
        console.log('[Profile API] Clerk user updated successfully')
      } catch (error) {
        console.error('[Profile API] Failed to update Clerk user:', error)
        throw error
      }
    }

    // Build create data without companyId if it's null/undefined
    const createData: any = {
      clerkUserId: userId,
      email,
      firstName: dbUpdateData.firstName || null,
      lastName: dbUpdateData.lastName || null,
      role: dbUpdateData.role || null,
      department: dbUpdateData.department || null,
      teamSize: dbUpdateData.teamSize || null,
      teamName: dbUpdateData.teamName || null,
      teamPurpose: dbUpdateData.teamPurpose || null,
      teamEmoji: dbUpdateData.teamEmoji || null,
      onboardingComplete: dbUpdateData.onboardingComplete || false
    }
    
    // Only add companyId if it exists and is valid
    if (dbUpdateData.companyId) {
      createData.companyId = dbUpdateData.companyId
    }

    // Save to database - handle potential email conflicts
    console.log('Saving profile for user:', userId, 'with data:', createData)
    
    // First, check if a profile exists with this email but different clerkUserId
    const existingProfile = await prisma.userProfile.findUnique({
      where: { email }
    })
    
    let profile
    
    if (existingProfile && existingProfile.clerkUserId !== userId) {
      // Update the existing profile to use the new clerkUserId
      console.log('[Profile API] Updating existing profile with new clerkUserId')
      profile = await prisma.userProfile.update({
        where: { email },
        data: {
          ...dbUpdateData,
          clerkUserId: userId // Update to new Clerk user ID
        }
      })
    } else {
      // Normal upsert
      profile = await prisma.userProfile.upsert({
        where: { clerkUserId: userId },
        update: dbUpdateData,
        create: createData
      })
    }
    
    console.log('Profile saved successfully:', profile.id)

    return NextResponse.json({ success: true, profile })
  } catch (error) {
    console.error('Error saving profile - Full error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    // Return more detailed error in production for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { 
        error: 'Failed to save profile',
        details: process.env.NODE_ENV === 'production' ? errorMessage : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      console.error('GET profile - No userId found in auth')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('Fetching profile for user:', userId)

    const profile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      include: {
        company: true
      }
    })

    if (!profile) {
      return NextResponse.json({ profile: null })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}