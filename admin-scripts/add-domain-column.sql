-- Migration script to add domain column to Company table in production
-- Run this when ready to align production schema with Prisma schema

-- Check if column already exists before adding
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "domain" TEXT;

-- Optional: Set default values for existing companies based on their admin emails
-- UPDATE "Company" c
-- SET domain = SUBSTRING(a.email FROM '@(.*)$')
-- FROM "Admin" a
-- WHERE a."companyId" = c.id
-- AND c.domain IS NULL
-- AND a.email LIKE '%@%';

-- Verify the column was added
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'Company' AND column_name = 'domain';