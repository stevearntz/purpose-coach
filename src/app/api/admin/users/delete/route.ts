import { NextRequest, NextResponse } from 'next/server'
import { auth, clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const { userId, orgId, orgRole } = await auth()
    
    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Only admins can delete users
    if (orgRole !== 'org:admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
    
    // Get the user to delete from request body
    const { email, clerkUserId, membershipId, isClerkUser } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Prevent self-deletion
    const client = await clerkClient()
    const currentUser = await client.users.getUser(userId)
    const currentUserEmail = currentUser.emailAddresses[0]?.emailAddress
    
    if (currentUserEmail === email) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }
    
    console.log(`[Delete User] Starting deletion for ${email}`)
    
    // Step 1: Delete from database tables
    try {
      // Start a transaction to ensure all database operations succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Find UserProfile if it exists
        const userProfile = await tx.userProfile.findUnique({
          where: { email }
        })
        
        if (userProfile) {
          console.log(`[Delete User] Found UserProfile for ${email}, deleting related records...`)
          
          // Delete TeamMemberships where this user is the team owner
          await tx.teamMembership.deleteMany({
            where: { teamOwnerId: userProfile.id }
          })
          
          // Delete TeamMembers created by this user
          await tx.teamMember.deleteMany({
            where: { managerId: userProfile.id }
          })
        }
        
        // Delete TeamMembers with this email
        await tx.teamMember.deleteMany({
          where: { email }
        })
        
        // Delete Invitations
        const invitations = await tx.invitation.findMany({
          where: { email }
        })
        
        // Delete AssessmentResults linked to these invitations
        for (const invitation of invitations) {
          await tx.assessmentResult.deleteMany({
            where: { invitationId: invitation.id }
          })
        }
        
        // Delete InvitationMetadata (will cascade with Invitation deletion)
        await tx.invitation.deleteMany({
          where: { email }
        })
        
        // Finally, delete the UserProfile
        if (userProfile) {
          await tx.userProfile.delete({
            where: { id: userProfile.id }
          })
        }
        
        console.log(`[Delete User] Database records deleted for ${email}`)
      })
    } catch (dbError) {
      console.error('[Delete User] Database deletion error:', dbError)
      return NextResponse.json(
        { error: 'Failed to delete user data from database' },
        { status: 500 }
      )
    }
    
    // Step 2: Remove from Clerk organization (if they're a Clerk user)
    if (isClerkUser && membershipId) {
      try {
        console.log(`[Delete User] Removing ${email} from Clerk organization...`)
        
        // Remove user from organization
        // We need the actual Clerk user ID for this operation
        if (clerkUserId) {
          try {
            await client.organizations.deleteOrganizationMembership({
              organizationId: orgId,
              userId: clerkUserId
            })
            console.log(`[Delete User] Removed from organization ${orgId}`)
          } catch (membershipError) {
            console.error(`[Delete User] Failed to remove from organization:`, membershipError)
            // Try alternative method using organizationMemberships API
            try {
              await client.organizationMemberships.deleteOrganizationMembership({
                organizationId: orgId,
                userId: clerkUserId
              })
              console.log(`[Delete User] Removed from organization using alternative method`)
            } catch (altError) {
              console.error(`[Delete User] Alternative removal also failed:`, altError)
              throw altError
            }
          }
        } else {
          console.log(`[Delete User] Warning: No Clerk user ID available, cannot remove from organization`)
        }
        
        // Only check for remaining memberships if we have the actual user ID
        if (clerkUserId) {
          // Check if user has other organization memberships
          const remainingMemberships = await client.users.getOrganizationMembershipList({
            userId: clerkUserId
          })
          
          // If no other memberships, delete the user entirely from Clerk
          if (remainingMemberships.data.length === 0) {
            console.log(`[Delete User] No other org memberships, deleting Clerk user entirely...`)
            await client.users.deleteUser(clerkUserId)
            console.log(`[Delete User] Clerk user deleted completely`)
          } else {
            console.log(`[Delete User] User has ${remainingMemberships.data.length} other org memberships, keeping Clerk account`)
          }
        } else {
          console.log(`[Delete User] No Clerk user ID available, skipping full user deletion check`)
        }
      } catch (clerkError) {
        console.error('[Delete User] Clerk deletion error:', clerkError)
        // Don't fail the whole operation if Clerk deletion fails
        // Database is already cleaned up
        return NextResponse.json({
          success: true,
          warning: 'User data deleted but could not remove from authentication system',
          email
        })
      }
    }
    
    console.log(`[Delete User] Successfully deleted all data for ${email}`)
    
    return NextResponse.json({
      success: true,
      message: `User ${email} has been deleted successfully`,
      email
    })
    
  } catch (error) {
    console.error('[Delete User] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the user' },
      { status: 500 }
    )
  }
}