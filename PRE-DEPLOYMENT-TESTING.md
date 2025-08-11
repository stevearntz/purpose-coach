# 🧪 Pre-Deployment Testing Checklist

## Critical Security Tests ✅

### 1. Authentication Flow
- [ ] **Login works**: Go to `/login` and sign in with your credentials
- [ ] **Session persists**: Refresh the page, should stay logged in
- [ ] **Logout works**: Sign out and verify you're redirected to login
- [ ] **Protected routes redirect**: Try accessing `/dashboard` when logged out → should redirect to `/login`

### 2. Dangerous Routes Are Blocked
Test that these routes return 404 (they're blocked by middleware):
```bash
# These should all fail with 404 in production
curl http://localhost:3000/api/admin/flush-storage
curl http://localhost:3000/api/test-storage
curl http://localhost:3000/api/debug/test
```

### 3. Admin Page Protection
- [ ] Visit `/admin` → Should show password prompt
- [ ] Enter wrong password → Should show error
- [ ] Enter correct password (`G3t.c@mpf1r3.st3v3`) → Should access admin panel

## Functional Tests 🔧

### 4. Dashboard Features
- [ ] **Users Tab**: View company users list
- [ ] **Tools Tab**: Browse available tools
- [ ] **Campaigns Tab**: 
  - Create a test campaign
  - Add participants
  - Launch campaign (test email sending if configured)
- [ ] **Results Tab**:
  - Switch between Campaigns/Individuals view
  - Test expandable cards in Individual view

### 5. API Endpoints
Test that old endpoints show deprecation warnings:
```bash
# Should return deprecation notice
curl http://localhost:3000/api/companies
curl http://localhost:3000/api/admin/invitations
```

### 6. Build & Performance
```bash
# Full production build should complete without errors
npm run build

# Check bundle size isn't too large
# Look for any warnings about large modules
```

### 7. Database Connections
- [ ] Create a user in dashboard → Verify it saves to database
- [ ] Create a campaign → Verify it persists after refresh
- [ ] Check Prisma migrations are up to date:
```bash
npx prisma migrate status
```

## Environment Variables Check 📋

### 8. Required for Production
Verify these are set in Vercel dashboard:
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- [ ] `NEXT_PUBLIC_BASE_URL` - Your production URL
- [ ] `RESEND_API_KEY` or `MAILGUN_API_KEY` - For emails
- [ ] `OPENAI_API_KEY` - For AI features

### 9. Optional but Recommended
- [ ] `KV_REST_API_URL` - For rate limiting (Vercel KV)
- [ ] `KV_REST_API_TOKEN` - For rate limiting
- [ ] `SENTRY_DSN` - For error tracking (future)

## Quick Local Test Script 🚀

Run this to test core functionality:
```bash
# 1. Clean build test
rm -rf .next
npm run build

# 2. Start production server locally
npm run start

# 3. In another terminal, run tests:
# Test homepage loads
curl -I http://localhost:3000 | grep "200 OK"

# Test login page loads
curl -I http://localhost:3000/login | grep "200 OK"

# Test dangerous route is blocked (should be 404 in production mode)
curl -I http://localhost:3000/api/admin/flush-storage

# Test middleware security headers are present
curl -I http://localhost:3000 | grep -E "x-frame-options|x-content-type-options"
```

## Manual Testing Flow 📝

1. **Start fresh** (clear cookies/cache)
2. **Homepage** → Should load tools selection
3. **Try Dashboard** → Should redirect to login
4. **Login** → Use your credentials
5. **Dashboard** → All tabs should work
6. **Create test campaign** → Should save
7. **View Results** → Should display properly
8. **Admin page** → Password protection works
9. **Logout** → Should clear session
10. **Try Dashboard again** → Should require login

## Common Issues to Check ⚠️

### Before Deployment:
- [ ] No `console.log` with sensitive data
- [ ] No hardcoded API keys in code
- [ ] No test/debug routes enabled
- [ ] TypeScript build has no errors
- [ ] All tests pass (if you have tests)

### After Deployment:
- [ ] Check Vercel logs for any errors
- [ ] Verify custom domain works (if configured)
- [ ] Test email sending in production
- [ ] Monitor for 500 errors
- [ ] Check rate limiting is working

## Final Production Deploy Command 🎯

Once all tests pass:
```bash
# Commit all changes
git add -A
git commit -m "Deploy: Production security improvements and UI updates"

# Push to trigger deployment
git push origin main

# Monitor deployment
vercel --prod  # If using Vercel CLI
# OR watch in Vercel dashboard
```

## Post-Deployment Verification 🔍

After deploy completes:
1. Visit production URL
2. Test login flow
3. Verify dashboard works
4. Check browser console for errors
5. Monitor Vercel Functions logs

## Rollback Plan 🔄

If issues occur:
```bash
# Option 1: Vercel Dashboard
# Go to deployments → Select previous working version → Promote to Production

# Option 2: CLI
vercel rollback

# Option 3: Git revert
git revert HEAD
git push origin main
```

---

**✅ If all these tests pass, you're ready for production!**

The most important tests are:
1. Authentication works
2. Dangerous routes are blocked
3. Dashboard functionality works
4. No build errors

Good luck with the deployment! 🚀