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