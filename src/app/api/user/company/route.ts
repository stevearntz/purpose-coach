import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { userId, orgId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If no orgId, user is not part of an organization
    if (!orgId) {
      return NextResponse.json({ company: null })
    }

    // Look up the company by its Clerk organization ID
    const company = await prisma.company.findUnique({
      where: { clerkOrgId: orgId }
    })

    if (!company) {
      console.log(`No company found for Clerk org ID: ${orgId}`)
      return NextResponse.json({ company: null })
    }

    return NextResponse.json({ company })
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}