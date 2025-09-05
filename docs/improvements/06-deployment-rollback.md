# Deployment Rollback Runbook

## Overview
Comprehensive procedures for rolling back bad deployments to known good states, covering code, database, and configuration rollbacks.

## Current State
- Manual rollback through Vercel dashboard
- No documented rollback procedures
- Risk of incomplete rollbacks (code vs database mismatch)
- No automated rollback triggers

## Benefits
- Rapid recovery from bad deployments
- Minimized downtime
- Consistent rollback procedures
- Reduced panic during incidents
- Clear responsibility matrix

## Rollback Scenarios and Procedures

### Scenario 1: Application Code Rollback (No DB Changes)

#### Immediate Rollback (< 5 minutes after deploy)
```bash
#!/bin/bash
# RUNBOOK: Quick rollback for code-only changes

# 1. Identify the bad deployment
echo "🔍 Current deployment info:"
vercel list --prod -n 1

# 2. Get previous good deployment
PREVIOUS_DEPLOY=$(vercel list --prod -n 2 | grep Ready | head -1 | awk '{print $1}')
echo "Rolling back to: $PREVIOUS_DEPLOY"

# 3. Instant rollback via Vercel
vercel rollback $PREVIOUS_DEPLOY --prod

# 4. Verify rollback
curl -s https://tools.getcampfire.com/api/health | jq .

# 5. Notify team
curl -X POST $SLACK_WEBHOOK \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"🔄 Rolled back deployment to $PREVIOUS_DEPLOY\"}"

echo "✅ Rollback completed"
```

#### Git-based Rollback (> 5 minutes after deploy)
```bash
#!/bin/bash
# RUNBOOK: Git revert for code changes

# 1. Identify bad commit
BAD_COMMIT=$(git log --oneline -n 1 --format="%H")
echo "Reverting commit: $BAD_COMMIT"

# 2. Create revert branch
git checkout -b hotfix/rollback-$(date +%Y%m%d-%H%M%S)

# 3. Revert the commit
git revert $BAD_COMMIT --no-edit

# 4. Run quick tests
npm run type-check
npm run test:quick

# 5. Push directly to main (emergency)
git checkout main
git merge hotfix/rollback-* --no-edit
git push origin main

# 6. Vercel auto-deploys from main push

echo "✅ Git rollback completed"
```

### Scenario 2: Database Migration Rollback

#### Safe Migration Rollback (Non-destructive)
```bash
#!/bin/bash
# RUNBOOK: Rollback non-destructive migration

# 1. Check migration status
npx prisma migrate status

# 2. Identify migration to rollback
MIGRATION_TO_ROLLBACK="20240101000000_add_new_field"

# 3. Mark migration as rolled back
npx prisma migrate resolve --rolled-back $MIGRATION_TO_ROLLBACK

# 4. Apply down migration (if exists)
if [ -f "prisma/migrations/$MIGRATION_TO_ROLLBACK/down.sql" ]; then
    psql $DATABASE_URL < "prisma/migrations/$MIGRATION_TO_ROLLBACK/down.sql"
fi

# 5. Revert code that depends on migration
git revert HEAD --no-edit
git push origin main

# 6. Verify schema state
npx prisma db pull
npx prisma validate

echo "✅ Migration rollback completed"
```

#### Destructive Migration Rollback (Data Loss)
```bash
#!/bin/bash
# RUNBOOK: Rollback destructive migration with data recovery

# CRITICAL: This will cause data loss. Use only when necessary.

# 1. Take emergency backup
echo "⚠️  Taking emergency backup..."
pg_dump $DATABASE_URL > emergency_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Use Neon point-in-time recovery
RESTORE_TIME=$(date -d '1 hour ago' '+%Y-%m-%d %H:%M:%S')
echo "Restoring to: $RESTORE_TIME"

# 3. Create recovery branch
neon branches create \
  --name recovery-$(date +%Y%m%d-%H%M%S) \
  --from-time "$RESTORE_TIME"

# 4. Get new connection string
RECOVERY_URL=$(neon connection-string recovery-branch)

# 5. Update application
vercel env rm DATABASE_URL --yes
vercel env add DATABASE_URL="$RECOVERY_URL"

# 6. Revert code changes
git revert HEAD --no-edit
git push origin main

# 7. Once stable, make recovery branch primary
neon branches set-primary recovery-branch

echo "✅ Destructive rollback completed"
```

### Scenario 3: Full Stack Rollback

#### Complete System Rollback
```bash
#!/bin/bash
# RUNBOOK: Full application and database rollback

echo "🚨 FULL SYSTEM ROLLBACK 🚨"

# 1. Put site in maintenance mode
vercel env add MAINTENANCE_MODE=true
vercel redeploy --prod

# 2. Capture current state
echo "📸 Capturing current state..."
mkdir -p rollback_artifacts/$(date +%Y%m%d_%H%M%S)
vercel inspect > rollback_artifacts/current_deployment.json
pg_dump $DATABASE_URL > rollback_artifacts/current_database.sql

# 3. Identify target state
echo "Enter target deployment ID or commit SHA:"
read TARGET_STATE

# 4. Rollback database first (if needed)
read -p "Database rollback needed? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Enter database restore point (YYYY-MM-DD HH:MM:SS):"
    read DB_RESTORE_POINT
    
    # Create restore branch
    neon branches create \
      --name rollback-$(date +%Y%m%d-%H%M%S) \
      --from-time "$DB_RESTORE_POINT"
    
    # Update connection
    NEW_DB_URL=$(neon connection-string rollback-branch)
    vercel env rm DATABASE_URL --yes
    vercel env add DATABASE_URL="$NEW_DB_URL"
fi

# 5. Rollback application
if [[ $TARGET_STATE == *"dpl_"* ]]; then
    # Vercel deployment ID
    vercel rollback $TARGET_STATE --prod
else
    # Git commit SHA
    git checkout $TARGET_STATE
    git push origin main --force-with-lease
fi

# 6. Clear caches
vercel env add CACHE_VERSION=$(date +%s)

# 7. Exit maintenance mode
vercel env rm MAINTENANCE_MODE
vercel redeploy --prod

# 8. Validation
./scripts/post-rollback-validation.sh

echo "✅ Full rollback completed"
```

### Scenario 4: Configuration Rollback

#### Environment Variable Rollback
```bash
#!/bin/bash
# RUNBOOK: Rollback environment configuration

# 1. Export current config (backup)
vercel env pull .env.backup

# 2. List recent environment changes
echo "Recent environment variable changes:"
vercel env ls --prod

# 3. Restore from backup
echo "Select backup to restore:"
ls -la .env.backup.*
read BACKUP_FILE

# 4. Apply backup
while IFS= read -r line; do
    if [[ ! -z "$line" && "$line" != \#* ]]; then
        KEY=$(echo $line | cut -d'=' -f1)
        VALUE=$(echo $line | cut -d'=' -f2-)
        vercel env rm "$KEY" --yes
        vercel env add "$KEY"="$VALUE"
    fi
done < "$BACKUP_FILE"

# 5. Trigger redeploy
vercel redeploy --prod

echo "✅ Configuration rollback completed"
```

## Automated Rollback Triggers

### Health Check Based Rollback
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    database: false,
    auth: false,
    api: false
  }
  
  try {
    // Database check
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
    
    // Auth check
    const clerkClient = await clerkClient()
    await clerkClient.users.getCount()
    checks.auth = true
    
    // API check
    checks.api = true
    
    const healthy = Object.values(checks).every(v => v === true)
    
    if (!healthy) {
      // Trigger rollback
      await fetch('https://api.vercel.com/rollback', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`
        },
        body: JSON.stringify({
          deploymentId: process.env.VERCEL_DEPLOYMENT_ID,
          reason: `Health check failed: ${JSON.stringify(checks)}`
        })
      })
    }
    
    return NextResponse.json({ 
      status: healthy ? 'healthy' : 'unhealthy',
      checks,
      timestamp: new Date().toISOString()
    }, { 
      status: healthy ? 200 : 503 
    })
    
  } catch (error) {
    return NextResponse.json({ 
      status: 'error',
      checks,
      error: error.message 
    }, { 
      status: 503 
    })
  }
}
```

### Error Rate Based Rollback
```javascript
// monitoring/rollback-monitor.js
const ERROR_THRESHOLD = 50 // errors per minute
const ROLLBACK_DELAY = 300000 // 5 minutes

let errorCount = 0
let deploymentTime = Date.now()

async function monitorAndRollback() {
  // Count errors
  const logs = await fetchVercelLogs({ 
    since: Date.now() - 60000,
    filter: 'error' 
  })
  
  errorCount = logs.length
  
  // Check if we should rollback
  const timeSinceDeploy = Date.now() - deploymentTime
  
  if (errorCount > ERROR_THRESHOLD && timeSinceDeploy < ROLLBACK_DELAY) {
    console.log(`🚨 High error rate detected: ${errorCount} errors/min`)
    console.log('🔄 Initiating automatic rollback...')
    
    await executeRollback()
  }
}

setInterval(monitorAndRollback, 60000) // Check every minute
```

## Rollback Decision Matrix

```markdown
| Symptom | Severity | Rollback Type | Timeframe |
|---------|----------|---------------|-----------|
| 500 errors > 10% | Critical | Immediate code rollback | < 2 min |
| Database connection fails | Critical | Full rollback | < 5 min |
| Auth not working | Critical | Code + Config rollback | < 5 min |
| Performance degradation > 50% | High | Code rollback | < 10 min |
| Missing features | Medium | Git revert | < 30 min |
| Visual bugs only | Low | Next deploy | Next cycle |
```

## Post-Rollback Checklist

```markdown
### Immediate Actions (0-5 minutes)
- [ ] Rollback executed
- [ ] Site accessible
- [ ] Critical functions working
- [ ] Team notified via Slack

### Validation (5-15 minutes)
- [ ] Run automated tests
- [ ] Check error rates
- [ ] Verify database integrity
- [ ] Test user authentication
- [ ] Check critical user journeys

### Communication (15-30 minutes)
- [ ] Update status page
- [ ] Notify affected users (if needed)
- [ ] Document incident timeline
- [ ] Schedule post-mortem

### Recovery (30+ minutes)
- [ ] Identify root cause
- [ ] Create fix
- [ ] Test thoroughly
- [ ] Plan re-deployment
```

## Training and Practice

### Monthly Rollback Drill
```bash
#!/bin/bash
# scripts/rollback-drill.sh

echo "🎯 Starting monthly rollback drill..."

# 1. Deploy known bad code to staging
git checkout rollback-test-branch
vercel --env=preview

# 2. Wait for deployment
sleep 30

# 3. Execute rollback
./scripts/rollback-staging.sh

# 4. Validate rollback
curl https://staging.getcampfire.com/api/health

# 5. Generate report
echo "Rollback drill completed in: $SECONDS seconds"
```

## Success Criteria
- [ ] Rollback completed < 5 minutes
- [ ] All procedures documented
- [ ] Team trained on procedures
- [ ] Automated triggers configured
- [ ] Monthly drills conducted

## Estimated Time
- Documentation: 3-4 hours
- Automation setup: 4-5 hours
- Testing: 3-4 hours
- Team training: 2 hours
- Total: 12-15 hours

## Dependencies
- Benefits from all other improvements
- Critical for production operations

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Incomplete rollback | Inconsistent state | Comprehensive checklist |
| Rollback fails | Extended downtime | Multiple rollback methods |
| Data loss during rollback | Business impact | Backup before rollback |
| Cascade failures | Multiple systems affected | Staged rollback approach |