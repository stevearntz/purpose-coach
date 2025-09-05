/**
 * User Company API - Migrated to New Standardized Pattern
 * 
 * This replaces route.ts with proper validation, error handling, and response format
 * Following the new API utilities pattern from /lib/api/
 */

import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { createApiHandlers, ApiContext } from '@/lib/api/handler'
import { successResponse } from '@/lib/api/responses'

// Define Zod schemas for validation
const CompanyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string().nullable(),
  clerkOrgId: z.string().nullable(),
  domains: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date()
}).nullable()

const GetCompanyResponseSchema = z.object({
  company: CompanyResponseSchema
})

// Handler implementation
async function handleGetCompany({ userId }: ApiContext) {
  // Get organization ID from Clerk auth (need to call auth again to get orgId)
  const { orgId } = await auth()
  
  console.log('[Company API] Auth check - userId:', userId, 'orgId:', orgId)
  
  // Try to find company by Clerk org ID first
  if (orgId) {
    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId }
    })
    
    console.log('[Company API] Found company by orgId?', !!company, company?.name)
    
    if (company) {
      return successResponse({ company })
    }
  } else {
    console.log('[Company API] No orgId from Clerk auth')
  }
  
  // Fallback: Look up the user's profile to get their companyId
  const userProfile = await prisma.userProfile.findUnique({
    where: { clerkUserId: userId }
  })
  
  console.log('[Company API] User profile found?', !!userProfile, 'companyId:', userProfile?.companyId)
  
  if (!userProfile || !userProfile.companyId) {
    console.log(`[Company API] No company found for user: ${userId}`)
    return successResponse({ company: null })
  }
  
  // Get the company by ID
  const company = await prisma.company.findUnique({
    where: { id: userProfile.companyId }
  })
  
  if (!company) {
    console.log(`Company not found with ID: ${userProfile.companyId}`)
    return successResponse({ company: null })
  }
  
  return successResponse({ company })
}

// Export the handlers using the new pattern
export const { GET } = createApiHandlers({
  GET: handleGetCompany
})