-- Add authentication fields to Admin table
ALTER TABLE "Admin" 
ADD COLUMN IF NOT EXISTS "password" TEXT,
ADD COLUMN IF NOT EXISTS "lastLogin" TIMESTAMP(3);