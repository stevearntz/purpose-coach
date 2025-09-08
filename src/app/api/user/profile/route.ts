/**
 * User Profile API - Migrated to New Standardized Pattern
 * 
 * This replaces route.ts with proper validation, error handling, and response format
 * Following the new API utilities pattern from /lib/api/
 */

import { z } from 'zod'
import { NextRequest } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createApiHandlers, ApiContext } from '@/lib/api/handler'
import { successResponse, SuccessResponses } from '@/lib/api/responses'
import { CommonErrors, ApiError } from '@/lib/api/errors'
import { ErrorCodes } from '@/lib/api/types'

// Simple validation function to avoid import issues
async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError(
        ErrorCodes.INVALID_INPUT,
        'Invalid JSON in request body',
        400
      )
    }
    // Let Zod errors bubble up to be handled by errorResponse
    throw error
  }
}

// Define Zod schemas for validation
const UpdateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.string().optional(),
  department: z.string().optional(),
  teamSize: z.string().optional(),
  teamName: z.string().optional(),
  teamPurpose: z.string().optional(),
  teamEmoji: z.string().optional(),
  companyId: z.string().optional().nullable(),
  partialUpdate: z.boolean().optional().default(false)
})

const UserProfileResponseSchema = z.object({
  id: z.string(),
  clerkUserId: z.string(),
  email: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  role: z.string().nullable(),
  department: z.string().nullable(),
  teamSize: z.string().nullable(),
  teamName: z.string().nullable(),
  teamPurpose: z.string().nullable(),
  teamEmoji: z.string().nullable(),
  companyId: z.string().nullable(),
  onboardingComplete: z.boolean(),
  clerkRole: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  company: z.object({
    id: z.string(),
    name: z.string(),
    logo: z.string().nullable(),
    clerkOrgId: z.string().nullable(),
    domains: z.array(z.string()),
    createdAt: z.date(),
    updatedAt: z.date()
  }).nullable().optional()
})

// Handler implementations
async function handleGetProfile({ userId }: ApiContext) {
  // First try to get by Clerk user ID
  let profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: {
      company: true
    }
  })

  // If not found, get user's email from Clerk and try that
  if (!profile) {
    let client
    try {
      client = await clerkClient()
      const user = await client.users.getUser(userId)
      const email = user.emailAddresses[0]?.emailAddress
      
      if (email) {
        profile = await prisma.userProfile.findUnique({
          where: { email },
          include: {
            company: true
          }
        })
        
        // If found by email but with different Clerk ID, update it
        if (profile && profile.clerkUserId !== userId) {
          console.log(`[Profile API] Fixing Clerk ID mismatch for ${email}: ${profile.clerkUserId} -> ${userId}`)
          profile = await prisma.userProfile.update({
            where: { email },
            data: { clerkUserId: userId },
            include: {
              company: true
            }
          })
        }
      }
    } catch (error) {
      console.error('[Profile API] Error fetching user from Clerk:', error)
    }
  }

  // If still no profile, create one with Clerk data
  if (!profile) {
    try {
      const client = await clerkClient()
      const user = await client.users.getUser(userId)
      const email = user.emailAddresses[0]?.emailAddress
      
      if (email) {
        console.log(`[Profile API] Creating initial profile for ${email}`)
        
        // Get the user's organization/company if they have one
        let companyId: string | undefined
        const orgMemberships = await client.users.getOrganizationMembershipList({ 
          userId 
        })
        
        if (orgMemberships.data.length > 0) {
          const clerkOrgId = orgMemberships.data[0].organization.id
          const company = await prisma.company.findUnique({
            where: { clerkOrgId }
          })
          if (company) {
            companyId = company.id
          }
        }
        
        // Create the profile with initial data from Clerk
        profile = await prisma.userProfile.create({
          data: {
            clerkUserId: userId,
            email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: '',
            department: '',
            teamSize: '',
            teamName: '',
            teamPurpose: '',
            teamEmoji: '',
            onboardingComplete: false,
            clerkRole: orgMemberships.data[0]?.role || null,
            ...(companyId ? { companyId } : {})
          },
          include: {
            company: true
          }
        })
        
        console.log(`[Profile API] Created initial profile for ${email} with onboardingComplete: false`)
      }
    } catch (error) {
      console.error('[Profile API] Error creating initial profile:', error)
      return successResponse({ profile: null })
    }
  }

  return successResponse({ profile })
}

async function handleUpdateProfile({ userId, request }: ApiContext) {
  // Validate request body
  const body = await validateBody(request, UpdateProfileSchema)
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
    partialUpdate = false
  } = body

  // Get user from Clerk
  let client
  try {
    client = await clerkClient()
  } catch (error) {
    console.error('[Profile API] Failed to get Clerk client:', error)
    throw CommonErrors.internalError('Authentication service unavailable')
  }
  
  let user
  try {
    user = await client.users.getUser(userId)
  } catch (error) {
    console.error('[Profile API] Failed to get user from Clerk:', error)
    throw CommonErrors.notFound('User')
  }
  
  const email = user.emailAddresses[0]?.emailAddress
  if (!email) {
    throw CommonErrors.validationFailed('No email found for user')
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
    console.log('[Profile API] Setting teamName:', teamName)
    dbUpdateData.teamName = teamName
  }
  if (teamPurpose !== undefined) {
    console.log('[Profile API] Setting teamPurpose:', teamPurpose)
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
    
    try {
      await client.users.updateUser(userId, updatePayload)
    } catch (error) {
      console.error('[Profile API] Failed to update Clerk user:', error)
      throw CommonErrors.internalError('Failed to update user authentication data')
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
  const existingProfile = await prisma.userProfile.findUnique({
    where: { email }
  })
  
  let profile
  
  if (existingProfile && existingProfile.clerkUserId !== userId) {
    // Update the existing profile to use the new clerkUserId
    profile = await prisma.userProfile.update({
      where: { email },
      data: {
        ...dbUpdateData,
        clerkUserId: userId // Update to new Clerk user ID
      },
      include: {
        company: true
      }
    })
  } else {
    // Normal upsert
    console.log('[Profile API] Upserting with dbUpdateData:', dbUpdateData)
    console.log('[Profile API] Upserting with createData:', createData)
    profile = await prisma.userProfile.upsert({
      where: { clerkUserId: userId },
      update: dbUpdateData,
      create: createData,
      include: {
        company: true
      }
    })
    console.log('[Profile API] Profile after upsert - teamName:', profile.teamName, 'teamPurpose:', profile.teamPurpose)
  }

  return SuccessResponses.updated(
    { profile },
    'Profile updated successfully'
  )
}

// Export the handlers using the new pattern
export const { GET, POST } = createApiHandlers({
  GET: handleGetProfile,
  POST: handleUpdateProfile
})