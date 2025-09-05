# Local PostgreSQL Database Setup Plan

## Overview
Migrate from using remote Neon database for local development to a local PostgreSQL instance to improve development speed and reduce dependency on external services.

## Current State
- Currently using Neon cloud database for both development and production
- Development database: `ep-flat-butterfly-adx1ubzt`
- This causes slower queries and requires internet connection for development

## Benefits
- Faster query execution (no network latency)
- Offline development capability
- Safe environment for testing destructive operations
- No risk of affecting shared development database

## Implementation Steps

### Phase 1: Install and Configure PostgreSQL
1. **Install PostgreSQL locally**
   ```bash
   # macOS (using Homebrew)
   brew install postgresql@15
   brew services start postgresql@15
   
   # Or use Postgres.app for GUI management
   # Download from: https://postgresapp.com/
   ```

2. **Create local database**
   ```bash
   createdb purpose_coach_dev
   ```

3. **Create local database user**
   ```bash
   psql -d purpose_coach_dev
   CREATE USER dev_user WITH PASSWORD 'local_dev_password';
   GRANT ALL PRIVILEGES ON DATABASE purpose_coach_dev TO dev_user;
   ```

### Phase 2: Update Environment Configuration
1. **Create `.env.local.example` file**
   ```env
   # Local Development Database
   DATABASE_URL="postgresql://dev_user:local_dev_password@localhost:5432/purpose_coach_dev"
   DIRECT_URL="postgresql://dev_user:local_dev_password@localhost:5432/purpose_coach_dev"
   ```

2. **Update `.env.local`**
   - Copy current non-database variables
   - Use local DATABASE_URL for development
   - Keep production URLs commented for reference

3. **Create environment switching script**
   ```bash
   # scripts/switch-env.sh
   #!/bin/bash
   if [ "$1" = "local" ]; then
     cp .env.local.local .env.local
     echo "Switched to local database"
   elif [ "$1" = "cloud" ]; then
     cp .env.local.cloud .env.local
     echo "Switched to cloud database"
   fi
   ```

### Phase 3: Migrate Schema and Seed Data
1. **Export current schema from Neon**
   ```bash
   npx prisma db pull
   npx prisma migrate dev --name initial_schema --create-only
   ```

2. **Apply schema to local database**
   ```bash
   DATABASE_URL="postgresql://dev_user:local_dev_password@localhost:5432/purpose_coach_dev" \
   npx prisma migrate deploy
   ```

3. **Create seed script for test data**
   ```typescript
   // prisma/seed.ts
   import prisma from '../src/lib/prisma'
   
   async function main() {
     // Create test company
     const company = await prisma.company.create({
       data: {
         name: 'Test Company',
         clerkOrgId: 'org_test_local_dev'
       }
     })
     
     // Add more seed data as needed
   }
   
   main()
     .catch(console.error)
     .finally(() => prisma.$disconnect())
   ```

4. **Add seed command to package.json**
   ```json
   "scripts": {
     "db:seed": "tsx prisma/seed.ts",
     "db:reset": "npx prisma migrate reset --force"
   }
   ```

### Phase 4: Update Development Workflow
1. **Create database management scripts**
   ```json
   // package.json
   "scripts": {
     "db:local:start": "pg_ctl -D /usr/local/var/postgresql@15 start",
     "db:local:stop": "pg_ctl -D /usr/local/var/postgresql@15 stop",
     "db:local:reset": "dropdb purpose_coach_dev && createdb purpose_coach_dev && npx prisma migrate deploy && npm run db:seed",
     "dev:local": "npm run db:local:start && npm run dev"
   }
   ```

2. **Update CLAUDE.md documentation**
   - Add local database setup instructions
   - Document environment switching process
   - Add troubleshooting guide

### Phase 5: Testing and Validation
1. **Test all database operations**
   - User creation/authentication
   - Company operations
   - Invitation system
   - All CRUD operations

2. **Verify Clerk integration works with local DB**
   - Test organization sync
   - Verify ID mappings still work

3. **Performance comparison**
   - Measure query times local vs cloud
   - Document improvements

## Rollback Plan
If issues arise:
1. Switch back to cloud database: `npm run switch-env cloud`
2. All changes are in environment files, no code changes required
3. Local database can coexist with cloud configuration

## Success Criteria
- [ ] Local PostgreSQL running and accessible
- [ ] All existing features work with local database
- [ ] Development server starts without internet connection
- [ ] Seed data provides realistic test environment
- [ ] Documentation updated for team onboarding

## Estimated Time
- Setup: 2-3 hours
- Testing: 1-2 hours
- Documentation: 1 hour
- Total: 4-6 hours

## Dependencies
- Must complete before implementing migration files (Plan #2)
- Will make pre-commit hooks (Plan #3) faster to run

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| PostgreSQL version mismatch with Neon | Schema incompatibilities | Use same major version (15.x) |
| Forgetting to switch environments | Accidentally using wrong DB | Create clear visual indicators in app |
| Local DB gets out of sync | Development issues | Regular reset scripts |