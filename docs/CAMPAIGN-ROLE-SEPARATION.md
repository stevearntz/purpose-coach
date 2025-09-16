# Campaign Role Separation Guide

## Overview
The system properly separates campaign management between two roles:
- **ADMIN (HR Leaders)**: See all campaigns across the company
- **MANAGER (Team Leaders)**: See only their own shared assessments

## Data Flow

### Manager Creates Share Link (Tools Page)
```
Manager clicks "Share" on tool
    ↓
Creates Campaign (createdBy: manager's userId)
    ↓
Creates Invitation (inviteCode: campaignCode)
    ↓
Team member completes assessment
    ↓
Results linked to campaign via inviteCode
```

### Manager Views Results (/dashboard/member/start/results/team)
- **Shared Tab**: Shows campaigns WHERE createdBy = currentUserId
- **Individuals Tab**: Shows results WHERE teamLinkOwner = currentUserId

### Admin/HR Views All Campaigns (/dashboard/campaigns)
- Shows ALL campaigns in the company
- Can see aggregate results across all managers
- Can drill down into individual responses

## API Endpoints

### Manager APIs
- `GET /api/team/shared-results`
  - Returns campaigns filtered by `createdBy: userId`
  - Returns individual results filtered by `teamLinkOwner: userId`

### Admin APIs  
- `GET /api/admin/campaigns`
  - Requires `userType: ADMIN`
  - Returns ALL campaigns in the company
  - Includes creator information and response details

## Key Implementation Details

1. **Campaign Creation**
   - When a manager shares from Tools page: `createdBy` is set to their userId
   - This ensures only they see it in their dashboard

2. **Invitation Linking**
   - Campaign code is used as invite code
   - Allows multiple people to use the same share link
   - Links assessments back to the campaign

3. **Role Checking**
   - Admin endpoints check `userType === 'ADMIN'`
   - Manager views automatically filter by `createdBy`

## Current State
- ✅ Steve (MANAGER) sees only his 20 campaigns
- ✅ Jason Bourne's response correctly linked to campaign 3AX2E9N3
- ✅ APIs properly filter based on creator
- ✅ Admin API created for HR dashboard

## Testing
Run `npx tsx scripts/test-role-separation.ts` to verify the separation is working correctly.