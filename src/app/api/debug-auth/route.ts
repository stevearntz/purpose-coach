import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const { userId, orgId } = await auth()
  
  // Log the database URL (masked for security)
  const dbUrl = process.env.DATABASE_URL || 'not set'
  const dbUrlUnpooled = process.env.DATABASE_URL_UNPOOLED || 'not set'
  const dbInfo = {
    isNeon: dbUrl.includes('neon.tech'),
    isSupabase: dbUrl.includes('supabase.co'),
    urlStart: dbUrl.substring(0, 50) + '...',
    hasUnpooled: dbUrlUnpooled !== 'not set',
    unpooledIsNeon: dbUrlUnpooled.includes('neon.tech'),
    unpooledIsSupabase: dbUrlUnpooled.includes('supabase.co')
  }
  
  // Get user profile
  let userProfile = null
  let company = null
  
  if (userId) {
    console.log('[Debug Auth] Looking for user profile with clerkUserId:', userId)
    userProfile = await prisma.userProfile.findUnique({
      where: { clerkUserId: userId },
      include: { company: true }
    })
    console.log('[Debug Auth] Found profile?', !!userProfile)
  }
  
  // Try to find company by orgId
  if (orgId) {
    console.log('[Debug Auth] Looking for company with clerkOrgId:', orgId)
    company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId }
    })
    console.log('[Debug Auth] Found company?', !!company)
  }
  
  // Also get ALL companies to see what's in the DB
  const allCompanies = await prisma.company.findMany()
  const allProfiles = await prisma.userProfile.findMany()
  
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
      actualOrgId: orgId,
      databaseInfo: dbInfo,
      totalCompanies: allCompanies.length,
      totalProfiles: allProfiles.length,
      companiesInDb: allCompanies.map(c => ({
        name: c.name,
        clerkOrgId: c.clerkOrgId
      })),
      profilesInDb: allProfiles.map(p => ({
        email: p.email,
        clerkUserId: p.clerkUserId
      }))
    }
  })
}