# Production Deployment Checklist

## 🚨 CRITICAL - Security & Auth
- [ ] **REMOVE AUTH BYPASS** - Critical security issue in `/src/lib/auth-helpers.ts`
  - Lines 38-43: Remove the hardcoded user bypass
  - This allows anyone to access the dashboard without authentication!
- [ ] Verify Clerk environment variables in production:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
  - `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- [ ] Test Clerk authentication flow in production environment
- [ ] Verify all API routes have proper authentication middleware

## 🧹 Code Cleanup
- [ ] Remove all `console.log` statements:
  ```bash
  grep -r "console.log" src/ --include="*.ts" --include="*.tsx"
  ```
  - `/src/app/hr-partnership/page.tsx` - Lines 446, 471
  - `/src/lib/assessment-utils.ts` - Line 24, 36
  - `/src/components/ResultsTab.tsx` - Lines 142, 197, 200
  - `/src/app/api/results/campaigns/v2/route.ts` - Lines 150, 155, 158
  
- [ ] Remove all `console.error` that expose sensitive data
- [ ] Remove development-only debugging code

## 🗄️ Database
- [ ] Run Prisma migrations on production database:
  ```bash
  DATABASE_URL="production_url" npx prisma migrate deploy
  ```
- [ ] Verify all database tables are created correctly
- [ ] Test database connection pool settings
- [ ] Backup existing production data (if any)

## 🔧 Environment Configuration
- [ ] Set all required environment variables in production:
  ```
  DATABASE_URL
  NEXT_PUBLIC_BASE_URL
  OPENAI_API_KEY
  NEXT_PUBLIC_GOOGLE_CLIENT_ID (if using Google OAuth)
  CLERK_SECRET_KEY
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  NEXT_PUBLIC_CLERK_SIGN_IN_URL
  NEXT_PUBLIC_CLERK_SIGN_UP_URL
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
  ```
- [ ] Verify `.env.production` is NOT committed to repository
- [ ] Update `NEXT_PUBLIC_BASE_URL` to production domain

## 🧪 Testing
- [ ] **Build Production Bundle Locally**:
  ```bash
  npm run build
  npm run start
  ```
- [ ] Test critical user flows:
  - [ ] Sign up new user
  - [ ] Sign in existing user
  - [ ] Create a new campaign
  - [ ] Add participants to campaign
  - [ ] Complete assessment via campaign link (with invite code)
  - [ ] Complete assessment via campaign link (without invite code - auto-create)
  - [ ] View campaign results
  - [ ] View individual results
  - [ ] Export results to CSV

- [ ] Test edge cases:
  - [ ] User completes same assessment twice
  - [ ] Invalid campaign codes
  - [ ] Expired campaign links
  - [ ] Rate limiting on API endpoints

## 🚀 Deployment Steps
1. [ ] Create production branch from main
2. [ ] Remove auth bypass code
3. [ ] Remove console.log statements
4. [ ] Commit changes
5. [ ] Deploy to staging environment first
6. [ ] Run full test suite on staging
7. [ ] Deploy to production
8. [ ] Run smoke tests on production
9. [ ] Monitor error logs for first 24 hours

## 📊 Monitoring & Analytics
- [ ] Set up error tracking (Sentry/Rollbar)
- [ ] Configure application monitoring
- [ ] Set up database query monitoring
- [ ] Configure uptime monitoring
- [ ] Set up alerts for critical errors

## 🔍 Post-Deployment Verification
- [ ] Verify all API endpoints return correct data
- [ ] Check that campaign links work correctly
- [ ] Confirm email notifications are sent
- [ ] Test CSV export functionality
- [ ] Verify assessment data is saved correctly
- [ ] Check participant status updates work
- [ ] Confirm campaign statistics are accurate

## 📝 Documentation
- [ ] Update README with production setup instructions
- [ ] Document environment variables
- [ ] Create runbook for common issues
- [ ] Document API endpoints
- [ ] Update CLAUDE.md with any new patterns

## 🔒 Security Checklist
- [ ] All sensitive routes require authentication
- [ ] No hardcoded secrets in code
- [ ] API rate limiting is configured
- [ ] CORS settings are appropriate
- [ ] Content Security Policy headers set
- [ ] SQL injection prevention (using Prisma)
- [ ] XSS prevention measures in place

## 🚦 Rollback Plan
- [ ] Document rollback procedure
- [ ] Keep previous deployment version tagged
- [ ] Database rollback strategy documented
- [ ] Feature flags for gradual rollout (if applicable)

## ⚠️ Known Issues to Address
- [ ] Clerk deprecation warning for `afterSignInUrl` prop
- [ ] React DevTools warning in production build

## Final Checks
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint errors (run `npm run lint`)
- [ ] Bundle size is reasonable
- [ ] Performance metrics acceptable
- [ ] Accessibility standards met

---

## Deployment Commands

```bash
# 1. Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# 2. Run tests
npm test

# 3. Build for production
npm run build

# 4. Test production build locally
npm run start

# 5. Deploy to Vercel (if using Vercel)
vercel --prod
```

## Emergency Contacts
- Database Admin: [Contact]
- DevOps Lead: [Contact]
- Product Owner: [Contact]

---

**Last Updated**: December 2024
**Next Review**: Before each deployment