# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Purpose Coach (branded as "Chat by the Fire") is a Next.js 15 application focused on AI-powered personal development and coaching. The project uses TypeScript, Tailwind CSS v4, and integrates with OpenAI's API to provide conversational coaching tools.

## 🚨 CRITICAL DATABASE CONFIGURATION (December 2024)

**WE HAVE TWO SEPARATE NEON DATABASES - THIS IS THE #1 SOURCE OF CONFUSION**

### Production Database (Neon - ep-dawn-river)
- **Connection String**: `postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **Identifier**: `ep-dawn-river-adge7l6h`
- **Used by**: Production environment on Vercel
- **Clerk Org ID**: `org_31KdjD9RIauvRC0OQ29HiOiXQPC`
- **Clerk User ID (Steve)**: `user_31KdiOPzKz43HxDkuBx7brxvQUk`

### Development Database (Neon - ep-flat-butterfly)  
- **Connection String**: `postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-flat-butterfly-adx1ubzt-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require`
- **Identifier**: `ep-flat-butterfly-adx1ubzt`
- **Used by**: Local development
- **Clerk Org ID**: `org_31IuAOPrNHNfhSHyWeUFjIccpeK`
- **Clerk User ID (Steve)**: `user_31I4733XAJ8QAWh5cw2OASaP6qt`

### Why This Matters
- **Different Clerk environments**: Development and Production use DIFFERENT Clerk instances with different IDs
- **Data isolation**: Changes to local database DO NOT affect production and vice versa
- **Common mistake**: Running database scripts against the wrong environment

### How to Run Scripts Against Production
```bash
# ALWAYS specify the production DATABASE_URL explicitly
DATABASE_URL="postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" npx tsx scripts/your-script.ts
```

### Vercel Environment Variables
- `DATABASE_URL` - Points to production Neon database
- `DATABASE_URL_UNPOOLED` - Direct connection (not pooled) - rarely needed
- `DIRECT_URL` - Legacy, might still be configured

## 🚨 CRITICAL: ID Pattern - Clerk vs Database IDs

**THIS IS THE #1 SOURCE OF FOREIGN KEY ERRORS IN THIS PROJECT**

### The Pattern You MUST Understand:
1. **Clerk IDs**: Look like `org_31KdjD9RIauvRC0OQ29HiOiXQPC` (prefixed with `org_`, `user_`, etc.)
2. **Database IDs**: Look like `cmeuy0pu70005dq7pdfendzug` (cuid format, no prefix)

### The Problem That Will Waste Hours:
- Clerk provides organization IDs in their format (`org_xxx`)
- Our database Company table has its own IDs (cuid)
- **YOU CANNOT USE CLERK IDs DIRECTLY AS FOREIGN KEYS**

### The Solution Pattern:
```typescript
// ❌ WRONG - This will cause foreign key constraint errors
const profile = {
  companyId: organization.id  // This is a Clerk ID like "org_xxx"
}

// ✅ CORRECT - Look up the database ID first
const companyResponse = await fetch('/api/user/company')
const { company } = await companyResponse.json()
const profile = {
  companyId: company.id  // This is the database ID like "cmeuy..."
}
```

### When You See These Errors:
- `foreign key constraint "UserProfile_companyId_fkey"` → You're using a Clerk ID instead of database ID
- `insert or update on table "UserProfile" violates foreign key constraint` → Same issue

### The Lookup Pattern:
1. User has Clerk org ID from `useOrganization()` or `auth()`
2. Company table has `clerkOrgId` field that maps to database `id`
3. Always translate: Clerk org ID → Database Company ID → Use in foreign keys

## Development Commands

```bash
npm run dev    # Start development server on localhost:3000
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Required Environment Variables

- `OPENAI_API_KEY` - Required for AI chat functionality
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` - Optional, for Google OAuth (currently disabled)

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **AI**: OpenAI API integration
- **PDF Generation**: jsPDF for downloadable results
- **Auth**: Clerk for authentication and organization management
- **Database**: PostgreSQL with Prisma ORM

### Project Structure
- `/src/app/` - Next.js App Router pages and components
- `/src/app/api/chat/` - OpenAI chat API endpoint
- `/src/app/purpose/`, `/src/app/values/`, `/src/app/strengths/`, etc. - Individual coaching tool modules
- Each tool is self-contained with its own page.tsx

### Key Patterns
1. **Component Structure**: Each coaching tool follows a similar pattern with stages, user profiles, and AI-driven conversations
2. **API Routes**: Use Next.js route handlers (route.ts) for backend endpoints
3. **Styling**: Glassmorphism design with backdrop-blur, gradients, and Tailwind utilities
4. **State Management**: React hooks for local state, no global state management library
5. **Type Safety**: TypeScript with path aliases (@/* maps to src/*)

### Current Implementation Notes
- The tools selection page is on the homepage
- Purpose Coach tool is fully implemented at `/purpose`
- Other tools (values, strengths, etc.) are planned but not yet implemented
- Google Auth is implemented but commented out in the code
- Demo mode available for testing without API calls

### Code Conventions
- Use functional React components with TypeScript
- Follow existing file naming patterns (kebab-case for directories, PascalCase for components)
- Maintain consistent Tailwind class ordering
- Keep API logic in route handlers, not in components
- Use the existing UI patterns (glass morphism cards, gradient backgrounds)

## CRITICAL: Reusable Components (ALWAYS USE THESE - NEVER RECREATE)

### 1. ToolSharePage Component
**Location**: `/src/components/ToolSharePage.tsx`
**Usage**: ALWAYS use for share pages, NEVER create custom share implementations
```typescript
// Example: trust-audit/share/[id]/page.tsx
import ToolSharePage from '@/components/ToolSharePage'

export default async function SharePage({ params }: Props) {
  const { id } = await params
  return (
    <ToolSharePage
      shareId={id}
      toolPath="/tool-path"
      toolConfig={config}
      renderResults={renderResults}
    />
  )
}
```

### 2. ToolNavigation Component
**Location**: `/src/components/ToolNavigation.tsx`
**Usage**: ALWAYS use for "Back to Plan" and "All Tools" navigation links
```typescript
import ToolNavigation from '@/components/ToolNavigation'
// Place at top of ViewportContainer
<ToolNavigation />
```

### 3. Other Standard Components
- **ViewportContainer** - Standard container wrapper for all pages
- **ShareButton** - Standard share functionality with loading states
- **Footer** - Consistent footer across all pages
- **NavigationHeader** - For page navigation with back buttons
- **EmailGateModal** - For email capture modals
- **Modal** - Base modal component

### 4. Standard Utilities
- **Email Validation**: Use `validateEmail` and `validateEmailRealtime` from `/src/utils/emailValidation`

## Common UI Patterns

### Email Input on Intro Screens
- **DO NOT** disable the start button based on email validation
- **DO** allow clicking the button always and show validation errors
- **DO** handle validation in the click handler

```typescript
// CORRECT PATTERN
const handleStartAssessment = async () => {
  const finalValidation = validateEmail(userEmail)
  setEmailValidation(finalValidation)
  
  if (!finalValidation.isValid) {
    setShowSuggestion(!!finalValidation.suggestion)
    return // Stop here, don't proceed
  }
  
  // Continue with valid email
  if (userEmail) {
    await captureEmailForTool(userEmail, 'Tool Name', 'tool-id')
  }
  setCurrentStage(1)
}

// Button is ALWAYS clickable
<button
  onClick={handleStartAssessment}
  className="w-full py-4 rounded-lg font-semibold text-lg transition-all bg-white text-[#BF4C74] hover:bg-white/90"
>
  Begin Assessment
</button>
```

### Navigation Pattern for Multi-Stage Tools
- Use a `renderNavigationHeader` function for consistent "Start Over" and progress pills
- Place Back/Continue buttons INSIDE the white content box
- Back button style: `px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300`
- Continue button style: `px-8 py-3 bg-[#BF4C74] text-white rounded-lg hover:bg-[#A63D5F]`
- **Stage 1 Rule**: Disable the Back button on the first stage (only Start Over applies)
  ```typescript
  // Stage 1 Back button should be disabled
  <button
    onClick={handleBack}
    disabled
    className="px-6 py-3 bg-gray-100 text-gray-400 rounded-lg font-medium transition-colors cursor-not-allowed"
  >
    Back
  </button>
  ```

### Selection Pills Pattern
- Use pills instead of checkboxes for multi-select options
- Allow custom additions with "Add your own" input + Enter key or Plus button
- Custom items show with an X to remove them
```typescript
// Pills for selection
<button
  onClick={() => toggleSelection(item)}
  className={`px-4 py-2 rounded-full border-2 transition-all text-sm ${
    isSelected
      ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
      : 'bg-white text-gray-700 border-gray-300 hover:border-[#BF4C74]/50'
  }`}
>
  {item}
</button>

// Custom items with X
<button className="... flex items-center gap-2">
  {customItem}
  <X className="w-3 h-3" />
</button>

// Add your own input
<input
  onKeyDown={(e) => {
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault()
      addItem(value.trim())
      setValue('')
    }
  }}
/>
```
- **Analytics**: Use `useAnalytics` hook from `/src/hooks/useAnalytics`
- **Email Capture**: Use `useEmailCapture` hook from `/src/hooks/useEmailCapture`

## Tool Development Checklist

When building ANY new tool:
- [ ] Check existing tools for patterns (trust-audit, burnout-assessment, team-charter are good examples)
- [ ] Use ToolNavigation component for navigation (NOT custom buttons)
- [ ] Use existing email validation utilities (NOT custom validation)
- [ ] Use analytics hooks consistently
- [ ] Create share page using ToolSharePage component (NOT custom implementation)
- [ ] Follow multi-stage pattern from existing tools
- [ ] Add to toolkit page (`/src/app/toolkit/page.tsx`)
- [ ] Add to homepage tool mappings (`/src/app/page.tsx`)
- [ ] Create layout.tsx with metadata
- [ ] Use consistent color schemes for tool families

## Common Mistakes to Avoid
1. **Creating custom share pages** - Always use ToolSharePage
2. **Custom navigation buttons** - Always use ToolNavigation
3. **Inline navigation URLs** - Use centralized navigationConfig
4. **Custom email validation** - Use existing utilities
5. **Forgetting to add tools to toolkit and homepage**
6. **Not following established multi-stage patterns**
7. **Using browser alerts/confirms** - NEVER use alert(), confirm(), or prompt() in user-facing pages (dashboard, tools, etc.). Always use in-app notifications, toasts, or modals. Admin pages can use browser alerts if needed.

## Navigation URLs
- Back to Plan: `/?screen=4`
- All Tools: `/toolkit`
- These are centralized in `/src/lib/navigationConfig.ts`

## 🔥 Database Troubleshooting Guide

### Problem: "No company found" or "No individual results" in Production

**FIRST CHECK: Which database is production using?**
1. Visit https://tools.getcampfire.com/api/debug-auth
2. Look at `debug.databaseInfo.urlStart` - is it `ep-dawn-river` or `ep-flat-butterfly`?
3. Check `debug.companiesInDb` and `debug.profilesInDb` - do the Clerk IDs match production?

**Common Cause**: Production and development use DIFFERENT databases and DIFFERENT Clerk environments

**Solution**:
```bash
# Run the setup script against PRODUCTION database
DATABASE_URL="postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" npx tsx scripts/setup-production-company.ts
```

### Problem: Foreign Key Constraint Errors

**Error:** `insert or update on table "UserProfile" violates foreign key constraint`

**Root Cause:** 99% of the time, you're trying to use a Clerk ID where a database ID is expected.

**How to Debug:**
1. Check what ID you're sending - does it start with `org_`, `user_`, etc.? That's a Clerk ID!
2. Check the database table - IDs there look like `cmeuy0pu70005dq7pdfendzug` (cuid format)
3. You need to translate between them

**Fix Pattern:**
```typescript
// Step 1: Get the Clerk org ID
const { organization } = useOrganization() // Returns { id: "org_xxx", ... }

// Step 2: Look up the database Company
const response = await fetch('/api/user/company')
const { company } = await response.json() // Returns { id: "cmeuy...", ... }

// Step 3: Use the database ID for foreign keys
await saveProfile({ companyId: company.id }) // NOT organization.id!
```

### Common ID Mismatches

| What You Have | What Database Expects | How to Convert |
|--------------|----------------------|----------------|
| Clerk org ID (`org_xxx`) | Company.id (cuid) | Look up Company by clerkOrgId field |
| Clerk user ID (`user_xxx`) | UserProfile.id (cuid) | Look up UserProfile by clerkUserId field |
| Organization.id from Clerk | Company.id in database | Use `/api/user/company` endpoint |

### Quick Checks When Debugging

1. **Console.log the IDs** - If it has a prefix like `org_`, it's wrong for the database
2. **Check the Prisma schema** - Foreign keys reference the `id` field, not `clerkOrgId`
3. **Remember the mapping fields**:
   - Company table: `id` (database) ↔ `clerkOrgId` (from Clerk)
   - UserProfile table: `id` (database) ↔ `clerkUserId` (from Clerk)

### The Golden Rule
**Never pass Clerk IDs directly to database foreign key fields. Always translate them first.**

## 📊 New API Pattern (December 2024)

### Standardized API Utilities
The project now uses a new standardized API pattern with utilities in `/src/lib/api/`:

- **handler.ts** - Creates API route handlers with authentication
- **responses.ts** - Standardized success/error responses
- **errors.ts** - Common error types and error handling
- **validation.ts** - Request validation utilities
- **types.ts** - Shared TypeScript types and error codes

### API Route Structure
```typescript
// Example: /api/user/profile/route.ts
import { createApiHandlers } from '@/lib/api/handler'
import { successResponse, SuccessResponses } from '@/lib/api/responses'
import { CommonErrors } from '@/lib/api/errors'

async function handleGetProfile({ userId }: ApiContext) {
  // Your logic here
  return successResponse({ data })
}

export const { GET, POST } = createApiHandlers({
  GET: handleGetProfile,
  POST: handleUpdateProfile
})
```

### Key API Routes

#### Member Dashboard APIs
- **`/api/member/recommendations`** - Get tool recommendations based on user activity
- **`/api/team/members`** - Manage team members (GET/POST/DELETE)
- **`/api/user/profile`** - User profile management with team info
- **`/api/user/company`** - Get company data from Clerk org

### Team Management Features

#### Team Page (`/dashboard/member/start/team`)
- Displays team name, purpose, and emoji avatar
- Shows team leader with special badge
- Lists all team members with roles
- Edit modal for updating team info and members
- Automatic sorting of members alphabetically

#### Profile Data Structure
The UserProfile now includes:
- `teamName` - The name of the user's team
- `teamPurpose` - The team's mission/purpose statement  
- `teamEmoji` - An emoji to represent the team
- `teamSize` - Number of team members
- `companyId` - Foreign key to Company (database ID, not Clerk ID!)

### Member Dashboard Feed System

#### Feed Page (`/dashboard/member/start/feed`)
The new feed page shows:
- Team updates and activity
- Completed assessments
- Team insights
- Personalized recommendations

#### Feed Components
- Activity cards with timestamps
- Assessment result summaries
- Team member progress indicators
- Interactive recommendation cards

### Debugging Team Name Issues

If team name is not saving:
1. **Check Console Logs** - Added detailed logging shows:
   - What's being sent from frontend
   - What API receives
   - What's saved to database
   - What's returned to frontend

2. **Common Issues**:
   - Partial update flag not set
   - Missing await on save function
   - Stale profile data in state

3. **Debugging Pattern**:
```typescript
// Frontend logs
console.log('[Team Page] Saving team info:', { teamName, teamPurpose })
console.log('[Team Page] Save response status:', response.status)
console.log('[Team Page] Profile after save:', data.profile)

// Backend logs  
console.log('[Profile API] Setting teamName:', teamName)
console.log('[Profile API] Upserting with dbUpdateData:', dbUpdateData)
console.log('[Profile API] Profile after upsert - teamName:', profile.teamName)
```

## 🎯 Campaign System Architecture (December 2024)

### Campaign Types and Separation
The system has two distinct campaign types that MUST remain completely separated:

1. **HR_CAMPAIGN** - Created by Admin/HR users
   - Shows in admin dashboard at `/dashboard/campaigns`
   - Created via Campaign Creation Wizard
   - Company-wide assessments
   - Visible to all admins in the organization

2. **TEAM_SHARE** - Created by Managers
   - Shows ONLY to the creating manager at `/dashboard/member/start/results`
   - Created via "Share with Team" feature in tools
   - Team-specific assessments
   - NEVER visible to HR/Admin users
   - Auto-adds team members when they complete assessments

### Critical Implementation Details

#### Campaign Type Assignment
```typescript
// In /api/campaigns/launch/v3/route.ts
const userProfile = await tx.userProfile.findUnique({
  where: { clerkUserId: req.user.id }
});
const campaignType = userProfile?.userType === 'ADMIN' ? 'HR_CAMPAIGN' : 'TEAM_SHARE';
```

#### Filtering by Campaign Type
```typescript
// Admin view - only HR_CAMPAIGN
const campaigns = await prisma.campaign.findMany({
  where: { 
    companyId: company.id,
    campaignType: 'HR_CAMPAIGN'
  }
});

// Manager view - only their TEAM_SHARE campaigns
const campaigns = await prisma.campaign.findMany({
  where: {
    createdBy: userId,
    campaignType: 'TEAM_SHARE'
  }
});
```

#### Auto Team Member Addition
When someone completes an assessment through a TEAM_SHARE campaign:
1. System checks if it's a TEAM_SHARE campaign
2. Finds the manager who created it
3. Automatically creates a TeamMember record
4. Links them to the manager's team

### Common Issues and Fixes

#### Issue: Campaign participants showing Clerk IDs instead of emails
**Cause**: `/api/campaigns/register` was pushing `userId` instead of email
**Fix**: Always store emails in the participants array, never Clerk IDs

#### Issue: Duplicate key errors in CampaignsTab
**Cause**: Using non-unique `participant.id` as React key
**Fix**: Use `participant.email || participant.id` as key

#### Issue: HR campaigns created as TEAM_SHARE
**Cause**: Missing campaignType field in campaign creation
**Fix**: Check user's userType and set appropriate campaignType

### Database Cleanup Scripts
```bash
# Clean up test data while preserving key users
npx tsx scripts/cleanup-local-data.ts

# Fix campaign participants (remove duplicates and Clerk IDs)
npx tsx -e "
  const campaigns = await prisma.campaign.findMany()
  for (const campaign of campaigns) {
    const cleanParticipants = campaign.participants.filter(p => 
      p.includes('@') && !p.startsWith('user_')
    )
    const uniqueParticipants = [...new Set(cleanParticipants)]
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { participants: uniqueParticipants }
    })
  }
"
```

### User Types and Roles
- **ADMIN**: HR/Admin users who create company-wide campaigns
- **MANAGER**: Users who can share assessments with their team
- **TEAM_MEMBER**: Regular users who complete assessments

Set user type:
```bash
npx tsx -e "
  await prisma.userProfile.updateMany({
    where: { email: 'steve@getcampfire.com' },
    data: { userType: 'ADMIN' }
  })
"
```

## 📚 Useful Database Scripts

### Debug Scripts (Already Created)
```bash
# Check what's in your LOCAL database
npx tsx scripts/debug-company.ts

# Check what's in PRODUCTION database
DATABASE_URL="postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" npx tsx scripts/verify-production-data.ts

# Fix production user/company linkage
DATABASE_URL="postgresql://neondb_owner:npg_UuDl9B4rOgLN@ep-dawn-river-adge7l6h-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require" npx tsx scripts/setup-production-company.ts
```

### Quick Database Check Endpoint
Visit in browser while logged in:
- **Local**: http://localhost:3000/api/debug-auth
- **Production**: https://tools.getcampfire.com/api/debug-auth

This shows:
- Current Clerk user/org IDs
- Which database is being used
- All companies and profiles in that database

## Clerk Environment Mappings

### Development Environment (Local)
- **Clerk Dashboard**: Different project/instance than production
- **Organization ID**: `org_31IuAOPrNHNfhSHyWeUFjIccpeK`
- **User IDs**: Different for each user (e.g., `user_31I4733XAJ8QAWh5cw2OASaP6qt`)

### Production Environment (Vercel)
- **Clerk Dashboard**: Different project/instance than development
- **Organization ID**: `org_31KdjD9RIauvRC0OQ29HiOiXQPC`
- **User IDs**: Different for each user (e.g., `user_31KdiOPzKz43HxDkuBx7brxvQUk`)

**IMPORTANT**: Clerk IDs are DIFFERENT between environments. A user in development has a different Clerk ID than the same user in production!

### Port Management
When ports are in use:
```bash
# Check active ports
lsof -i -P -n | grep LISTEN

# Kill specific port
lsof -i :3000 -t | xargs kill

# Kill multiple ports at once
kill $(lsof -i :3000,:3001,:3002 -t)
```

### Database Sync Issues
If schema changes aren't reflecting:
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development only)
npx prisma db push

# For production, use migrations
npx prisma migrate dev
```

## Assessment Results Data Flow

### Unified API Pattern
The `/api/assessments/unified/route.ts` provides a standardized way to fetch assessment results:
- Transforms various data formats into a unified structure
- Maps priority shortcuts to full text using `priorityMapping.ts`
- Filters TEAM_SHARE results from admin view automatically

### Priority/Focus Area Mapping
Always use full professional titles for focus areas:
```typescript
import { mapPriorityToFullText } from '@/utils/priorityMapping'

// Maps 'risk' → 'Risk management or compliance'
// Maps 'revenue' → 'Revenue, sales, or growth targets'
const displayText = mapPriorityToFullText(priority)
```

### Assessment Result Display Components
- **IndividualResultsViewEnhanced**: For displaying individual assessment details
- **TeamResultsView**: For displaying team member results with expandable cards
- **CampaignResultCard**: For aggregated campaign data with colored pills

Color coding for result pills:
- Red: Challenge areas
- Blue: Skills to develop
- Yellow: Support needs
- Purple: Focus areas

## Recent Session Discoveries (December 2024)

### API Response Format
All API routes now return standardized responses:
```typescript
// Success
{ success: true, data: {...}, message?: "..." }

// Error
{ success: false, error: { code: "...", message: "..." } }
```

### Partial Updates Pattern
When updating only specific fields:
```typescript
// Include partialUpdate flag
body: JSON.stringify({
  teamName: "New Name",
  partialUpdate: true  // Prevents onboardingComplete from being set
})
```

### Team Members Management
- Members stored separately from UserProfile
- Linked by leader's Clerk user ID
- Supports bulk operations (add/delete all)
- Email field is optional for members

### Frontend State Management
- Profile data cached in component state
- Refresh pattern after saves:
  1. Save to API
  2. Fetch fresh data
  3. Update local state
  4. Close modals/reset forms
## Session Update - January 2025

### Admin Organization Management Features
Successfully implemented comprehensive organization management for the admin portal:

#### Features Added
1. **Delete Organization Functionality**
   - Complete removal with confirmation modal
   - Cleans up both Clerk and database records
   - Handles all related data (profiles, invitations, etc.)

2. **Manage Admins Modal**
   - View all organization admins
   - Shows invite status (Active/Pending)
   - Resend invitations to pending admins
   - Quick invite new admin button

3. **API Endpoints Created**
   - `GET /api/admin/organizations/[id]/admins` - Fetch organization admins
   - `DELETE /api/admin/organizations/[id]` - Delete entire organization
   - `POST /api/admin/organizations/invite` - Enhanced with resend capability

#### TypeScript Fixes Applied
- Added `inviteStatus` to Admin interface
- Fixed Clerk `OrganizationMembership.userId` access using type assertions
- Corrected `deleteOrganization` method signature (string vs object)
- Removed non-existent `assessmentCampaign` table reference

### Deployment Process Clarification

#### Vercel Branch Strategy
- **development branch** → Preview deployments (automatic)
- **main branch** → Production deployment (automatic)
- Vercel watches ALL branches by default via GitHub webhooks

#### Deployment Commands
```bash
# Development (preview)
git push origin development

# Production
git checkout main
git merge development --no-edit
git push origin main
git checkout development
```

#### Database Migration Reality
- Migrations are NOT automatically executed on Vercel
- Only `prisma generate` runs (creates client, doesn't touch DB)
- Must manually run `prisma db push` after deployment
- Consider adding `vercel-build` script for automation

### Development Process Improvements Planned

Created comprehensive documentation in `/docs/improvements/`:

1. **Local PostgreSQL Setup** (`01-local-postgres-setup.md`)
   - 10x faster development
   - Offline capability
   - Safe testing environment

2. **Prisma Migrations** (`02-prisma-migrations.md`)
   - Version-controlled schema changes
   - Rollback capability
   - Team collaboration

3. **Pre-commit Hooks** (`03-pre-commit-hooks.md`)
   - Prevent broken commits
   - TypeScript checking
   - Build verification

4. **Automated Migrations** (`04-automated-migrations-deployment.md`)
   - Zero-downtime deployments
   - Automatic schema sync
   - Rollback on failure

5. **Database Backup/Restore** (`05-database-backup-restore.md`)
   - Neon backup configuration
   - Point-in-time recovery
   - Disaster recovery procedures

6. **Deployment Rollback** (`06-deployment-rollback.md`)
   - Quick rollback procedures
   - Code and database rollback
   - Automated triggers

**Implementation Order**: See `00-implementation-order.md` for phased approach

### Critical Reminders

#### ID Pattern (Still #1 Issue)
- **Clerk IDs**: `org_xxx`, `user_xxx` (prefixed)
- **Database IDs**: `cmeuy...` (cuid format, no prefix)
- **NEVER use Clerk IDs as foreign keys directly**

#### Email Service
- Using Resend (configured and working)
- Fallback messages if not configured
- Dynamic URL detection for invitations

#### Database Environments
- **Production**: `ep-dawn-river-adge7l6h` (Neon)
- **Development**: `ep-flat-butterfly-adx1ubzt` (Neon)
- Keep these separated to avoid data pollution

### Useful Scripts
```bash
# Kill all dev servers
lsof -i :3000,:3001,:3002 -t | xargs kill -9

# Check database connection
DATABASE_URL="..." npx prisma db push --dry-run

# Quick production deploy
git checkout main && git merge development --no-edit && git push origin main && git checkout development
```
