# Redis to PostgreSQL Migration Strategy

## Current State
- Redis is used in 7 files
- PostgreSQL models already exist for all data types
- Unified API already works with both

## Simple Migration Approach

### Phase 1: Update Storage Libraries (campaignStorage, invitationStorage, companyStorage)
These files currently use Redis but can easily use Prisma instead.

### Phase 2: Update API Routes
1. `/api/leads/route.ts` - Use Prisma Lead model
2. `/api/hr-assessments/route.ts` - Use Prisma AssessmentResult model  
3. `/api/share/route.ts` - Need to decide on share link storage

### Phase 3: Remove Redis from Unified API
The unified API already works with PostgreSQL, just remove Redis checks.

### Phase 4: Clean Up
- Remove ioredis dependency
- Remove Redis connection configs
- Delete Redis-only code

## Estimated Changes
- **~10 files to modify**
- **Most changes are simple replacements**
- **No major refactoring needed**