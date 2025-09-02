/**
 * EXAMPLE: Refactored Team Members API
 * This shows how to use the new API utilities
 * 
 * DO NOT DEPLOY - This is for review only
 */

import { z } from 'zod'
import { prisma } from '@/lib/prisma-with-retry'
import { createApiHandlers, ApiContext } from '@/lib/api/handler'
import { successResponse, SuccessResponses } from '@/lib/api/responses'
import { validateBody, validateQuery } from '@/lib/api/validation'
import { CommonErrors } from '@/lib/api/errors'

// Define request/response schemas
const TeamMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email().nullable(),
  role: z.string().nullable(),
  managerId: z.string(),
  companyId: z.string(),
  status: z.string(),
  inviteCode: z.string().nullable(),
  createdAt: z.date(),
  clerkUserId: z.string().nullable(),
  claimedAt: z.date().nullable()
})

const CreateTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email().optional(),
  role: z.string().optional()
})

const CreateTeamMembersRequestSchema = z.object({
  members: z.array(CreateTeamMemberSchema).min(1, 'At least one member is required')
})

const UpdateTeamMemberSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  role: z.string().optional().nullable()
})

const UpdateTeamMembersRequestSchema = z.object({
  members: z.array(UpdateTeamMemberSchema).min(1)
})

const DeleteQuerySchema = z.object({
  id: z.string().min(1, 'Member ID is required')
})

// Handler implementations
async function handleGetTeamMembers({ userId }: ApiContext) {
  // Get the user's profile
  const userProfile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { company: true }
  })

  if (!userProfile) {
    throw CommonErrors.notFound('User profile')
  }

  // Get all team members managed by this user
  const teamMembers = await prisma.teamMember.findMany({
    where: { managerId: userProfile.id },
    orderBy: { createdAt: 'desc' }
  })

  return SuccessResponses.list(teamMembers)
}

async function handleCreateTeamMembers({ userId, request }: ApiContext) {
  // Validate request body
  const { members } = await validateBody(request, CreateTeamMembersRequestSchema)

  // Get the user's profile
  const userProfile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId },
    include: { company: true }
  })

  if (!userProfile) {
    throw CommonErrors.notFound('User profile')
  }

  // Ensure company exists
  let companyId = userProfile.companyId
  
  if (!companyId) {
    const email = userProfile.email
    const domain = email.split('@')[1]
    
    let company = await prisma.company.findFirst({
      where: { 
        domains: {
          has: domain
        }
      }
    })
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: domain,
          domains: [domain]
        }
      })
    }
    
    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: { companyId: company.id }
    })
    
    companyId = company.id
  }

  // Create team members with proper transaction
  const createdMembers = await prisma.$transaction(async (tx) => {
    const results = []
    
    for (const member of members) {
      const teamMember = await tx.teamMember.create({
        data: {
          managerId: userProfile.id,
          companyId: companyId!,
          name: member.name,
          email: member.email || null,
          role: member.role || null,
          status: 'PENDING',
          inviteCode: member.email ? generateInviteCode() : null
        }
      })

      await tx.teamMembership.create({
        data: {
          teamMemberId: teamMember.id,
          teamOwnerId: userProfile.id
        }
      })

      results.push(teamMember)
    }
    
    return results
  })

  return SuccessResponses.created(
    { teamMembers: createdMembers },
    `${createdMembers.length} team member(s) created successfully`
  )
}

async function handleUpdateTeamMembers({ userId, request }: ApiContext) {
  // Validate request body
  const { members } = await validateBody(request, UpdateTeamMembersRequestSchema)

  const userProfile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId }
  })

  if (!userProfile) {
    throw CommonErrors.notFound('User profile')
  }

  // Use transaction for atomicity
  const updatedMembers = await prisma.$transaction(async (tx) => {
    const results = []
    
    for (const member of members) {
      // Verify ownership
      const existing = await tx.teamMember.findFirst({
        where: {
          id: member.id,
          managerId: userProfile.id
        }
      })
      
      if (!existing) {
        throw CommonErrors.notFound(`Team member ${member.id}`)
      }
      
      const updated = await tx.teamMember.update({
        where: { id: member.id },
        data: {
          name: member.name,
          email: member.email,
          role: member.role
        }
      })
      
      results.push(updated)
    }
    
    return results
  })

  return SuccessResponses.updated(
    { teamMembers: updatedMembers },
    `${updatedMembers.length} team member(s) updated successfully`
  )
}

async function handleDeleteTeamMember({ userId, request }: ApiContext) {
  // Validate query parameters
  const { id: memberId } = validateQuery(request, DeleteQuerySchema)

  const userProfile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId }
  })

  if (!userProfile) {
    throw CommonErrors.notFound('User profile')
  }

  // Verify ownership before deletion
  const member = await prisma.teamMember.findFirst({
    where: {
      id: memberId,
      managerId: userProfile.id
    }
  })

  if (!member) {
    throw CommonErrors.notFound('Team member')
  }

  // Delete with cascade
  await prisma.teamMember.delete({
    where: { id: memberId }
  })

  return SuccessResponses.deleted('Team member deleted successfully')
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

// Export the handlers
export const { GET, POST, PUT, DELETE } = createApiHandlers({
  GET: handleGetTeamMembers,
  POST: handleCreateTeamMembers,
  PUT: handleUpdateTeamMembers,
  DELETE: handleDeleteTeamMember
})