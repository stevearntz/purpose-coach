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
  const profile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: {
      company: true
    }
  })

  if (!profile) {
    return successResponse({ profile: null })
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
    profile = await prisma.userProfile.upsert({
      where: { clerkUserId: userId },
      update: dbUpdateData,
      create: createData,
      include: {
        company: true
      }
    })
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