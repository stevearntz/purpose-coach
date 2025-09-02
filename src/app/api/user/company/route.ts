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
  
  // If no orgId, user is not part of an organization
  if (!orgId) {
    return successResponse({ company: null })
  }

  // Look up the company by its Clerk organization ID
  const company = await prisma.company.findUnique({
    where: { clerkOrgId: orgId }
  })

  if (!company) {
    console.log(`No company found for Clerk org ID: ${orgId}`)
    return successResponse({ company: null })
  }

  return successResponse({ company })
}

// Export the handlers using the new pattern
export const { GET } = createApiHandlers({
  GET: handleGetCompany
})