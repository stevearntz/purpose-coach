# Migrating to Clerk Organizations

## Benefits of Using Clerk Organizations

1. **Built-in Multi-tenancy**: No need for Company table
2. **Role Management**: Admin, Member roles out of the box
3. **Invitations**: Built-in invite system
4. **Organization Switching**: UI components ready
5. **Permissions**: Fine-grained access control

## Implementation Plan

### 1. Update Middleware
```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/',
  // ... other public routes
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth()
  
  // Require org selection for dashboard
  if (userId && !orgId && req.url.includes('/dashboard')) {
    return NextResponse.redirect(new URL('/org-selection', req.url))
  }
})
```

### 2. Update Onboarding Page
```typescript
// src/app/onboarding/page.tsx
import { CreateOrganization } from "@clerk/nextjs";

export default function OnboardingPage() {
  return (
    <CreateOrganization 
      afterCreateOrganizationUrl="/dashboard"
      appearance={{
        // your styling
      }}
    />
  )
}
```

### 3. Update Dashboard to Use Organization
```typescript
// src/app/dashboard/page.tsx
import { OrganizationSwitcher, useOrganization } from "@clerk/nextjs";

function DashboardContent() {
  const { organization, membership } = useOrganization()
  
  // organization.name replaces company.name
  // membership.role gives you "admin" or "member"
  // organization.id replaces companyId
}
```

### 4. Update API Routes
```typescript
// src/app/api/company/users/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  const { orgId } = await auth()
  
  if (!orgId) {
    return NextResponse.json({ error: 'No organization selected' }, { status: 400 })
  }
  
  // Get organization members
  const client = await clerkClient()
  const memberships = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId
  })
  
  return NextResponse.json({ members: memberships })
}
```

### 5. Invitation System
```typescript
// Use Clerk's built-in invitations
import { useOrganization } from "@clerk/nextjs";

function InviteButton() {
  const { organization } = useOrganization()
  
  const inviteUser = async (email: string) => {
    await organization.inviteMember({
      emailAddress: email,
      role: 'member'
    })
  }
}
```

## Database Schema Changes

### Option A: Full Migration (Recommended)
- Remove Company table
- Update Invitation table to use `organizationId` instead of `companyId`
- Store all company data in Clerk organization metadata

### Option B: Hybrid Approach
- Keep Company table but link via `clerkOrganizationId`
- Gradually migrate features to use Clerk

## Migration Steps

1. **Enable Organizations in Clerk Dashboard**
2. **Update middleware to check for orgId**
3. **Add OrganizationSwitcher to dashboard header**
4. **Update onboarding to create organization instead of company**
5. **Migrate API routes to use orgId instead of companyId**
6. **Update database schema**

## Components to Add

### Organization Switcher (in Dashboard header)
```typescript
<OrganizationSwitcher 
  appearance={{
    elements: {
      rootBox: "flex items-center",
      organizationSwitcherTrigger: "px-4 py-2 rounded-lg bg-white/10"
    }
  }}
/>
```

### Organization Profile (for settings)
```typescript
<OrganizationProfile 
  appearance={{
    // your styling
  }}
/>
```

## Benefits for Your Use Case

1. **No more manual company setup** - Clerk handles it
2. **Built-in invite system** - Replace your custom invitations for admins
3. **Role-based access** - Admins vs Members automatically
4. **Organization switching** - Users can belong to multiple companies
5. **Better security** - Clerk handles all the edge cases

## Next Steps

1. Enable Organizations in Clerk Dashboard
2. Decide on migration approach (full or hybrid)
3. Update the onboarding flow first
4. Gradually migrate other features