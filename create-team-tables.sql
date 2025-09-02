-- Add new column to UserProfile
ALTER TABLE "UserProfile" ADD COLUMN IF NOT EXISTS "clerkRole" TEXT;

-- Create TeamMemberStatus enum
CREATE TYPE "TeamMemberStatus" AS ENUM ('PENDING', 'INVITED', 'ACTIVE', 'INACTIVE');

-- Create TeamInvitationStatus enum  
CREATE TYPE "TeamInvitationStatus" AS ENUM ('PENDING', 'SENT', 'OPENED', 'COMPLETED', 'EXPIRED');

-- Create TeamMember table
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT,
    "status" "TeamMemberStatus" NOT NULL DEFAULT 'PENDING',
    "inviteCode" TEXT,
    "clerkUserId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- Create TeamMembership table
CREATE TABLE IF NOT EXISTS "TeamMembership" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "teamOwnerId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- Create TeamInvitation table
CREATE TABLE IF NOT EXISTS "TeamInvitation" (
    "id" TEXT NOT NULL,
    "teamMemberId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "inviteUrl" TEXT NOT NULL,
    "status" "TeamInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- Create unique constraints
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_inviteCode_key" UNIQUE ("inviteCode");
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_inviteCode_key" UNIQUE ("inviteCode");
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamMemberId_teamOwnerId_key" UNIQUE ("teamMemberId", "teamOwnerId");

-- Create indexes
CREATE INDEX IF NOT EXISTS "TeamMember_managerId_idx" ON "TeamMember"("managerId");
CREATE INDEX IF NOT EXISTS "TeamMember_email_idx" ON "TeamMember"("email");
CREATE INDEX IF NOT EXISTS "TeamMember_clerkUserId_idx" ON "TeamMember"("clerkUserId");
CREATE INDEX IF NOT EXISTS "TeamMember_companyId_idx" ON "TeamMember"("companyId");
CREATE INDEX IF NOT EXISTS "TeamMember_status_idx" ON "TeamMember"("status");

CREATE INDEX IF NOT EXISTS "TeamMembership_teamOwnerId_idx" ON "TeamMembership"("teamOwnerId");

CREATE INDEX IF NOT EXISTS "TeamInvitation_teamMemberId_idx" ON "TeamInvitation"("teamMemberId");
CREATE INDEX IF NOT EXISTS "TeamInvitation_campaignId_idx" ON "TeamInvitation"("campaignId");
CREATE INDEX IF NOT EXISTS "TeamInvitation_status_idx" ON "TeamInvitation"("status");

-- Add foreign key constraints
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_managerId_fkey" 
    FOREIGN KEY ("managerId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_companyId_fkey" 
    FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamMemberId_fkey" 
    FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamOwnerId_fkey" 
    FOREIGN KEY ("teamOwnerId") REFERENCES "UserProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamMemberId_fkey" 
    FOREIGN KEY ("teamMemberId") REFERENCES "TeamMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_campaignId_fkey" 
    FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;