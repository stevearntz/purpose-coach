# Admin Security Implementation Plan

## Current State (Insecure)
- Admin page protected only by hardcoded password
- No distinction between system admins and company users
- Password visible in source code

## Target State (Secure)
- Proper authentication for admin page
- Role-based access control
- Clear separation of system admins vs company admins

## Implementation Steps

### Phase 1: Create First Admin (Do This First!)
```bash
# Install dependencies if needed
npm install tsx

# Run the script to create your first admin
npx tsx scripts/create-first-admin.ts

# Enter:
# - Email: steve@getcampfire.com
# - Name: Steve Arntz
# - Password: [choose a strong password]
```

### Phase 2: Update Admin Page (Already Prepared)
The AdminGuard component is ready. To activate it:

1. Wrap the admin page content with AdminGuard
2. Remove the hardcoded password check
3. Test login flow

### Phase 3: Role-Based Access

#### System Admin (Campfire Employees)
- Can access `/admin`
- Can create invitations for ANY company
- Can view all companies' data
- Can manage system settings

#### Company Admin (HR Leaders)
- Can access `/dashboard`
- Can only see their company's data
- Can create campaigns for their company
- Can invite users to their company

## Database Structure

```
Company: Campfire
├── Admins (System Admins)
│   ├── steve@getcampfire.com
│   ├── support@getcampfire.com
│   └── admin@getcampfire.com
│
Company: Customer Company 1
├── Admins (Company HR Leaders)
│   ├── hr@company1.com
│   └── manager@company1.com
│
Company: Customer Company 2
├── Admins (Company HR Leaders)
    └── hr@company2.com
```

## How It Works

1. **Login Flow** (`/login`)
   - User enters email/password
   - System checks if they're an Admin
   - If company = "Campfire" → System Admin → Can access `/admin`
   - If company = anything else → Company Admin → Can access `/dashboard`

2. **Creating New Companies**
   - System admins create new companies via `/admin`
   - System admins create first admin for that company
   - That admin can then invite more users

3. **Security Benefits**
   - No hardcoded passwords
   - Proper session management
   - Role-based permissions
   - Audit trail of who created what

## Quick Start for You

Since you're the founder, you should:

1. **Create yourself as a system admin**:
   ```bash
   npx tsx scripts/create-first-admin.ts
   ```

2. **Test the login**:
   - Go to `/login`
   - Enter your credentials
   - You should be redirected to `/admin`

3. **Create other Campfire admins**:
   - Use the admin page to create more Campfire company admins
   - They'll get invitation emails with setup links

4. **Create customer companies**:
   - Use admin page to create new companies
   - Create their first admin user
   - They can take it from there

## FAQ

**Q: What if I forget my password?**
A: You'll need to reset it directly in the database or create a password reset flow.

**Q: Can someone be both a system admin and a company user?**
A: Yes, but they'd need separate accounts (different emails).

**Q: What about the existing password protection?**
A: Remove it once you've created your admin account and tested login.

**Q: Is this production-ready?**
A: Almost! You should add:
- Password reset flow
- Two-factor authentication (optional but recommended)
- Session timeout
- Audit logging

## Next Steps

1. Create your admin account
2. Test the login flow
3. Remove hardcoded password from admin page
4. Deploy to production
5. Create accounts for your team