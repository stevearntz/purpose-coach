# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Purpose Coach (branded as "Chat by the Fire") is a Next.js 15 application focused on AI-powered personal development and coaching. The project uses TypeScript, Tailwind CSS v4, and integrates with OpenAI's API to provide conversational coaching tools.

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

## Navigation URLs
- Back to Plan: `/?screen=4`
- All Tools: `/toolkit`
- These are centralized in `/src/lib/navigationConfig.ts`