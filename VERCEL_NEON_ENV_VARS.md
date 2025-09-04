# Vercel Environment Variables - UPDATE NOW!

## 🚨 CRITICAL: Update these in Vercel Dashboard NOW

Go to: https://vercel.com/[your-team]/purpose-coach/settings/environment-variables

### 1. DATABASE_URL (Update existing)
```
DATABASE_URL="postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-flat-butterfly-adx1ubzt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```
**Note:** This uses the pooler connection (has `-pooler` in the URL)

### 2. DIRECT_URL (Add new)
```
DIRECT_URL="postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-flat-butterfly-adx1ubzt.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
```
**Note:** This is the direct connection (no `-pooler` in the URL)

### 3. Remove Supabase Variables
Delete these if they exist:
- Any Supabase-related URLs
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

### 4. Keep These Existing Variables
✅ CLERK_SECRET_KEY
✅ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
✅ CLERK_WEBHOOK_SECRET
✅ OPENAI_API_KEY
✅ NEXT_PUBLIC_CLERK_SIGN_IN_URL
✅ NEXT_PUBLIC_CLERK_SIGN_UP_URL
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
✅ NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL

## How to Update in Vercel:

1. Go to your Vercel dashboard
2. Select the `purpose-coach` project
3. Go to Settings → Environment Variables
4. For DATABASE_URL:
   - Click the three dots → Edit
   - Replace with the Neon URL above
   - Apply to: Production, Preview, Development
5. Add DIRECT_URL:
   - Click "Add New"
   - Name: `DIRECT_URL`
   - Value: (paste the direct URL above)
   - Apply to: Production, Preview, Development
6. Save changes

## After Updating:
1. Redeploy your production site
2. Test sign-up with @getcampfire.com email