# Database Backup and Restore Runbook

## Overview
Establish comprehensive database backup strategy with Neon and create detailed procedures for restoring databases in case of data loss or corruption.

## Current State
- Using Neon's default backup settings (unknown configuration)
- No documented restore procedures
- No regular backup validation
- No tested disaster recovery plan

## Benefits
- Rapid recovery from data loss
- Protection against bad migrations
- Compliance with data retention requirements
- Confidence in making schema changes
- Clear disaster recovery procedures

## Part 1: Neon Backup Configuration

### Phase 1: Verify Current Backup Settings
1. **Check Neon Console**
   ```bash
   # Login to Neon Console
   # Navigate to: Project → Settings → Backup & Restore
   
   # Document current settings:
   - Backup frequency: [daily/hourly]
   - Retention period: [7/14/30 days]
   - Point-in-time recovery: [enabled/disabled]
   - Backup location: [region]
   ```

2. **Configure optimal backup settings**
   ```yaml
   Recommended Configuration:
   - Continuous replication: Enabled
   - Point-in-time recovery: Last 7 days
   - Daily snapshots: 30 days retention
   - Weekly snapshots: 90 days retention
   - Monthly snapshots: 1 year retention
   ```

3. **Enable backup notifications**
   ```javascript
   // Neon API configuration
   const neonConfig = {
     notifications: {
       backup_completed: 'email@getcampfire.com',
       backup_failed: 'alerts@getcampfire.com',
       restore_completed: 'email@getcampfire.com'
     }
   }
   ```

### Phase 2: Implement Additional Backup Strategy
1. **Create automated backup script**
   ```bash
   #!/bin/bash
   # scripts/backup-database.sh
   
   TIMESTAMP=$(date +%Y%m%d_%H%M%S)
   BACKUP_DIR="./backups"
   DATABASE_URL="${DATABASE_URL:-$PRODUCTION_DATABASE_URL}"
   
   # Create backup directory
   mkdir -p $BACKUP_DIR
   
   # Perform backup using pg_dump
   echo "🔵 Starting backup at $TIMESTAMP"
   pg_dump "$DATABASE_URL" \
     --format=custom \
     --no-owner \
     --no-privileges \
     --verbose \
     --file="$BACKUP_DIR/backup_$TIMESTAMP.dump"
   
   # Compress backup
   gzip "$BACKUP_DIR/backup_$TIMESTAMP.dump"
   
   # Upload to S3/Cloud Storage
   aws s3 cp "$BACKUP_DIR/backup_$TIMESTAMP.dump.gz" \
     "s3://campfire-backups/database/$TIMESTAMP/"
   
   # Clean up old local backups (keep last 7 days)
   find $BACKUP_DIR -name "*.dump.gz" -mtime +7 -delete
   
   echo "✅ Backup completed: backup_$TIMESTAMP.dump.gz"
   ```

2. **Schedule regular backups**
   ```yaml
   # .github/workflows/backup.yml
   name: Database Backup
   
   on:
     schedule:
       - cron: '0 2 * * *'  # Daily at 2 AM UTC
     workflow_dispatch:      # Manual trigger
   
   jobs:
     backup:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Install PostgreSQL client
           run: sudo apt-get install postgresql-client
         
         - name: Run backup
           env:
             DATABASE_URL: ${{ secrets.PRODUCTION_DATABASE_URL }}
             AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
             AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
           run: |
             chmod +x scripts/backup-database.sh
             ./scripts/backup-database.sh
         
         - name: Notify success
           if: success()
           run: |
             curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
               -H 'Content-Type: application/json' \
               -d '{"text":"✅ Database backup completed successfully"}'
   ```

## Part 2: Database Restore Runbook

### Emergency Restore Procedure

#### Scenario 1: Bad Migration Recovery
```bash
#!/bin/bash
# RUNBOOK: Restore from bad migration

# 1. STOP all application instances
echo "🛑 Step 1: Stop application"
vercel --prod --scale 0

# 2. Identify the point before bad migration
RESTORE_POINT="2024-12-20 10:00:00"  # Before migration time

# 3. Create new branch from restore point (Neon feature)
neon branches create \
  --name "restore-$(date +%Y%m%d-%H%M%S)" \
  --from-time "$RESTORE_POINT"

# 4. Get new branch connection string
NEW_CONNECTION=$(neon connection-string restore-branch)

# 5. Update environment variables
vercel env pull
sed -i "s|DATABASE_URL=.*|DATABASE_URL=$NEW_CONNECTION|" .env
vercel env push

# 6. Revert code to before migration
git revert HEAD --no-edit  # Or checkout specific commit

# 7. Deploy reverted code
git push origin main
vercel --prod --scale 1

# 8. Verify application
curl https://tools.getcampfire.com/api/health

# 9. Once verified, make restore branch primary
neon branches set-primary restore-branch

echo "✅ Restore completed"
```

#### Scenario 2: Data Corruption Recovery
```bash
#!/bin/bash
# RUNBOOK: Restore from data corruption

# 1. Assess damage
echo "🔍 Assessing data corruption..."
psql $DATABASE_URL << EOF
-- Check affected tables
SELECT schemaname, tablename, n_dead_tup 
FROM pg_stat_user_tables 
WHERE n_dead_tup > 1000;

-- Check data integrity
SELECT COUNT(*) FROM "Company" WHERE "createdAt" > NOW();
EOF

# 2. Determine restore strategy
read -p "Full restore (f) or Partial restore (p)? " -n 1 -r RESTORE_TYPE

if [[ $RESTORE_TYPE == "f" ]]; then
    # FULL RESTORE
    echo "Performing full restore..."
    
    # Create new database from backup
    neon databases create --name campfire-restore
    
    # Restore from latest backup
    neon restore \
      --backup-id latest \
      --database campfire-restore
    
    # Switch application to restored database
    vercel env rm DATABASE_URL
    vercel env add DATABASE_URL=$NEW_DATABASE_URL
    
else
    # PARTIAL RESTORE
    echo "Performing partial restore..."
    
    # Create temporary restore point
    neon branches create --name temp-restore
    
    # Restore specific tables
    pg_dump $BACKUP_URL \
      --table=Company \
      --table=UserProfile | \
    psql $DATABASE_URL
fi

echo "✅ Restore completed"
```

#### Scenario 3: Point-in-Time Recovery
```bash
#!/bin/bash
# RUNBOOK: Point-in-time recovery

# 1. Identify exact time to restore to
echo "Enter restore timestamp (YYYY-MM-DD HH:MM:SS):"
read RESTORE_TIME

# 2. Validate timestamp is within retention
RETENTION_START=$(date -d "7 days ago" +"%Y-%m-%d")
if [[ "$RESTORE_TIME" < "$RETENTION_START" ]]; then
    echo "❌ Timestamp outside retention period"
    exit 1
fi

# 3. Create branch from timestamp
BRANCH_NAME="pitr-$(date +%Y%m%d-%H%M%S)"
neon branches create \
  --name "$BRANCH_NAME" \
  --from-time "$RESTORE_TIME"

# 4. Test restored data
echo "Testing restored data..."
psql $(neon connection-string $BRANCH_NAME) << EOF
-- Verify critical data
SELECT COUNT(*) as companies FROM "Company";
SELECT COUNT(*) as users FROM "UserProfile";
SELECT MAX("createdAt") as latest_record FROM "Invitation";
EOF

# 5. If tests pass, promote branch
read -p "Promote this branch to production? (y/n) " -n 1 -r
if [[ $REPLY =~ ^[Yy]$ ]]; then
    neon branches set-primary "$BRANCH_NAME"
    
    # Update Vercel
    NEW_URL=$(neon connection-string $BRANCH_NAME)
    vercel env rm DATABASE_URL
    vercel env add DATABASE_URL="$NEW_URL"
    
    # Trigger redeploy
    vercel --prod
fi

echo "✅ Point-in-time recovery completed"
```

### Recovery Validation Checklist
```markdown
## Post-Restore Validation

### Data Integrity
- [ ] Row counts match expected values
- [ ] No orphaned foreign keys
- [ ] Timestamps are within expected range
- [ ] Critical data relationships intact

### Application Functionality
- [ ] Authentication working
- [ ] User profiles loading
- [ ] Organization data correct
- [ ] Invitations functioning
- [ ] No 500 errors in logs

### Performance
- [ ] Query response times normal
- [ ] No connection pool issues
- [ ] CPU/Memory usage stable
- [ ] No slow query warnings

### Business Validation
- [ ] Recent transactions present
- [ ] User sessions maintained
- [ ] No data inconsistencies reported
- [ ] Email notifications working
```

### Backup Testing Schedule
```bash
#!/bin/bash
# scripts/test-restore.sh
# Run monthly to validate backup/restore process

echo "🧪 Starting backup/restore test..."

# 1. Create test database
TEST_DB="campfire-restore-test-$(date +%Y%m%d)"
neon databases create --name "$TEST_DB"

# 2. Restore latest backup
neon restore --backup-id latest --database "$TEST_DB"

# 3. Run validation queries
psql $(neon connection-string "$TEST_DB") << EOF
-- Validation queries
SELECT 
  (SELECT COUNT(*) FROM "Company") as companies,
  (SELECT COUNT(*) FROM "UserProfile") as users,
  (SELECT COUNT(*) FROM "Invitation") as invitations,
  (SELECT MAX("createdAt") FROM "UserProfile") as latest_activity;
EOF

# 4. Clean up test database
neon databases delete --name "$TEST_DB"

echo "✅ Restore test completed successfully"
```

## Success Criteria
- [ ] Backups running automatically
- [ ] Restore tested monthly
- [ ] RTO < 1 hour
- [ ] RPO < 24 hours
- [ ] Team trained on procedures

## Estimated Time
- Setup: 3-4 hours
- Testing procedures: 4-5 hours
- Documentation: 2 hours
- Team training: 2 hours
- Total: 11-13 hours

## Dependencies
- Should be implemented before major schema changes
- Critical for production operations

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Backup failure unnoticed | Data loss | Monitoring and alerts |
| Restore takes too long | Extended downtime | Practice procedures, automation |
| Corrupted backups | Cannot restore | Regular restore testing |
| Retention too short | Cannot recover old data | Extend retention, archive critical |