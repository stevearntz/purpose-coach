import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const { userId, orgId } = await auth()
  
  // Get user profile
  let userProfile = null
  let company = null
  
  if (userId) {
    userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      include: { company: true }
    })
  }
  
  // Try to find company by orgId
  if (orgId) {
    company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId }
    })
  }
  
  return NextResponse.json({
    auth: {
      userId,
      orgId,
      hasOrg: !!orgId,
      hasUser: !!userId
    },
    database: {
      userProfile: userProfile ? {
        id: userProfile.id,
        email: userProfile.email,
        companyId: userProfile.companyId,
        companyName: userProfile.company?.name
      } : null,
      companyByOrgId: company ? {
        id: company.id,
        name: company.name,
        clerkOrgId: company.clerkOrgId
      } : null,
      companyByProfile: userProfile?.company ? {
        id: userProfile.company.id,
        name: userProfile.company.name,
        clerkOrgId: userProfile.company.clerkOrgId
      } : null
    },
    debug: {
      orgIdMatches: orgId === userProfile?.company?.clerkOrgId,
      expectedOrgId: userProfile?.company?.clerkOrgId,
      actualOrgId: orgId
    }
  })
}