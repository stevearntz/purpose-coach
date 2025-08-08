# Purpose Coach (Chat by the Fire / Campfire)

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
- **AI Integration**: OpenAI API (GPT-4)
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

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
   REDIS_URL=redis_connection_url  # Optional, falls back to memory
   NEXT_PUBLIC_BASE_URL=https://tools.getcampfire.com  # Production URL
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=optional_google_oauth_id
   ```
4. Run development server: `npm run dev`

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

## Deployment Notes

- The application is optimized for Vercel deployment
- Redis is recommended for production (memory fallback available)
- Set all environment variables in Vercel dashboard
- Campaign links use NEXT_PUBLIC_BASE_URL for proper routing

## Need Help?

- Check existing campaign implementation in `/dashboard/campaigns/[id]`
- Review ToolsLibrary for tool type examples
- CampaignsTab shows campaign card patterns
- The CLAUDE.md file contains additional context

Remember: The system is designed for enterprise scale. Always consider how features will work with 250+ users and multiple concurrent campaigns.