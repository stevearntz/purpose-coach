# Database Schema Cleanup: Remove NextAuth Remnants

## Overview
This migration removes NextAuth-related models and fields from the database schema, specifically:
- The entire `Admin` model
- The `admins` relation from the `Company` model
- The `adminId` foreign key from the `Invitation` model

## Changes Made

### 1. Removed Models
- **Admin model** - Completely removed from schema

### 2. Modified Models

#### Company Model
- **Removed**: `admins Admin[]` relation
- **Preserved**: All other fields and relations (campaigns, invitations)

#### Invitation Model
- **Removed**: `adminId String?` field
- **Removed**: `admin Admin?` relation
- **Preserved**: All other fields and relations

## Migration SQL

The following SQL will be generated when running `npx prisma migrate dev`:

```sql
-- DropForeignKey
ALTER TABLE "public"."Admin" DROP CONSTRAINT "Admin_companyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_adminId_fkey";

-- AlterTable
ALTER TABLE "public"."Invitation" DROP COLUMN "adminId";

-- DropTable
DROP TABLE "public"."Admin";
```

## Data Impact Analysis

### Data That Will Be Lost
1. **All Admin records** - The entire `Admin` table will be dropped, including:
   - Admin IDs
   - Email addresses
   - Names
   - Company associations
   - Active status
   - Creation/update timestamps
   - Passwords
   - Last login timestamps

2. **Admin-Invitation relationships** - The `adminId` references from `Invitation` records will be lost

### Data That Will Be Preserved
- All `Company` records remain intact
- All `Invitation` records remain intact (except `adminId` field)
- All `AssessmentResult` records remain intact
- All `Campaign` records remain intact
- All `InvitationMetadata` records remain intact

## Pre-Migration Data Backup Commands

Before running the migration, backup the affected data:

```bash
# Backup Admin table
echo 'SELECT * FROM "Admin";' | npx prisma db execute --stdin --schema prisma/schema-backup.prisma > admin_backup.json

# Backup Invitations with adminId references
echo 'SELECT id, email, adminId FROM "Invitation" WHERE "adminId" IS NOT NULL;' | npx prisma db execute --stdin --schema prisma/schema-backup.prisma > invitation_admin_refs_backup.json
```

## Migration Commands

1. **Create and run migration:**
   ```bash
   npx prisma migrate dev --name "remove-nextauth-remnants"
   ```

2. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

## Rollback Plan

If you need to rollback this migration:

1. **Restore the original schema:**
   ```bash
   cp prisma/schema-backup.prisma prisma/schema.prisma
   ```

2. **Create rollback migration:**
   ```bash
   npx prisma migrate dev --name "rollback-remove-nextauth-remnants"
   ```

3. **Restore data from backups** (if backups were created)

## Files Created/Modified

- `/Users/stevearntz/Projects/purpose-coach/prisma/schema.prisma` - Updated schema
- `/Users/stevearntz/Projects/purpose-coach/prisma/schema-backup.prisma` - Backup of original schema
- `/Users/stevearntz/Projects/purpose-coach/MIGRATION_PLAN.md` - This documentation

## Post-Migration Tasks

1. **Update application code** to remove any references to:
   - `Admin` model
   - `adminId` fields in Invitation handling
   - Admin-related relations in Company operations

2. **Test critical paths** to ensure the application still functions correctly

3. **Clean up unused imports** related to Admin model in TypeScript files