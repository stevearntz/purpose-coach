-- Database Cleanup Script
-- Keeps only steve@getcampfire.com user and Campfire company

BEGIN;

-- First, identify the IDs we want to keep
DO $$
DECLARE
    keep_user_id TEXT;
    keep_company_id TEXT;
BEGIN
    -- Get the user ID for steve@getcampfire.com
    SELECT id INTO keep_user_id 
    FROM "UserProfile" 
    WHERE email = 'steve@getcampfire.com'
    LIMIT 1;
    
    -- Get the company ID for Campfire
    SELECT id INTO keep_company_id 
    FROM "Company" 
    WHERE name = 'Campfire'
    LIMIT 1;
    
    -- Store these IDs for reference
    RAISE NOTICE 'Keeping User ID: %', keep_user_id;
    RAISE NOTICE 'Keeping Company ID: %', keep_company_id;

    -- Delete all TeamMemberships except those owned by the kept user
    DELETE FROM "TeamMembership" 
    WHERE "teamOwnerId" != keep_user_id OR "teamOwnerId" IS NULL;
    
    -- Delete all TeamMembers not managed by the kept user
    DELETE FROM "TeamMember" 
    WHERE "managerId" != keep_user_id OR "managerId" IS NULL;
    
    -- Delete all AssessmentResults not belonging to the kept user
    DELETE FROM "AssessmentResult" 
    WHERE "userId" != keep_user_id OR "userId" IS NULL;
    
    -- Delete all CampaignAssignments not for the kept user
    DELETE FROM "CampaignAssignment" 
    WHERE "userId" != keep_user_id OR "userId" IS NULL;
    
    -- Delete all Campaigns not created by the kept company
    DELETE FROM "Campaign" 
    WHERE "companyId" != keep_company_id OR "companyId" IS NULL;
    
    -- Delete all TeamInvitations not from the kept company
    DELETE FROM "TeamInvitation" 
    WHERE "companyId" != keep_company_id OR "companyId" IS NULL;
    
    -- Delete all UserProfiles except the kept one
    DELETE FROM "UserProfile" 
    WHERE id != keep_user_id;
    
    -- Delete all Companies except Campfire
    DELETE FROM "Company" 
    WHERE id != keep_company_id;
    
    RAISE NOTICE 'Database cleanup completed successfully';
    
END $$;

-- Verify what remains
SELECT 'UserProfiles remaining:' as info, COUNT(*) as count FROM "UserProfile"
UNION ALL
SELECT 'Companies remaining:', COUNT(*) FROM "Company"
UNION ALL
SELECT 'TeamMembers remaining:', COUNT(*) FROM "TeamMember"
UNION ALL
SELECT 'AssessmentResults remaining:', COUNT(*) FROM "AssessmentResult"
UNION ALL
SELECT 'Campaigns remaining:', COUNT(*) FROM "Campaign";

COMMIT;