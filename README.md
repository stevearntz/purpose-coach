# Purpose Coach (Chat by the Fire)

A Next.js 15 application providing AI-powered personal development and coaching tools. The project is branded as "Chat by the Fire" and offers various assessment and reflection tools for individuals and teams.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Tools Catalog](#tools-catalog)
- [Development Guide](#development-guide)
- [Creating New Tools](#creating-new-tools)
- [Shared Components](#shared-components)
- [Design Patterns](#design-patterns)
- [Configuration](#configuration)
- [Development Commands](#development-commands)

## Project Overview

Purpose Coach is a comprehensive platform offering evidence-based tools to help people grow as leaders, build stronger teams, and navigate workplace challenges. The application features:

- 12+ interactive assessment and reflection tools
- AI-powered conversational interfaces using OpenAI
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
- **PDF Generation**: jsPDF
- **Analytics**: Amplitude
- **Deployment**: Optimized for Vercel

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── chat/         # OpenAI chat endpoint
│   │   ├── share/        # Share functionality
│   │   └── leads/        # Email capture
│   ├── [tool-name]/      # Individual tool pages
│   │   ├── page.tsx      # Main tool component
│   │   ├── layout.tsx    # Tool metadata
│   │   └── share/        # Share page
│   │       └── [id]/
│   │           └── page.tsx
│   ├── toolkit/          # All tools directory
│   └── page.tsx          # Homepage
├── components/            # Shared components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configs
└── utils/                # Helper functions
```

## Tools Catalog

### Currently Implemented Tools

1. **Team Charter** (`/team-charter`)
   - Create team alignment on purpose, values, and ways of working
   - Multi-stage process with team member input
   - Shareable team charter document

2. **Trust Audit** (`/trust-audit`)
   - Assess trust across Integrity, Competence, and Empathy
   - Relationship-specific evaluation
   - Actionable recommendations

3. **Burnout Assessment** (`/burnout-assessment`)
   - Evaluate workplace wellbeing
   - Personalized recovery strategies
   - PDF downloadable results

4. **Decision Making Audit** (`/decision-making-audit`)
   - Analyze decision patterns
   - Four dimensions: People, Purpose, Principles, Outcomes
   - Improvement strategies

5. **Change Style Profile** (`/change-style`)
   - Discover your change persona
   - Personalized navigation strategies
   - Team change dynamics

6. **Change Readiness Assessment** (`/change-readiness-assessment`)
   - Evaluate preparedness for change
   - Identify support needs
   - Transition planning

7. **User Guide** (`/user-guide`)
   - Create a "how to work with me" guide
   - Communication preferences
   - Working style documentation

8. **Expectations Reflection** (`/expectations-reflection`)
   - Surface hopes, fears, and expectations
   - Team psychological safety builder
   - 1:1 conversation prep

9. **Drivers Reflection** (`/drivers-reflection`)
   - Identify career motivations
   - Prioritize personal drivers
   - Career planning tool

10. **Coaching Cards** (`/coaching-cards`)
    - Powerful reflection questions
    - Multiple categories
    - Self-coaching tool

11. **Change Reflection** (`/change-reflection`)
    - 1:1 conversation preparation
    - Change-specific discussions
    - Manager tool

12. **Focus Finder** (`/accountability-builder`)
    - 5-minute weekly check-in
    - Outcomes-focused reflection
    - Priority alignment

## Development Guide

### Environment Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```bash
   OPENAI_API_KEY=your_openai_api_key
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

1. **Create Tool Directory**
   ```
   src/app/your-tool-name/
   ├── page.tsx       # Main tool component
   ├── layout.tsx     # Metadata configuration
   └── share/
       └── [id]/
           └── page.tsx   # Share page
   ```

2. **Add Tool Configuration**
   
   In `src/lib/toolConfigs.ts`:
   ```typescript
   yourToolName: {
     gradient: "from-[#COLOR1] to-[#COLOR2]",
     title: "Your Tool Name",
     subtitle: "Brief description",
     description: "Full description..."
   }
   ```

3. **Add Metadata**
   
   In `src/lib/toolMetadata.ts`:
   ```typescript
   'your-tool-name': {
     name: 'Your Tool Name',
     description: 'SEO description',
     ogImage: '/og-your-tool.png'
   }
   ```

4. **Create Layout File**
   ```typescript
   import { generateToolMetadata } from '@/lib/toolMetadata'
   
   export const metadata = generateToolMetadata('your-tool-name')
   
   export default function YourToolLayout({ children }: { children: React.ReactNode }) {
     return children
   }
   ```

5. **Implement Tool Page**
   
   Key requirements:
   - Use `ToolNavigation` component for navigation
   - Follow multi-stage pattern if applicable
   - Implement email capture on intro screen
   - Use analytics hooks for tracking
   - Add share functionality

6. **Create Share Page**
   
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

7. **Add to Toolkit Page**
   
   In `src/app/toolkit/page.tsx`, add your tool to the `tools` array:
   ```typescript
   {
     id: 'your-tool-name',
     path: '/your-tool-name',
     title: 'Your Tool Name',
     subtitle: 'Brief tagline',
     description: 'Full description',
     gradient: 'from-[#COLOR1] to-[#COLOR2]',
     icon: <YourIcon className="w-8 h-8" />,
     challenges: ['relevant', 'challenge', 'tags']
   }
   ```

8. **Add to Homepage** (if featured)
   
   Update tool mappings in `src/app/page.tsx` if the tool should appear on the homepage.

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

#### 3. ViewportContainer
- **Purpose**: Standard page wrapper with proper spacing
- **Usage**: Wrap all pages with this component

#### 4. ShareButton
- **Purpose**: Share functionality with loading states
- **Props**: `shareId`, `toolName`, `userName?`

### Utility Components

- **EmailGateModal**: Email capture modal
- **Footer**: Consistent footer
- **NavigationHeader**: Page navigation with back button
- **Modal**: Base modal component
- **ToolProgressIndicator**: Multi-stage progress display

### Hooks

#### useAnalytics
```typescript
const analytics = useAnalytics()
analytics.trackToolStart('Tool Name')
analytics.trackToolComplete('Tool Name', { completionTime })
analytics.trackToolProgress('Tool Name', 'Stage 2', 50)
```

#### useEmailCapture
```typescript
const { email, hasStoredEmail, captureEmailForTool } = useEmailCapture()
await captureEmailForTool(email, 'Tool Name', 'tool-id')
```

## Design Patterns

### UI/UX Patterns

1. **Glassmorphism Design**
   - White/transparent backgrounds with backdrop blur
   - Gradient overlays at low opacity
   - Border with white/20 for glass effect

2. **Color Schemes**
   - Each tool has a unique gradient
   - Tool families share similar color schemes
   - Primary button: white background with colored text
   - Secondary button: transparent with white border

3. **Multi-Stage Tools Pattern**
   ```typescript
   const stages = [
     { id: 'intro', title: 'Introduction', icon: Icon },
     { id: 'step1', title: 'Step 1', icon: Icon },
     // ...
   ]
   ```

4. **Navigation Pattern**
   - Progress pills at top
   - Back/Continue buttons inside content box
   - Stage 1: Back button is disabled
   - "Start Over" always available

### Code Patterns

1. **Email Validation**
   ```typescript
   const handleStartAssessment = async () => {
     const validation = validateEmail(userEmail)
     setEmailValidation(validation)
     
     if (!validation.isValid) {
       setShowSuggestion(!!validation.suggestion)
       return
     }
     
     // Continue with valid email
     if (userEmail) {
       await captureEmailForTool(userEmail, 'Tool Name', 'tool-id')
     }
     setCurrentStage(1)
   }
   ```

2. **Selection Pills Pattern**
   ```typescript
   <button
     onClick={() => toggleSelection(item)}
     className={`px-4 py-2 rounded-full border-2 ${
       isSelected
         ? 'bg-[#BF4C74] text-white border-[#BF4C74]'
         : 'bg-white text-gray-700 border-gray-300'
     }`}
   >
     {item}
   </button>
   ```

3. **Share Functionality**
   ```typescript
   const handleShare = async () => {
     const shareData = {
       toolName: 'Tool Name',
       userName: userName,
       results: results,
       createdAt: new Date().toISOString()
     }
     
     const response = await fetch('/api/share', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(shareData)
     })
     
     const { id } = await response.json()
     const shareUrl = `${window.location.origin}/tool-name/share/${id}`
   }
   ```

## Configuration

### Navigation URLs
- Back to Plan: `/?screen=4`
- All Tools: `/toolkit`
- Configured in: `/src/lib/navigationConfig.ts`

### Tool Metadata
- SEO metadata: `/src/lib/toolMetadata.ts`
- Tool configs: `/src/lib/toolConfigs.ts`
- Shared styles: Exported from `toolConfigs.ts`

### Environment Variables
- `OPENAI_API_KEY`: Required for AI features
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Optional Google OAuth
- `REDIS_URL`: For share functionality (production)

## Common Mistakes to Avoid

1. **Creating custom share pages** - Always use ToolSharePage
2. **Custom navigation buttons** - Always use ToolNavigation
3. **Inline navigation URLs** - Use centralized navigationConfig
4. **Custom email validation** - Use existing utilities
5. **Forgetting to add tools to toolkit and homepage**
6. **Not following established multi-stage patterns**
7. **Disabling start buttons based on email** - Show errors on click instead
8. **Not using existing hooks** - Always use useAnalytics and useEmailCapture

## Testing Your Tool

1. **Email Validation**
   - Test with invalid emails
   - Test with disposable emails
   - Test typo suggestions (e.g., "gmai.com")

2. **Multi-Stage Navigation**
   - Test Back button disabled on stage 1
   - Test Start Over functionality
   - Test progress indicators

3. **Share Functionality**
   - Generate share link
   - Test share page loads correctly
   - Verify "Take Assessment" link works

4. **Analytics**
   - Verify tool start/complete events
   - Check stage progression tracking
   - Test abandonment tracking

## Deployment Notes

- The application is optimized for Vercel deployment
- Environment variables must be set in Vercel dashboard
- Redis is required for share functionality in production
- All tools should have corresponding OG images for social sharing

## Need Help?

- Check existing tools for implementation examples
- Trust Audit, Burnout Assessment, and Team Charter are good references
- The CLAUDE.md file contains additional context for AI assistants
- Email validation patterns are documented in detail

Remember: Consistency is key. Always follow existing patterns rather than creating new ones.