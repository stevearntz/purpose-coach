# Clerk Authentication Migration Guide

## ✅ What's Been Done

1. **Installed Clerk packages** - `@clerk/nextjs` and `@clerk/themes`
2. **Created middleware** - New Clerk middleware at `src/middleware.ts`
3. **Added ClerkProvider** - Wrapped app in `src/app/layout.tsx`
4. **Created auth pages** - `/sign-in` and `/sign-up` pages
5. **Environment template** - `.env.local.clerk` with required variables

## 🔧 What You Need to Do

### 1. Get Your Clerk Keys
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application (name it "Campfire Tools" or similar)
3. In Clerk Dashboard:
   - Go to "API Keys"
   - Copy the Publishable Key (starts with `pk_`)
   - Copy the Secret Key (starts with `sk_`)

### 2. Add Keys to Environment
```bash
# Copy the template
cp .env.local.clerk .env.local

# Then edit .env.local and add your keys:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 3. Configure Clerk Application
In the Clerk Dashboard:
1. **Authentication** → **Email, Phone, Username**:
   - Enable "Email address" as identifier
   - Enable "Password" authentication
   
2. **User & Authentication** → **Email, Phone, Username**:
   - Set "Name" as required field
   
3. **Customization** → **Branding**:
   - Upload Campfire logo
   - Set primary color to `#BF4C74`

## 🚀 Testing

1. **Start dev server**: `npm run dev`
2. **Test sign-up**: Go to http://localhost:3000/sign-up
3. **Test sign-in**: Go to http://localhost:3000/sign-in
4. **Test protection**: Try accessing http://localhost:3000/dashboard (should redirect to sign-in)

## 📝 Next Steps After Keys Are Added

Once you've added your Clerk keys, we'll:
1. Update the dashboard to use Clerk's `useUser()` hook
2. Migrate invitation flow to create Clerk users
3. Remove all NextAuth code
4. Deploy to production

## 🎯 Benefits Over NextAuth

- **No more auth bugs** - Clerk is battle-tested
- **2FA built-in** - Can enable two-factor authentication
- **SSO ready** - Can add Google, Microsoft, etc. later
- **User management UI** - Clerk provides a dashboard for managing users
- **Webhooks** - Can sync users with your database
- **Support** - Actual support team if issues arise

## ⚠️ Important Notes

- Keep the old NextAuth code in place until Clerk is fully working
- Test thoroughly in development before deploying
- The free tier includes 10,000 monthly active users