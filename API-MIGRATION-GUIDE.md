# API Migration Guide - Security Update

## Overview
This guide documents the migration from insecure API routes to production-grade, authenticated endpoints.

## Migration Status

### ✅ Completed (Production-Ready)
- `/api/campaigns/launch/v2` - Full authentication, validation, logging
- `/api/admin/invitations/v2` - Secured with admin auth
- `/api/companies/v2` - Protected company management
- `/api/results/campaigns/v2` - Secured results access

### 🔴 Critical - Needs Immediate Migration (HIGH PRIORITY)
These routes have NO authentication and expose sensitive data:

1. **Admin Routes** (Extremely Critical)
   - `/api/admin/flush-storage` → Can delete all data!
   - `/api/admin/storage-info` → Exposes system info
   - `/api/admin/invitations/[id]/resend` → Can spam users

2. **Company Management** (Critical)
   - `/api/companies` → Lists all companies
   - `/api/companies/search` → Searches all companies
   - `/api/company/invite` → Can create invites
   - `/api/company/users` → Lists all users

3. **Results & Analytics** (Critical)
   - `/api/results/individuals` → Exposes user data
   - `/api/results/campaigns` → Exposes campaign data

### 🟡 Medium Priority
- `/api/invitations/*` - Invitation tracking
- `/api/leads` - Lead capture
- `/api/share` - Share functionality

### 🟢 Low Priority (But Should Be Disabled in Production)
- `/api/test-storage`
- `/api/test-email`
- `/api/debug/*`

## Migration Steps for Each Route

### Step 1: Create New Secure Version
```typescript
// Create new file with /v2 suffix
src/app/api/[endpoint]/v2/route.ts
```

### Step 2: Add Authentication & Validation
```typescript
import { withAuth } from '@/lib/auth-middleware';
import { validateRequestBody } from '@/lib/api-validation';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  // Validated, authenticated handler
}, {
  requireAdmin: true,  // For admin routes
  rateLimit: true
});
```

### Step 3: Update Frontend Code
```typescript
// OLD - Insecure
const response = await fetch('/api/companies');

// NEW - Secure
const response = await fetch('/api/companies/v2', {
  credentials: 'include'  // Include auth cookies
});
```

### Step 4: Test & Deploy
1. Test new endpoint thoroughly
2. Update all frontend references
3. Deploy to staging
4. Monitor for errors
5. Deprecate old endpoint

## Frontend Updates Required

### Dashboard Components
Update these files to use new API endpoints:

1. `/src/app/dashboard/page.tsx`
   - Change: `/api/companies` → `/api/companies/v2`
   - Change: `/api/admin/invitations` → `/api/admin/invitations/v2`
   - Change: `/api/results/campaigns` → `/api/results/campaigns/v2`

2. `/src/app/dashboard/campaigns/page.tsx`
   - Change: `/api/campaigns/launch` → `/api/campaigns/launch/v2`

3. `/src/app/dashboard/results/page.tsx`
   - Change: `/api/results/campaigns` → `/api/results/campaigns/v2`
   - Change: `/api/results/individuals` → `/api/results/individuals/v2`

## Environment Variables Required

Add these to your `.env.local`:

```env
# Authentication (Required)
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://yourdomain.com

# Rate Limiting (Required for Production)
KV_REST_API_URL=<your-vercel-kv-url>
KV_REST_API_TOKEN=<your-vercel-kv-token>

# Or use Upstash Redis
UPSTASH_REDIS_REST_URL=<your-upstash-url>
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>

# Monitoring (Recommended)
SENTRY_DSN=<your-sentry-dsn>
LOG_LEVEL=info
```

## Security Headers to Add

In `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ];
  }
};
```

## Deprecation Timeline

### Phase 1 (Immediate)
- Deploy v2 endpoints
- Update frontend to use v2
- Add deprecation warnings to old endpoints

### Phase 2 (1 Week)
- Monitor usage of old endpoints
- Fix any remaining references
- Add rate limiting to old endpoints

### Phase 3 (2 Weeks)
- Return 410 Gone from old endpoints
- Remove old endpoint code
- Clean up database

## Testing Checklist

Before deploying each migrated endpoint:

- [ ] Authentication works correctly
- [ ] Authorization checks are in place
- [ ] Input validation prevents injection
- [ ] Rate limiting is configured
- [ ] Error messages don't leak info
- [ ] Logging captures security events
- [ ] Performance is acceptable
- [ ] Frontend integration works

## Emergency Rollback Plan

If issues occur after migration:

1. **Quick Fix**: Re-enable old endpoints temporarily
2. **Monitor**: Check logs for specific errors
3. **Fix Forward**: Patch v2 endpoints
4. **Communicate**: Notify users if needed

## Support

For migration questions:
- Create issue in repo
- Tag with `security-migration`
- Include endpoint name and error details