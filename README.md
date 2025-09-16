# Purpose Coach (Chat by the Fire / Campfire)

## 🚨 PRODUCTION SECURITY RULES
**NO SECURITY HACKS OR BYPASSES IN PRODUCTION CODE**
- No hardcoded user bypasses or test users
- No authentication shortcuts or middleware skips  
- No domain-based authentication bypasses
- All users must properly authenticate through Clerk
- All users must have proper organization assignment
- Never commit secrets or API keys to the repository
- Always validate and sanitize user inputs

---

A Next.js 15 application providing AI-powered personal development and coaching tools for enterprises. The project is branded as "Chat by the Fire" for individuals and "Campfire" for enterprise clients, offering comprehensive assessment campaigns, reflection tools, and conversation guides for teams.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Enterprise Features](#enterprise-features)
- [Tools Catalog](#tools-catalog)
- [Development Guide](#development-guide)
- [Creating New Tools](#creating-new-tools)
- [Shared Components](#shared-components)
- [Design Patterns](#design-patterns)
- [Configuration](#configuration)
- [Development Commands](#development-commands)

## Project Overview

Purpose Coach is a comprehensive platform offering evidence-based tools to help people grow as leaders, build stronger teams, and navigate workplace challenges. The application features:

- 13+ interactive assessment, reflection, and conversation guide tools
- Enterprise assessment campaign management system
- AI-powered conversational interfaces using OpenAI
- Company-based multi-tenancy with user management
- Campaign tracking with progress monitoring
- AI-powered recommendations based on team results
- Shareable results with unique URLs
- PDF generation for assessment results
- Email capture and analytics integration
- Responsive glassmorphism design

## Architecture

### Tech Stack

- **Framework**: Next.js 15.3.4 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS v4 with PostCSS
- **Authentication**: Clerk for organization management
- **Database**: PostgreSQL (Neon) with Prisma ORM
- **AI Integration**: OpenAI API (GPT-4)
- **Email Service**: SendGrid (optional)
- **Storage**: Redis with memory fallback
- **PDF Generation**: jsPDF
- **Analytics**: Amplitude
- **Deployment**: Optimized for Vercel

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── campaigns/     # Campaign management
│   │   ├── chat/         # OpenAI chat endpoint
│   │   ├── company/      # Company & user management
│   │   ├── share/        # Share functionality
│   │   └── leads/        # Email capture
│   ├── dashboard/        # Enterprise dashboard
│   │   ├── campaigns/    # Campaign tracking
│   │   │   └── [id]/     # Individual campaign dashboard
│   │   └── tools/        # Tool management
│   │       └── [toolId]/
│   │           └── invite/ # Campaign creation flow
│   ├── [tool-name]/      # Individual tool pages
│   │   ├── page.tsx      # Main tool component
│   │   ├── layout.tsx    # Tool metadata
│   │   └── share/        # Share page
│   │       └── [id]/
│   │           └── page.tsx
│   ├── toolkit/          # All tools directory
│   └── page.tsx          # Homepage
├── components/            # Shared components
│   ├── CampaignsTab.tsx # Campaign management view
│   ├── ResultsTab.tsx    # Assessment results view
│   ├── RecommendationsTab.tsx # AI recommendations
│   └── ToolsLibrary.tsx # Tool catalog with types
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configs
│   ├── campaignStorage.ts # Campaign data management
│   ├── companyStorage.ts  # Company/user management
│   └── invitationStorage.ts # Invitation system
└── utils/                # Helper functions
```

## Enterprise Features

### Campaign Management System

The platform supports two distinct types of assessment campaigns:

#### 1. HR/Admin Campaigns (HR_CAMPAIGN)
- Company-wide assessment initiatives
- Managed through admin dashboard at `/dashboard/campaigns`
- Bulk participant management
- Company analytics and insights
- Export capabilities for HR reporting

#### 2. Manager Team Shares (TEAM_SHARE)  
- Team-specific assessments shared by managers
- Private to the creating manager
- Auto-adds team members upon completion
- Accessed via `/dashboard/member/start/results`
- Complete separation from HR data

### Key Features

### Assessment Campaign Management

The platform includes a comprehensive campaign management system designed for HR leaders managing 50-250+ participants:

#### Campaign Creation Flow
1. **Setup**: Name campaign, set timeline, configure settings
2. **Participant Selection**: Advanced filtering by department/role, bulk selection
3. **Review & Launch**: Confirm details and launch campaign

#### Campaign Dashboard Features
- Real-time progress tracking with visual indicators
- Participant status monitoring (not started/in progress/completed)
- Deadline tracking with color-coded urgency indicators
- Bulk reminder sending
- Results export functionality
- Campaign-specific unique links

#### Company Management
- User creation and management
- Department and role organization
- Domain-based company association
- Multi-tenancy support

### Dashboard Tabs

1. **Users**: Manage company users, create accounts, bulk import via CSV
2. **Assessments**: Launch formal assessment campaigns
3. **Campaigns**: Track all active and completed campaigns
4. **Results**: View individual and aggregate assessment results
5. **Recommendations**: AI-powered insights and tool recommendations

## Tools Catalog

### Tool Categories

Tools are organized into three types:

#### Assessments (Formal Campaigns)
Tools that require structured evaluation and tracking:

1. **Burnout Assessment** (`/burnout-assessment`)
   - Evaluate workplace wellbeing
   - Personalized recovery strategies
   - PDF downloadable results

2. **Change Style Profile** (`/change-style`)
   - Discover your change persona
   - Personalized navigation strategies
   - Team change dynamics

3. **Change Readiness Assessment** (`/change-readiness-assessment`)
   - Evaluate preparedness for change
   - Identify support needs
   - Transition planning

4. **HR Partnership Assessment** (`/hr-partnership`)
   - Bridge the gap between managers and HR
   - Strategic alignment tool
   - Support need identification

#### Reflections (Self-Guided Tools)
Individual or team reflection exercises:

1. **Decision Making Audit** (`/decision-making-audit`)
   - Analyze decision patterns
   - Four dimensions evaluation
   - Improvement strategies

2. **User Guide** (`/user-guide`)
   - Create a "how to work with me" guide
   - Communication preferences
   - Working style documentation

3. **Drivers Reflection** (`/drivers-reflection`)
   - Identify career motivations
   - Prioritize personal drivers
   - Career planning tool

4. **Change Reflection** (`/change-reflection`)
   - 1:1 conversation preparation
   - Change-specific discussions
   - Manager tool

5. **Focus Finder** (`/accountability-builder`)
   - 5-minute weekly check-in
   - Outcomes-focused reflection
   - Priority alignment

#### Conversation Guides (Facilitated Discussions)
Structured guides for team conversations:

1. **Team Charter** (`/team-charter`)
   - Create team alignment on purpose and values
   - Multi-stage process with team input
   - Shareable charter document

2. **Trust Audit** (`/trust-audit`)
   - Assess trust across key dimensions
   - Relationship-specific evaluation
   - Team trust building

3. **Expectations Reflection** (`/expectations-reflection`)
   - Surface hopes, fears, and expectations
   - Team psychological safety builder
   - 1:1 conversation prep

4. **Coaching Cards** (`/coaching-cards`)
   - Powerful reflection questions
   - Multiple categories
   - Self-coaching tool

## Development Guide

### Database & Branch Setup

#### Working with Branches

This project uses a dual-branch strategy for safe development:

**Git Branches:**
- `main` - Production code (protected)
- `development` - Active development branch (default)

**Database Branches (Neon):**
- `main` - Production database (used in Vercel)
- `dev` - Development database (used locally)

#### Development Workflow

1. **Always work on the `development` branch:**
   ```bash
   git checkout development
   git pull origin development
   ```

2. **Your local environment automatically uses the dev database**
   - Connection configured in `.env.local`
   - No manual switching needed

3. **Deploy to production:**
   - Create PR from `development` → `main`
   - Vercel automatically uses production database

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   
   **.env.local** (sensitive keys):
   ```bash
   # Database (Neon) - Development Branch
   DATABASE_URL="postgresql://[user]:[pass]@[endpoint]-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://[user]:[pass]@[endpoint].us-east-1.aws.neon.tech/neondb?sslmode=require"
   
   # Required
   OPENAI_API_KEY=your_openai_api_key
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # Optional
   REDIS_URL=redis_connection_url  # Falls back to memory
   RESEND_API_KEY=your_resend_key  # For email invitations
   ```
   
   **.env** (non-sensitive):
   ```bash
   NEXT_PUBLIC_BASE_URL=https://tools.getcampfire.com  # Production URL
   NEXT_PUBLIC_AMPLITUDE_API_KEY=amplitude_key
   ```

4. Copy `.env.local` to `.env` (Prisma reads from `.env`):
   ```bash
   cp .env.local .env
   ```

5. Set up database:
   ```bash
   npx prisma generate  # Generate Prisma client
   npx prisma db push   # Sync schema with database
   npx tsx scripts/seed-neon.ts  # Seed initial data
   ```

5. Run development server: `npm run dev`

### Quick Start for New Developers

```bash
# 1. Clone and setup
git clone <repo-url>
cd purpose-coach
git checkout development  # Always work on development branch
npm install

# 2. Get Neon database credentials
# - Go to https://neon.tech and create account
# - Create project "Campfire Tools"
# - Copy the 'dev' branch connection string

# 3. Configure environment
cp .env.neon.template .env.local  # Use template
# Edit .env.local with your Neon connection strings
cp .env.local .env  # Prisma needs .env

# 4. Setup database
npx prisma generate     # Generate client
npx prisma db push      # Create tables
npx tsx scripts/seed-neon.ts  # Add initial data

# 5. Start developing!
npm run dev
# Open http://localhost:3000
```

### Development Commands

```bash
npm run dev    # Start development server on localhost:3000
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## Creating New Tools

### Step-by-Step Tool Creation

1. **Determine Tool Type**
   - Assessment: Formal evaluation requiring campaigns
   - Reflection: Self-guided individual/team exercise
   - Conversation Guide: Facilitated team discussion

2. **Create Tool Directory**
   ```
   src/app/your-tool-name/
   ├── page.tsx       # Main tool component
   ├── layout.tsx     # Metadata configuration
   └── share/
       └── [id]/
           └── page.tsx   # Share page
   ```

3. **Add to ToolsLibrary**
   
   In `src/components/ToolsLibrary.tsx`:
   ```typescript
   {
     id: 'your-tool',
     path: '/your-tool',
     title: 'Your Tool Name',
     subtitle: 'Brief tagline',
     description: 'Full description',
     gradient: 'from-[#COLOR1] to-[#COLOR2]',
     icon: <YourIcon className="w-8 h-8" />,
     type: 'assessment' | 'reflection' | 'conversation-guide'
   }
   ```

4. **Add Tool Configuration**
   
   In `src/lib/toolConfigs.ts`:
   ```typescript
   yourToolName: {
     gradient: "from-[#COLOR1] to-[#COLOR2]",
     title: "Your Tool Name",
     subtitle: "Brief description",
     description: "Full description..."
   }
   ```

5. **Create Share Page**
   
   Always use `ToolSharePage` component:
   ```typescript
   import ToolSharePage from '@/components/ToolSharePage'
   
   export default async function SharePage({ params }: Props) {
     const { id } = await params
     return (
       <ToolSharePage
         shareId={id}
         toolPath="/your-tool-name"
         toolConfig={config}
         renderResults={renderResults}
       />
     )
   }
   ```

6. **Add to Toolkit Page** if it should appear in the public toolkit

## Campaign System

### Creating a Campaign

Campaigns are created through a 3-step wizard:

1. **Setup Stage**
   - Campaign name (auto-generated with quarter/year)
   - Start date and deadline
   - Custom message
   - Settings (reminders, anonymous results)

2. **Participant Selection**
   - Search across all company users
   - Filter by department and role
   - Bulk selection capabilities
   - Shows last assessment history

3. **Review & Launch**
   - Summary of all settings
   - Participant preview
   - Launch campaign button

### Campaign Tracking

Each campaign has a dedicated dashboard showing:
- Progress bar with completion percentage
- Status cards (not started, in progress, completed)
- Average score (if applicable)
- Days remaining with urgency indicators
- Participant table with individual status
- Quick actions (copy link, send reminders, export)

### Campaign Storage

Campaigns use Redis (with memory fallback) for persistence:
- Campaign metadata and settings
- Participant tracking
- Results aggregation
- Historical data for comparisons

## Shared Components

### Critical Components (Always Use These)

#### 1. ToolSharePage
- **Purpose**: Standardized share page implementation
- **Location**: `/src/components/ToolSharePage.tsx`
- **Usage**: Never create custom share pages

#### 2. ToolNavigation
- **Purpose**: "Back to Plan" and "All Tools" navigation
- **Location**: `/src/components/ToolNavigation.tsx`
- **Props**: `variant?: 'light' | 'dark'`

#### 3. ToolsLibrary
- **Purpose**: Display tools with type filtering
- **Props**: `filterType?: 'assessment' | 'reflection' | 'conversation-guide' | 'all'`
- **Shows type badges**: Blue (assessment), Purple (reflection), Green (conversation guide)

#### 4. CampaignsTab
- **Purpose**: View and manage all campaigns
- **Features**: Search, filter, sort, quick actions

### Utility Components

- **ViewportContainer**: Standard page wrapper
- **ShareButton**: Share functionality with loading states
- **EmailGateModal**: Email capture modal
- **Footer**: Consistent footer
- **NavigationHeader**: Page navigation with back button

### Hooks

#### useAnalytics
```typescript
const analytics = useAnalytics()
analytics.trackToolStart('Tool Name')
analytics.trackToolComplete('Tool Name', { completionTime })
analytics.trackAction('Campaign Created', { participantCount })
```

#### useEmailCapture
```typescript
const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
await captureEmailForTool(email, 'Tool Name', 'tool-id')
```

#### useToast
```typescript
const { showSuccess, showError } = useToast()
showSuccess('Campaign created successfully!')
showError('Failed to send invitations')
```

## Design Patterns

### UI/UX Patterns

1. **Tool Type Badges**
   - Blue badge with clipboard icon for assessments
   - Purple badge with book icon for reflections
   - Green badge with message icon for conversation guides

2. **Campaign Cards**
   - Progress bar showing completion
   - Metrics grid (invited/completed/score)
   - Status indicators with color coding
   - Quick action buttons

3. **Multi-Stage Pattern**
   - Progress pills at top
   - Step indicator in header
   - Back/Continue navigation
   - Review stage before submission

### Code Patterns

1. **Campaign Creation**
   ```typescript
   const campaign = await campaignStorage.createCampaign({
     companyId,
     toolId,
     name,
     participants,
     deadline,
     settings: {
       sendReminders: true,
       anonymousResults: false
     }
   })
   ```

2. **Participant Management**
   ```typescript
   await campaignStorage.updateParticipantStatus(
     campaignId,
     email,
     'completed',
     resultId
   )
   ```

3. **Results Aggregation**
   ```typescript
   const results = await campaignStorage.getCampaignResults(campaignId)
   const averageScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
   ```

## Data Architecture

### Campaign Separation
The system maintains complete separation between HR campaigns and manager team shares:
- Different campaign types (`HR_CAMPAIGN` vs `TEAM_SHARE`)
- Filtered views based on user role
- Private team data for managers
- Company-wide visibility for HR

### User Roles
- **ADMIN**: HR/Admin users with company-wide access
- **MANAGER**: Can share assessments with their team
- **TEAM_MEMBER**: Regular users who complete assessments

### Auto Team Member Addition
When team members complete assessments through manager share links:
1. Automatically created as TeamMember
2. Linked to the sharing manager
3. Status set to ACTIVE
4. Visible only to their manager

## Configuration

### Navigation URLs
- Dashboard: `/dashboard`
- Campaigns: `/dashboard?tab=campaigns`
- Create Campaign: `/dashboard/tools/[toolId]/invite`
- Campaign Dashboard: `/dashboard/campaigns/[id]`

### Storage Systems
- **campaignStorage**: Campaign and participant data
- **companyStorage**: Company and user management
- **invitationStorage**: Invitation tracking

### Environment Variables
- `OPENAI_API_KEY`: Required for AI features
- `REDIS_URL`: Redis connection (falls back to memory)
- `NEXT_PUBLIC_BASE_URL`: Production URL for links

## Common Mistakes to Avoid

1. **Creating assessments without campaigns** - Assessments should use campaign system
2. **Mixing tool types** - Keep assessments, reflections, and guides separate
3. **Custom campaign flows** - Use the standard 3-step wizard
4. **Not tracking participant status** - Always update status through campaignStorage
5. **Forgetting type badges** - Always show tool type in UI
6. **Direct user invitations** - Use campaign system for assessments
7. **Using v1 API endpoints** - Always use v2 endpoints with proper auth
8. **Missing credentials in fetch** - Include `credentials: 'include'` for auth
9. **Custom auth implementations** - Always use NextAuth for authentication
10. **Hardcoding Campfire URLs** - Keep branding flexible

## Authentication System

### Overview
The application uses NextAuth.js for authentication with a custom credentials provider.

### Key Components

1. **Auth Configuration** (`/src/auth.ts`)
   - NextAuth setup with credentials provider
   - JWT strategy for session management
   - Custom callbacks for user data enrichment

2. **Protected Routes** (`/src/middleware.ts`)
   - Dashboard and admin routes require authentication
   - Automatic redirect to login for unauthenticated users
   - Session-based access control

3. **Login Flow**
   - Email/password authentication at `/login`
   - Password: `Campfire2024!` (for testing)
   - Session persists across page refreshes

4. **Account Creation**
   - Invitation-based account creation
   - Password requirements enforced
   - Automatic sign-in after account creation

### API Security

1. **V2 Endpoints**
   - All v2 API endpoints use NextAuth authentication
   - Located in `/api/*/v2/route.ts`
   - Use `withAuth` middleware wrapper
   - Include `credentials: 'include'` in fetch calls

2. **Deprecated Endpoints**
   - V1 endpoints are deprecated for security
   - Middleware blocks access in production
   - Automatic warnings for deprecated routes

## Database Schema

### Key Tables

1. **Admin** - User accounts with passwords
2. **Company** - Organization entities
3. **Invitation** - Email invitations with tracking
4. **Campaign** - Assessment campaigns
5. **LocalStorage** - Persistent key-value storage

### Prisma Commands
```bash
npx prisma studio     # Visual database editor
npx prisma db push    # Sync schema changes
npx prisma generate   # Update TypeScript types
```

## Recent Updates (Session Context)

### Enterprise Onboarding System
- Built comprehensive onboarding flow from email invitation to account creation
- Created admin interface at `/admin` for managing invitations
- Implemented company-based multi-tenancy

### Assessment Campaign Management
- Created campaign system supporting 50-250+ participants
- Built 3-step campaign creation wizard
- Implemented participant tracking and progress monitoring
- Added campaign dashboard with real-time metrics

### Authentication Migration
- Migrated from custom JWT to NextAuth.js
- Implemented secure session management
- Added v2 API endpoints with proper authentication
- Created auth middleware wrapper for API routes

### Tool Categorization
- Organized all 13 tools into three types
- Renamed "Content Library" to "Assessments" (showing only assessment tools)
- Added type badges throughout the UI
- Updated recommendations to include all tool types

### Dashboard Enhancement
- Added Campaigns tab for managing all campaigns
- Created simulated Results tab showing assessment completions
- Built AI-powered Recommendations tab with prioritized insights
- Implemented user management with bulk import capabilities

## Known Issues & Solutions

### Authentication Issues
- **Session not persisting**: Ensure NEXTAUTH_SECRET is set
- **401 errors on API calls**: Add `credentials: 'include'` to fetch
- **Login redirect loops**: Check middleware.ts protected routes

### Campaign Issues
- **Campaigns not showing**: Check v2 campaigns endpoint
- **Date validation errors**: Use ISO 8601 format with time
- **Company users 500 error**: Verify company association

### Database Issues
- **Connection timeouts**: Check Supabase status
- **Prisma errors**: Run `npx prisma generate`
- **Case sensitivity**: Remove `mode: 'insensitive'` if not supported

## Testing Your Implementation

1. **Campaign Creation**
   - Create campaign with 50+ participants
   - Test filters and bulk selection
   - Verify campaign dashboard loads

2. **Tool Types**
   - Verify only assessments appear in Assessments tab
   - Check type badges display correctly
   - Test recommendations show mixed types

3. **User Management**
   - Create users individually and via CSV
   - Test company association
   - Verify user appears in participant selection

4. **Progress Tracking**
   - Monitor campaign progress updates
   - Test reminder functionality
   - Verify completion rates calculate correctly

## 🚨 CRITICAL: Database Environment Separation

### Database Provider: Neon

We use **Neon** for PostgreSQL hosting with automatic dev/prod separation:

#### Neon Database Branches
- **`main` branch** → Production database (used in Vercel)
- **`dev` branch** → Development database (used locally)

#### Why Neon?
1. **Automatic branching** - Dev and prod databases are automatically separated
2. **Instant provisioning** - Create new branches in seconds
3. **Built-in connection pooling** - No separate pooler configuration needed
4. **Git-like workflow** - Branch databases like you branch code

### Proper Environment Setup

#### Development Setup
1. **Use Neon's `dev` branch** connection string in `.env.local`
2. **Keep development Clerk keys** (`pk_test_...`, `sk_test_...`)
3. **Never commit** `.env.local` or `.env` files

#### Production Setup
1. **Use Neon's `main` branch** in Vercel environment variables
2. **Production Clerk keys** (`pk_live_...`, `sk_live_...`) in Vercel only
3. **Never put production credentials** in local files

### Database Management Commands

```bash
# Push schema changes to database
npx prisma db push

# Generate Prisma client after schema changes
npx prisma generate

# View database in Prisma Studio
npx prisma studio

# Seed initial data
npx tsx scripts/seed-neon.ts
```

### ID Pattern Understanding

**Critical distinction between Clerk IDs and Database IDs:**
- **Clerk IDs**: `org_31KdjD9RIauvRC0OQ29HiOiXQPC` (prefixed)
- **Database IDs**: `cmeuy0pu70005dq7pdfendzug` (cuid format)

**Never use Clerk IDs as database foreign keys!** Always translate:
```typescript
// ❌ WRONG - Causes foreign key errors
const profile = { companyId: organization.id }  // Clerk ID

// ✅ CORRECT - Look up database ID first
const company = await prisma.company.findUnique({ 
  where: { clerkOrgId: organization.id } 
})
const profile = { companyId: company.id }  // Database ID
```

## Database Management Best Practices

### Supabase Branching
1. **Main branch** = Production
2. **Development branch** = Local development
3. **Feature branches** = Optional for testing

### Environment File Management
```bash
.env.local          # Local development (gitignored)
.env.production     # Production placeholders (committed)
.env                # Prisma reads this (copy from .env.local)
```

**Note**: Prisma reads `.env` while Next.js reads `.env.local`. Keep them in sync!

### Common Database Errors & Solutions

#### "Prepared statement 's5' does not exist"
**Cause**: Connection pooling issues  
**Fix**: Restart dev server to clear connection pool

#### "Foreign key constraint violation"
**Cause**: Using Clerk ID instead of database ID  
**Fix**: Always translate Clerk IDs to database IDs

#### "Can't reach database server"
**Cause**: Wrong connection string or paused database  
**Fix**: Verify connection string and check if database branch is active

#### Slow database queries (1000ms+)
**Cause**: Using production database for development  
**Fix**: Use separate development database with local connection

### Security Issues

#### SQL Injection via search_path
**Issue**: Functions without fixed `search_path` are vulnerable  
**Fix**: Add `SET search_path = public` to all functions:
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Critical security fix
AS $$...$$;
```

## Deployment Notes

### Vercel Deployment
1. **Environment Variables**: Set all vars in Vercel dashboard
2. **Database**: Ensure Supabase connection pooling is configured
3. **Build Command**: `npm run build`
4. **Install Command**: `npm install`
5. **Framework Preset**: Next.js (auto-detected)

### Production Checklist
- [ ] Set NEXTAUTH_SECRET (generate with `openssl rand -base64 32`)
- [ ] Configure Supabase connection pooling
- [ ] Set up SendGrid for email (optional)
- [ ] Enable Redis for production scale
- [ ] Set NEXT_PUBLIC_BASE_URL to production domain
- [ ] Test authentication flow
- [ ] Verify v2 API endpoints work
- [ ] Check campaign creation and tracking
- [ ] **CRITICAL: Verify production uses different database than development**
- [ ] **CRITICAL: Ensure Clerk org IDs match database records**
- [ ] **CRITICAL: Fix any SQL functions missing `search_path`**

## Security Improvements & API Standardization (Latest Session)

### Critical Security Fixes Applied

#### 1. **API Authentication & Authorization**
All API routes now properly secured with Clerk authentication:

- **Companies API** (`/api/companies`): Admin-only access with role checking
- **Leads API** (`/api/leads`): Rate limiting and duplicate prevention
- **Recommendations APIs**: Authentication required, returns empty data for unauthenticated users
- **Removed** unprotected OpenAI chat endpoint (`/api/chat`)

#### 2. **Rate Limiting System**
Created comprehensive rate limiting (`/src/lib/rate-limit.ts`):
```typescript
// General API rate limiting: 30 requests/minute
checkAPIRateLimit(identifier)

// OpenAI API protection: 5 requests/5 minutes  
checkOpenAIRateLimit(userId)
```

Features:
- In-memory store with automatic cleanup
- Configurable windows and limits
- Returns retry-after headers when limited
- Applied to all OpenAI-using endpoints

#### 3. **Standardized API Pattern**
Created reusable API utilities for consistency:

**Core Files:**
- `/src/lib/api/types.ts` - Standardized response types
- `/src/lib/api/errors.ts` - Error handling utilities
- `/src/lib/api/responses.ts` - Success response helpers
- `/src/lib/api/validation.ts` - Zod validation utilities
- `/src/lib/api/handler.ts` - API wrapper with auth

**Example Usage:**
```typescript
import { withAuth } from '@/lib/api/handler';
import { CreateLeadSchema } from '@/lib/api/validation';

export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const validation = CreateLeadSchema.safeParse(body);
  
  if (!validation.success) {
    return errorResponse(validation.error);
  }
  
  // Process with validated data
  return successResponse({ id: result.id });
});
```

#### 4. **Authentication Helpers**
Consolidated auth utilities (`/src/lib/auth-helpers.ts`):
- `getCurrentAuthUser()` - Get authenticated user with org context
- `withAuthentication()` - Middleware wrapper for protected routes
- `getUserCompany()` - Map Clerk org to database company
- Automatic company creation for new organizations

#### 5. **Database Optimizations**

**Consolidated Prisma Client** (`/src/lib/prisma.ts`):
- Single instance with proper connection pooling
- Retry logic with exponential backoff
- Connection limit management
- Replaced 51 duplicate instances

**Added Database Indexes:**
```sql
-- Performance indexes added
CREATE INDEX idx_userprofile_clerk ON "UserProfile"("clerkUserId");
CREATE INDEX idx_userprofile_email ON "UserProfile"("email");
CREATE INDEX idx_company_domains ON "Company" USING gin("domains");
CREATE INDEX idx_invitation_email ON "Invitation"("email");
CREATE INDEX idx_invitation_campaign ON "Invitation"("campaignId");
CREATE INDEX idx_assessment_invitation ON "AssessmentResult"("invitationId");
CREATE INDEX idx_lead_email ON "Lead"("email");
CREATE INDEX idx_lead_created ON "Lead"("createdAt");
```

### API Migration Completed

**Migrated to New Pattern:**
- ✅ `/api/assessments/save` - Full Zod validation
- ✅ `/api/campaigns/[id]` - Proper error handling
- ✅ `/api/companies` - Admin role checking
- ✅ `/api/leads` - Rate limiting and validation

**Protected Endpoints:**
- All recommendation endpoints require authentication
- Company management requires admin role
- Campaign APIs require organization membership
- Lead capture includes spam prevention

### Security Best Practices Applied

1. **Input Validation**: All API inputs validated with Zod schemas
2. **Rate Limiting**: Prevents API abuse and protects paid services
3. **Role-Based Access**: Admin-only routes properly secured
4. **Error Handling**: Consistent error responses without leaking internals
5. **Audit Logging**: Important actions logged with user context
6. **Connection Pooling**: Prevents database connection exhaustion
7. **Duplicate Prevention**: 5-minute window for lead submissions

### Monitoring & Debugging

**Health Check Endpoint** (`/api/health`):
```json
{
  "status": "healthy",
  "checks": {
    "database": "connected",
    "openai": "configured",
    "memory": { "heapUsed": "45 MB" }
  }
}
```

**Security Headers** (`/src/middleware/security.ts`):
- HSTS for HTTPS enforcement
- CSP for XSS protection
- X-Frame-Options for clickjacking prevention
- Proper CORS configuration

### Common Security Patterns

#### Protected API Route
```typescript
import { withAuth } from '@/lib/api/handler';

export const GET = withAuth(async (req, user) => {
  // user is guaranteed to be authenticated
  // user.orgId available for multi-tenancy
  return successResponse(data);
});
```

#### Admin-Only Route
```typescript
export const POST = withAuth(async (req, user) => {
  const userProfile = await getUserProfile(user.id);
  
  if (userProfile.clerkRole !== 'admin') {
    return errorResponse('Admin access required', 403);
  }
  
  // Admin-only logic here
});
```

#### Rate-Limited Route
```typescript
export async function POST(req: NextRequest) {
  const user = await getCurrentAuthUser();
  
  const rateLimitCheck = checkOpenAIRateLimit(user.id);
  if (!rateLimitCheck.allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { 
        status: 429,
        headers: {
          'Retry-After': rateLimitCheck.retryAfter.toString()
        }
      }
    );
  }
  
  // Process request
}
```

### Technical Debt Addressed

1. **Removed 43 duplicate Prisma instances** - Single consolidated client
2. **Fixed connection pool exhaustion** - Proper pool configuration
3. **Eliminated unprotected endpoints** - All routes now secured
4. **Standardized error handling** - Consistent API responses
5. **Added missing indexes** - Database performance improved
6. **Consolidated share pages** - Single ToolSharePage component
7. **Fixed TypeScript strict errors** - Proper type safety throughout

### Migration Notes

When updating existing code:
1. Replace direct Prisma imports with `import prisma from '@/lib/prisma'`
2. Use `withAuth` wrapper for new protected routes
3. Apply rate limiting to any OpenAI-using endpoints
4. Use standardized error/success responses
5. Validate all inputs with Zod schemas

## Need Help?

- Check existing campaign implementation in `/dashboard/campaigns/[id]`
- Review ToolsLibrary for tool type examples
- CampaignsTab shows campaign card patterns
- The CLAUDE.md file contains additional context
- Security patterns in `/src/lib/api/` directory

Remember: The system is designed for enterprise scale. Always consider how features will work with 250+ users and multiple concurrent campaigns.