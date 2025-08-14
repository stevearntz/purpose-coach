import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { name, size, industry, adminEmail, adminName } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 })
    }
    
    // Check if company already exists
    const existingCompany = await prisma.company.findFirst({
      where: { name }
    })
    
    if (existingCompany) {
      return NextResponse.json({ 
        error: 'Company with this name already exists' 
      }, { status: 409 })
    }
    
    // Create company
    const company = await prisma.company.create({
      data: {
        name,
        logo: '🏢' // Default emoji logo
      }
    })
    
    // Update user's metadata in Clerk (server-side)
    const client = await clerkClient()
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        companyId: company.id,
        companyName: company.name,
        role: 'admin',
        onboardingComplete: false
      }
    })
    
    // Log the company creation
    console.log(`[Company Setup] Created company: ${name} (ID: ${company.id}) for user: ${userId}`)
    
    return NextResponse.json({
      success: true,
      companyId: company.id,
      companyName: company.name
    })
    
  } catch (error) {
    console.error('Failed to setup company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}