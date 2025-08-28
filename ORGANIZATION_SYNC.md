# Organization Sync Between Clerk and Database

## Overview
This application uses Clerk for authentication and organization management. To maintain consistency, we keep a synchronized copy of organization data in our database.

## How Sync Works

### Automatic Sync (Webhooks)
The application automatically syncs organizations through Clerk webhooks:

1. **Organization Created** - When a new org is created in Clerk (via UI or API), webhook creates it in database
2. **Organization Updated** - When org name changes in Clerk, webhook updates database
3. **Organization Deleted** - When org is deleted in Clerk, we log it (currently keep in DB for history)
4. **User Domain Matching** - When users sign up, webhook checks their email domain and auto-adds them to matching orgs

Webhook endpoint: `/api/webhooks/clerk`

### Manual Sync
If organizations get out of sync, run:
```bash
npm run sync:orgs
```

This will:
- Fetch all organizations from Clerk
- Create missing ones in database
- Update names if changed
- Report any orphaned database records

## Common Issues & Solutions

### Issue: Organization exists in Clerk but not in database
**Cause:** Webhook might have failed or org was created before webhooks were set up
**Solution:** Run `npm run sync:orgs`

### Issue: User not auto-joining organization
**Causes:**
1. Organization doesn't have domain set in database
2. Clerk org ID mismatch between Clerk and database
3. Webhook not configured or failing

**Solutions:**
1. Check domains in `/dashboard/users` (as admin)
2. Run `npm run sync:orgs` to fix ID mismatches
3. Check webhook logs in Clerk Dashboard

### Issue: Wrong Clerk Org ID in database
**Cause:** Manual database entry or environment mismatch
**Solution:** 
```bash
# Check current state
npm run sync:orgs

# If specific org needs fixing, use admin script
DATABASE_URL="your-db-url" npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
await prisma.company.update({
  where: { name: 'OrgName' },
  data: { clerkOrgId: 'org_correct_id' }
});
"
```

## Webhook Configuration
Ensure these webhook events are enabled in Clerk Dashboard:
- `organization.created`
- `organization.updated` 
- `organization.deleted`
- `user.created`
- `user.updated`
- `session.created`

Webhook URL: `https://your-domain.com/api/webhooks/clerk`

## Database Schema
```prisma
model Company {
  id          String   @id @default(cuid())
  name        String   @unique
  clerkOrgId  String?  @unique  // Clerk organization ID
  domains     String[] // Email domains for auto-join (e.g., ["@company.com"])
  // ... other fields
}
```

## Best Practices

1. **Always create orgs through Clerk** - Let webhooks sync to database
2. **Use sync script after Clerk Dashboard changes** - Run `npm run sync:orgs`
3. **Monitor webhook logs** - Check Clerk Dashboard for webhook failures
4. **Set domains via admin UI** - Use `/dashboard/users` to set email domains
5. **Test in development first** - Ensure webhooks work before production changes

## Troubleshooting Commands

```bash
# Check if Campfire org exists and has correct ID
DATABASE_URL="..." npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const org = await prisma.company.findUnique({ where: { name: 'Campfire' }});
console.log(org);
"

# Sync all organizations
npm run sync:orgs

# Check webhook logs
npx vercel logs [deployment-url]
```