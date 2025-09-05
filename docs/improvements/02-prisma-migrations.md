# Prisma Migration Files Implementation Plan

## Overview
Transition from using `prisma db push` to proper migration files for version-controlled, reversible database schema changes.

## Current State
- Using `prisma db push` directly against databases
- No migration history or version control for schema changes
- Cannot rollback schema changes
- Risk of data loss with `--accept-data-loss` flag
- Schema changes not automatically applied during deployment

## Benefits
- Version-controlled database schema evolution
- Ability to rollback migrations
- Clear history of all schema changes
- Safer deployment process
- Team collaboration on schema changes

## Implementation Steps

### Phase 1: Baseline Migration Creation
1. **Ensure local database is set up** (from Plan #1)

2. **Pull current production schema**
   ```bash
   # Temporarily use production URL
   DATABASE_URL="postgresql://neondb_owner:...@ep-dawn-river..." \
   npx prisma db pull
   ```

3. **Create initial migration from current schema**
   ```bash
   # This creates migration without applying it
   npx prisma migrate dev --name initial_baseline --create-only
   
   # Mark migration as already applied in production
   npx prisma migrate resolve --applied "20240101000000_initial_baseline"
   ```

4. **Commit baseline migration**
   ```bash
   git add prisma/migrations
   git commit -m "Add baseline migration from current production schema"
   ```

### Phase 2: Update Development Workflow
1. **Replace db push commands with migrate**
   ```bash
   # OLD approach (remove these)
   npx prisma db push
   npx prisma db push --accept-data-loss
   
   # NEW approach
   npx prisma migrate dev --name describe_your_change
   ```

2. **Update package.json scripts**
   ```json
   {
     "scripts": {
       "db:migrate": "prisma migrate dev",
       "db:migrate:create": "prisma migrate dev --create-only",
       "db:migrate:deploy": "prisma migrate deploy",
       "db:migrate:status": "prisma migrate status",
       "db:migrate:reset": "prisma migrate reset"
     }
   }
   ```

3. **Create migration guidelines**
   ```markdown
   # Migration Naming Convention
   - Use snake_case: add_user_role_field
   - Be descriptive: add_company_domains_table
   - Include ticket number if applicable: fix_123_user_profile_constraint
   ```

### Phase 3: Migration Development Process
1. **Create pre-migration checklist**
   ```markdown
   ## Before Creating a Migration
   - [ ] Pull latest changes from main
   - [ ] Run npx prisma migrate status
   - [ ] Test changes locally first
   - [ ] Consider data migration needs
   - [ ] Plan for rollback scenario
   ```

2. **Implement migration review process**
   ```yaml
   # .github/pull_request_template.md
   ## Database Changes
   - [ ] Migration file included
   - [ ] Migration tested locally
   - [ ] Rollback tested
   - [ ] Data migration script if needed
   - [ ] No breaking changes without coordination
   ```

3. **Create data migration examples**
   ```typescript
   // prisma/migrations/20240101000000_add_team_fields/data-migration.ts
   import { PrismaClient } from '@prisma/client'
   
   const prisma = new PrismaClient()
   
   async function main() {
     // Example: Populate new field with default values
     await prisma.userProfile.updateMany({
       where: { teamName: null },
       data: { teamName: 'Default Team' }
     })
   }
   
   main()
     .catch(console.error)
     .finally(() => prisma.$disconnect())
   ```

### Phase 4: Handle Existing Databases
1. **Mark existing deployments as baselined**
   ```bash
   # For production
   DATABASE_URL="$PRODUCTION_URL" \
   npx prisma migrate resolve --applied "20240101000000_initial_baseline"
   
   # For development/preview environments
   DATABASE_URL="$DEV_URL" \
   npx prisma migrate resolve --applied "20240101000000_initial_baseline"
   ```

2. **Document current schema state**
   - Export current schema as SQL
   - Store in `prisma/baseline.sql`
   - Reference in migration documentation

### Phase 5: Migration Safety Measures
1. **Create migration validation script**
   ```typescript
   // scripts/validate-migration.ts
   import { exec } from 'child_process'
   import { promisify } from 'util'
   
   const execAsync = promisify(exec)
   
   async function validateMigration() {
     // Check for destructive changes
     const { stdout } = await execAsync('npx prisma migrate diff')
     
     if (stdout.includes('DROP') || stdout.includes('DELETE')) {
       console.error('⚠️  Destructive migration detected!')
       process.exit(1)
     }
   }
   ```

2. **Add migration dry-run process**
   ```bash
   # Test migration without applying
   npx prisma migrate dev --create-only
   npx prisma migrate status
   ```

3. **Create rollback procedures**
   ```sql
   -- Store rollback SQL with each migration
   -- prisma/migrations/20240101000000_add_field/rollback.sql
   ALTER TABLE "UserProfile" DROP COLUMN "newField";
   ```

### Phase 6: Team Training
1. **Create migration documentation**
   - Common patterns and examples
   - Troubleshooting guide
   - Best practices

2. **Migration workflow guide**
   ```markdown
   ## Daily Workflow
   1. Pull latest changes
   2. Run migrations: npm run db:migrate:deploy
   3. Make schema changes in schema.prisma
   4. Create migration: npm run db:migrate
   5. Test thoroughly
   6. Commit migration files
   ```

## Rollback Plan
1. Keep `prisma db push` available for emergency fixes
2. All migrations have rollback scripts
3. Database backups before major migrations

## Success Criteria
- [ ] Baseline migration created and applied
- [ ] All team members trained on migration workflow
- [ ] No more `db push` in production
- [ ] Migration history tracked in git
- [ ] Rollback procedure tested

## Estimated Time
- Baseline creation: 2-3 hours
- Workflow updates: 2 hours
- Testing and validation: 3-4 hours
- Team training: 2 hours
- Total: 9-11 hours

## Dependencies
- Requires local database (Plan #1) for safe testing
- Blocks automated deployment migrations (Plan #4)

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration conflicts in team | Deployment blocks | Clear communication, frequent merges |
| Irreversible migration | Data loss | Always create rollback scripts |
| Production migration failure | Downtime | Test in staging first |
| Lost migration history | Sync issues | Document baseline state |

## Migration Checklist Template
```markdown
### Pre-Migration
- [ ] Schema changes reviewed
- [ ] Migration tested locally
- [ ] Rollback script prepared
- [ ] Data backup confirmed
- [ ] Team notified

### Post-Migration
- [ ] Migration successful
- [ ] Application tested
- [ ] No errors in logs
- [ ] Performance verified
- [ ] Document any issues
```