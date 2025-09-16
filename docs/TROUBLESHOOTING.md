# Troubleshooting Guide

## Common Issues and Solutions

### Campaign & Assessment Issues

#### Campaigns showing wrong type (TEAM_SHARE instead of HR_CAMPAIGN)
**Symptom**: Admin-created campaigns appear as TEAM_SHARE type  
**Cause**: User's `userType` not set to ADMIN  
**Solution**:
```bash
npx tsx -e "
  await prisma.userProfile.updateMany({
    where: { email: 'admin@company.com' },
    data: { userType: 'ADMIN' }
  })
"
```

#### Duplicate participants in campaign
**Symptom**: Same user appears multiple times in participant list  
**Cause**: Clerk user IDs being added instead of emails  
**Solution**:
```bash
npx tsx -e "
  const campaigns = await prisma.campaign.findMany()
  for (const campaign of campaigns) {
    const cleanParticipants = campaign.participants
      .filter(p => p.includes('@') && !p.startsWith('user_'))
    const uniqueParticipants = [...new Set(cleanParticipants)]
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { participants: uniqueParticipants }
    })
  }
"
```

#### React duplicate key errors in campaign views
**Symptom**: Console error "Encountered two children with the same key"  
**Cause**: Using non-unique participant.id as React key  
**Solution**: Update component to use `key={participant.email || participant.id}`

#### Team members not auto-adding from share links
**Symptom**: Team completes assessment but doesn't appear in manager's team list  
**Cause**: Campaign type not set or logic not implemented  
**Solution**: Ensure `/api/assessments/save` includes team member creation logic for TEAM_SHARE campaigns

### Database & ID Issues

#### Foreign key constraint violations
**Symptom**: Error "violates foreign key constraint"  
**Cause**: Using Clerk IDs where database IDs are expected  
**Solution**:
```typescript
// Wrong
const profile = { companyId: organization.id } // Clerk ID

// Correct
const company = await fetch('/api/user/company')
const profile = { companyId: company.id } // Database ID
```

#### No company found errors
**Symptom**: "No company found" in production  
**Cause**: Different Clerk environments between dev and prod  
**Solution**: Run setup script against production database:
```bash
DATABASE_URL="postgresql://[PROD_URL]" npx tsx scripts/setup-production-company.ts
```

### Data Cleanup

#### Clean all test data except key users
```bash
npx tsx scripts/cleanup-local-data.ts
```
This preserves:
- steve@getcampfire.com
- steve.arntz@getcampfire.com

#### Delete all campaigns
```bash
npx tsx -e "
  await prisma.campaign.deleteMany({})
  console.log('All campaigns deleted')
"
```

#### Reset user types
```bash
npx tsx -e "
  // Set admin user
  await prisma.userProfile.updateMany({
    where: { email: 'admin@company.com' },
    data: { userType: 'ADMIN' }
  })
  
  // Set manager user
  await prisma.userProfile.updateMany({
    where: { email: 'manager@company.com' },
    data: { userType: 'MANAGER' }
  })
"
```

### API & Authentication Issues

#### 401 Unauthorized errors
**Symptom**: API calls returning 401  
**Cause**: Missing or incorrect authentication  
**Solution**: Ensure `credentials: 'include'` in fetch calls:
```typescript
const response = await fetch('/api/endpoint', {
  credentials: 'include',
  // ... other options
})
```

#### Campaign results not showing
**Symptom**: Empty results in dashboard  
**Cause**: Incorrect filtering or missing data  
**Check**:
1. Campaign type filtering
2. User permissions
3. Assessment results linked to invitations
4. Invitation status

### Development Environment

#### Port already in use
```bash
# Find process using port
lsof -i :3000

# Kill specific port
kill -9 $(lsof -i :3000 -t)
```

#### Prisma client out of sync
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

#### Clear Next.js cache
```bash
rm -rf .next
npm run dev
```

### Debugging Queries

#### Check campaign data
```bash
npx tsx -e "
  const campaigns = await prisma.campaign.findMany({
    include: {
      company: true
    }
  })
  console.log(JSON.stringify(campaigns, null, 2))
"
```

#### Check user profiles and types
```bash
npx tsx -e "
  const users = await prisma.userProfile.findMany()
  users.forEach(u => {
    console.log(\`\${u.email}: \${u.userType || 'NOT SET'}\`)
  })
"
```

#### Check assessment results
```bash
npx tsx -e "
  const results = await prisma.assessmentResult.findMany({
    include: {
      invitation: true
    },
    take: 5
  })
  console.log(JSON.stringify(results, null, 2))
"
```

### Production vs Development

#### Which database is being used?
Check the connection string pattern:
- Production: `ep-dawn-river`
- Development: `ep-flat-butterfly`

Visit `/api/debug-auth` to see current environment details.

#### Running scripts against production
Always prefix with production DATABASE_URL:
```bash
DATABASE_URL="postgresql://[PROD_CONNECTION_STRING]" npx tsx scripts/script-name.ts
```

### Common Gotchas

1. **Clerk IDs are environment-specific** - Same user has different IDs in dev vs prod
2. **Campaign participants should only contain emails** - Never Clerk IDs
3. **UserProfile.companyId is a database ID** - Not a Clerk organization ID
4. **Campaign filtering must include campaignType** - To separate HR from Manager campaigns
5. **Team member auto-creation only works for TEAM_SHARE** - Not HR_CAMPAIGN

### Getting Help

If issues persist:
1. Check the console for detailed error messages
2. Review `/docs/CAMPAIGN-ARCHITECTURE.md` for system design
3. Check CLAUDE.md for project-specific patterns
4. Use debugging scripts above to inspect data state