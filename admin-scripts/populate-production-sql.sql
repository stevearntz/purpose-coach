-- Sample Data Population Script for Production
-- Run this in Supabase SQL Editor
-- This populates all dashboard tabs with realistic sample data

-- Get IDs for reference
DO $$
DECLARE
  v_company_id varchar := 'cme7wq5ka0000dqdpws8k3uxu';
  v_admin_id varchar := 'steve-admin-id-123';
  v_invitation_id uuid;
  v_campaign_id uuid;
  i integer;
BEGIN
  -- Create 25 sample invitations with varied statuses
  FOR i IN 1..25 LOOP
    v_invitation_id := gen_random_uuid();
    
    INSERT INTO "Invitation" (
      id, email, name, "inviteCode", "inviteUrl", 
      status, "personalMessage", "companyId", "adminId",
      "createdAt", "sentAt", "openedAt", "startedAt", "completedAt"
    ) VALUES (
      v_invitation_id,
      'user' || i || '@example.com',
      'Test User ' || i,
      substr(md5(random()::text), 1, 8),
      'https://tools.getcampfire.com/start?code=' || substr(md5(random()::text), 1, 8),
      CASE 
        WHEN i <= 5 THEN 'PENDING'::"InvitationStatus"
        WHEN i <= 10 THEN 'SENT'::"InvitationStatus"
        WHEN i <= 15 THEN 'OPENED'::"InvitationStatus"
        WHEN i <= 20 THEN 'STARTED'::"InvitationStatus"
        ELSE 'COMPLETED'::"InvitationStatus"
      END,
      CASE WHEN i % 3 = 0 THEN 'Welcome to our culture transformation journey!' ELSE NULL END,
      v_company_id,
      v_admin_id,
      NOW() - INTERVAL '30 days' + (i * INTERVAL '1 day'),
      CASE WHEN i > 5 THEN NOW() - INTERVAL '25 days' + (i * INTERVAL '1 day') ELSE NULL END,
      CASE WHEN i > 10 THEN NOW() - INTERVAL '20 days' + (i * INTERVAL '1 day') ELSE NULL END,
      CASE WHEN i > 15 THEN NOW() - INTERVAL '15 days' + (i * INTERVAL '1 day') ELSE NULL END,
      CASE WHEN i > 20 THEN NOW() - INTERVAL '10 days' + (i * INTERVAL '1 day') ELSE NULL END
    );
    
    -- Add metadata for some invitations
    IF i <= 15 THEN
      INSERT INTO "InvitationMetadata" (
        id, "invitationId", role, challenges, "toolsAccessed", "accountCreated", "accountEmail"
      ) VALUES (
        gen_random_uuid(),
        v_invitation_id,
        CASE i % 5
          WHEN 0 THEN 'Software Engineer'
          WHEN 1 THEN 'Product Manager'
          WHEN 2 THEN 'Designer'
          WHEN 3 THEN 'Sales Manager'
          ELSE 'Marketing Director'
        END,
        ARRAY['Work-life balance', 'Team communication', 'Career growth'],
        CASE WHEN i > 20 THEN ARRAY['purpose', 'values', 'trust-audit'] ELSE ARRAY[]::text[] END,
        i > 15,
        CASE WHEN i > 15 THEN 'user' || i || '@example.com' ELSE NULL END
      );
    END IF;
    
    -- Add assessment results for completed invitations
    IF i > 20 THEN
      -- Purpose assessment
      INSERT INTO "AssessmentResult" (
        id, "invitationId", "toolId", "toolName", responses, scores, summary, "completedAt"
      ) VALUES (
        gen_random_uuid(),
        v_invitation_id,
        'purpose',
        'Purpose Discovery',
        jsonb_build_object(
          'purpose', 'To inspire and empower others',
          'values', ARRAY['Growth', 'Innovation', 'Impact']
        ),
        jsonb_build_object('overall', 85 + (i % 15)),
        'Your purpose centers on inspiring and empowering others to reach their full potential.',
        NOW() - INTERVAL '5 days'
      );
      
      -- Values assessment
      INSERT INTO "AssessmentResult" (
        id, "invitationId", "toolId", "toolName", responses, scores, summary, "completedAt"
      ) VALUES (
        gen_random_uuid(),
        v_invitation_id,
        'values',
        'Values Assessment',
        jsonb_build_object(
          'coreValues', ARRAY['Integrity', 'Excellence', 'Collaboration']
        ),
        jsonb_build_object('alignment', 75 + (i % 20)),
        'Your core values of integrity, excellence, and collaboration guide your decisions.',
        NOW() - INTERVAL '4 days'
      );
    END IF;
  END LOOP;
  
  -- Create 5 sample campaigns
  FOR i IN 1..5 LOOP
    v_campaign_id := gen_random_uuid();
    
    INSERT INTO "Campaign" (
      id, name, description, status, "companyId",
      "startDate", "endDate", "createdAt"
    ) VALUES (
      v_campaign_id,
      CASE i
        WHEN 1 THEN 'Q1 2024 Culture Assessment'
        WHEN 2 THEN 'Leadership Development Program'
        WHEN 3 THEN 'Team Effectiveness Initiative'
        WHEN 4 THEN 'Annual Engagement Survey'
        ELSE 'New Manager Onboarding'
      END,
      'Building stronger teams and culture through assessment and development',
      CASE 
        WHEN i = 1 THEN 'ACTIVE'::"CampaignStatus"
        WHEN i = 5 THEN 'DRAFT'::"CampaignStatus"
        ELSE 'COMPLETED'::"CampaignStatus"
      END,
      v_company_id,
      NOW() - INTERVAL '40 days' + (i * INTERVAL '7 days'),
      NOW() + INTERVAL '30 days',
      NOW() - INTERVAL '40 days' + (i * INTERVAL '7 days')
    );
    
    -- No recommendations table in current schema
  END LOOP;
  
  RAISE NOTICE 'Sample data population complete!';
END $$;