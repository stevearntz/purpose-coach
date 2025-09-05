# Automated Database Migrations in Vercel Deployment

## Overview
Implement automatic database migration execution during Vercel deployment to ensure schema changes are applied consistently and automatically.

## Current State
- Manual migration execution after deployment
- Risk of forgetting to run migrations
- Potential downtime between code deployment and migration
- No automatic rollback for failed migrations
- Schema drift between code and database

## Benefits
- Zero-downtime deployments
- Automatic schema synchronization
- Reduced deployment errors
- Consistent deployment process
- Automatic rollback on failure

## Implementation Steps

### Phase 1: Create Migration Strategy
1. **Determine migration timing**
   ```mermaid
   Option A: Build Phase
   - Pros: Fails deployment if migration fails
   - Cons: Longer build times
   
   Option B: Post-Deploy Hook
   - Pros: Faster deployments
   - Cons: Brief inconsistency possible
   
   Recommended: Build Phase for safety
   ```

2. **Create migration script**
   ```typescript
   // scripts/migrate-deploy.ts
   import { exec } from 'child_process'
   import { promisify } from 'util'
   
   const execAsync = promisify(exec)
   
   async function runMigrations() {
     console.log('🚀 Starting database migrations...')
     
     try {
       // Check pending migrations
       const { stdout: status } = await execAsync('npx prisma migrate status')
       console.log('Migration status:', status)
       
       if (status.includes('Database schema is up to date')) {
         console.log('✅ No migrations needed')
         return
       }
       
       // Run migrations
       console.log('📦 Applying migrations...')
       const { stdout } = await execAsync('npx prisma migrate deploy')
       console.log(stdout)
       console.log('✅ Migrations completed successfully')
       
     } catch (error) {
       console.error('❌ Migration failed:', error)
       process.exit(1)
     }
   }
   
   runMigrations()
   ```

### Phase 2: Update Build Configuration
1. **Modify `package.json` for Vercel**
   ```json
   {
     "scripts": {
       "build": "npm run migrate:deploy && next build",
       "migrate:deploy": "prisma migrate deploy",
       "migrate:status": "prisma migrate status",
       "vercel-build": "npm run migrate:production && npm run build",
       "migrate:production": "node scripts/migrate-with-retry.js"
     }
   }
   ```

2. **Create retry mechanism for migrations**
   ```javascript
   // scripts/migrate-with-retry.js
   const { execSync } = require('child_process')
   
   const MAX_RETRIES = 3
   const RETRY_DELAY = 5000 // 5 seconds
   
   async function sleep(ms) {
     return new Promise(resolve => setTimeout(resolve, ms))
   }
   
   async function runMigrationWithRetry(attempt = 1) {
     try {
       console.log(`Migration attempt ${attempt}/${MAX_RETRIES}`)
       execSync('npx prisma migrate deploy', { stdio: 'inherit' })
       console.log('✅ Migration successful')
       return true
     } catch (error) {
       if (attempt < MAX_RETRIES) {
         console.log(`⚠️  Migration failed, retrying in ${RETRY_DELAY/1000}s...`)
         await sleep(RETRY_DELAY)
         return runMigrationWithRetry(attempt + 1)
       }
       console.error('❌ Migration failed after all retries')
       throw error
     }
   }
   
   runMigrationWithRetry()
     .catch(() => process.exit(1))
   ```

### Phase 3: Environment-Specific Migrations
1. **Configure for different environments**
   ```typescript
   // scripts/migrate-by-environment.ts
   import { execSync } from 'child_process'
   
   const environment = process.env.VERCEL_ENV || 'development'
   
   async function migrateByEnvironment() {
     console.log(`Running migrations for: ${environment}`)
     
     switch(environment) {
       case 'production':
         // Run migrations with production checks
         execSync('npx prisma migrate deploy', { stdio: 'inherit' })
         break
         
       case 'preview':
         // Run migrations but allow destructive changes
         execSync('npx prisma migrate deploy', { stdio: 'inherit' })
         break
         
       case 'development':
         // Skip migrations in dev deployments
         console.log('Skipping migrations in development')
         break
     }
   }
   
   migrateByEnvironment()
   ```

2. **Add environment detection**
   ```javascript
   // Detect Vercel environment
   const isVercel = process.env.VERCEL === '1'
   const isProduction = process.env.VERCEL_ENV === 'production'
   const isPreview = process.env.VERCEL_ENV === 'preview'
   ```

### Phase 4: Migration Safety Checks
1. **Create pre-migration validation**
   ```typescript
   // scripts/validate-migration-safety.ts
   import prisma from '@/lib/prisma'
   
   async function validateMigrationSafety() {
     // Check for active connections
     const activeConnections = await prisma.$queryRaw`
       SELECT count(*) FROM pg_stat_activity 
       WHERE state = 'active' AND pid <> pg_backend_pid()
     `
     
     if (activeConnections[0].count > 10) {
       console.warn('⚠️  High database activity detected')
       // Implement wait or abort logic
     }
     
     // Check for long-running transactions
     const longTransactions = await prisma.$queryRaw`
       SELECT * FROM pg_stat_activity 
       WHERE state = 'active' 
       AND now() - pg_stat_activity.query_start > interval '5 minutes'
     `
     
     if (longTransactions.length > 0) {
       console.error('❌ Long-running transactions detected')
       process.exit(1)
     }
   }
   ```

2. **Add migration health checks**
   ```typescript
   // scripts/post-migration-health.ts
   async function checkMigrationHealth() {
     try {
       // Test basic connectivity
       await prisma.$queryRaw`SELECT 1`
       
       // Verify critical tables exist
       const tables = ['Company', 'UserProfile', 'Invitation']
       for (const table of tables) {
         await prisma.$queryRaw`SELECT COUNT(*) FROM "${table}"`
       }
       
       console.log('✅ Post-migration health check passed')
     } catch (error) {
       console.error('❌ Post-migration health check failed:', error)
       // Trigger rollback or alert
       process.exit(1)
     }
   }
   ```

### Phase 5: Rollback Mechanism
1. **Create rollback script**
   ```bash
   #!/bin/bash
   # scripts/rollback-migration.sh
   
   echo "🔄 Starting migration rollback..."
   
   # Get the last successful migration
   LAST_MIGRATION=$(npx prisma migrate status --json | jq -r '.appliedMigrations[-1]')
   
   # Rollback to previous migration
   npx prisma migrate resolve --rolled-back "$LAST_MIGRATION"
   
   # Revert code deployment
   vercel rollback --yes
   ```

2. **Implement automatic rollback**
   ```javascript
   // scripts/auto-rollback.js
   const { execSync } = require('child_process')
   
   async function deployWithRollback() {
     const deploymentId = process.env.VERCEL_DEPLOYMENT_ID
     
     try {
       // Run migrations
       execSync('npm run migrate:deploy', { stdio: 'inherit' })
       
       // Health check
       execSync('npm run health:check', { stdio: 'inherit' })
       
     } catch (error) {
       console.error('Deployment failed, rolling back...')
       
       // Rollback database
       execSync('npm run migrate:rollback', { stdio: 'inherit' })
       
       // Rollback deployment
       execSync(`vercel rollback ${deploymentId}`, { stdio: 'inherit' })
       
       process.exit(1)
     }
   }
   ```

### Phase 6: Monitoring and Alerts
1. **Add migration monitoring**
   ```typescript
   // scripts/monitor-migration.ts
   import { WebClient } from '@slack/web-api'
   
   const slack = new WebClient(process.env.SLACK_TOKEN)
   
   async function notifyMigrationStatus(status: 'started' | 'success' | 'failed', details?: string) {
     await slack.chat.postMessage({
       channel: '#deployments',
       text: `Migration ${status}: ${details || ''}`,
       attachments: [{
         color: status === 'success' ? 'good' : status === 'failed' ? 'danger' : 'warning',
         fields: [
           { title: 'Environment', value: process.env.VERCEL_ENV },
           { title: 'Deployment', value: process.env.VERCEL_URL },
           { title: 'Time', value: new Date().toISOString() }
         ]
       }]
     })
   }
   ```

### Phase 7: Vercel Configuration
1. **Update `vercel.json`**
   ```json
   {
     "buildCommand": "npm run vercel-build",
     "framework": "nextjs",
     "env": {
       "DATABASE_URL": "@database_url_production"
     },
     "functions": {
       "src/app/api/migrate/route.ts": {
         "maxDuration": 60
       }
     }
   }
   ```

2. **Create migration status endpoint**
   ```typescript
   // src/app/api/migrate/status/route.ts
   export async function GET() {
     const status = await prisma.$queryRaw`
       SELECT * FROM _prisma_migrations 
       ORDER BY finished_at DESC 
       LIMIT 5
     `
     
     return NextResponse.json({ status })
   }
   ```

## Rollback Plan
1. Remove build-time migrations
2. Return to manual migration process
3. Keep migration scripts for manual use

## Success Criteria
- [ ] Zero failed deployments due to migrations
- [ ] All migrations run automatically
- [ ] Rollback tested and working
- [ ] No manual intervention needed
- [ ] Migration time < 30 seconds

## Estimated Time
- Implementation: 4-5 hours
- Testing: 3-4 hours
- Rollback testing: 2 hours
- Documentation: 1 hour
- Total: 10-12 hours

## Dependencies
- Requires migration files setup (Plan #2)
- Benefits from pre-commit hooks (Plan #3) to prevent bad migrations

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Migration failure blocks deployment | No updates possible | Rollback mechanism, manual override |
| Long migration time | Slow deployments | Optimize migrations, run async |
| Data corruption | Service disruption | Backup before migration, test in preview |
| Connection pool exhaustion | Database unavailable | Connection limits, retry logic |