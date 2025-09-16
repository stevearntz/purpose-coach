# Campaign Architecture Documentation

## Overview
The Purpose Coach platform supports two distinct types of assessment campaigns with complete separation between HR/Admin and Manager workflows.

## Campaign Types

### 1. HR_CAMPAIGN
**Purpose**: Company-wide assessment initiatives managed by HR/Admin  
**Created by**: Users with `userType: 'ADMIN'`  
**Visibility**: All admins in the organization  
**Dashboard**: `/dashboard/campaigns`  

**Key Features**:
- Bulk participant management
- Company-wide analytics
- Export capabilities
- Email campaign management

### 2. TEAM_SHARE
**Purpose**: Team-specific assessments shared by managers  
**Created by**: Users with `userType: 'MANAGER'` or `'TEAM_MEMBER'`  
**Visibility**: ONLY the creating manager  
**Dashboard**: `/dashboard/member/start/results`  

**Key Features**:
- Quick team sharing via link
- Auto-adds team members on completion
- Team-specific insights
- Private to the manager

## Database Schema

### Campaign Model
```prisma
model Campaign {
  id           String         @id @default(cuid())
  name         String
  companyId    String
  campaignType CampaignType   @default(TEAM_SHARE)
  campaignCode String?        @unique
  createdBy    String?        // Clerk user ID of creator
  participants String[]       // Array of email addresses
  // ... other fields
}

enum CampaignType {
  TEAM_SHARE    // Manager sharing with their team
  HR_CAMPAIGN   // HR/Admin company-wide campaign
}
```

### Key Relationships
- Campaign → Company (many-to-one)
- Campaign → Invitations (one-to-many via campaignCode)
- Campaign → AssessmentResults (indirect via Invitations)

## API Endpoints

### Campaign Creation
`POST /api/campaigns/launch/v3`
- Determines campaign type based on user's `userType`
- Creates invitations for participants
- Generates unique campaign codes

### Campaign Listing
`GET /api/campaigns`
- Filters by `campaignType: 'HR_CAMPAIGN'` for admin view
- No TEAM_SHARE campaigns shown to admins

### Team Share Results
`GET /api/team/shared-results`
- Filters by `createdBy` and `campaignType: 'TEAM_SHARE'`
- Returns only the manager's own team shares

### Assessment Completion
`POST /api/assessments/save`
- Auto-creates TeamMember for TEAM_SHARE campaigns
- Links team member to manager

## Data Flow

### HR Campaign Flow
1. Admin creates campaign via wizard
2. System sets `campaignType: 'HR_CAMPAIGN'`
3. Invitations sent to participants
4. Results visible in admin dashboard
5. Analytics available company-wide

### Team Share Flow
1. Manager shares tool from Tools page
2. System creates `campaignType: 'TEAM_SHARE'`
3. Team accesses via share link
4. On completion, auto-added as TeamMember
5. Results visible only to creating manager

## Security & Permissions

### Access Control Rules
1. **HR_CAMPAIGN**: Visible to all users with `userType: 'ADMIN'`
2. **TEAM_SHARE**: Visible only to the user matching `createdBy`
3. **Assessment Results**: 
   - HR sees all except TEAM_SHARE results
   - Managers see only their team's results

### Data Isolation
- Complete separation between HR and Manager data
- No cross-visibility of campaigns
- Team member data private to their manager

## Common Patterns

### Checking Campaign Type
```typescript
const isHRCampaign = campaign.campaignType === 'HR_CAMPAIGN'
const isTeamShare = campaign.campaignType === 'TEAM_SHARE'
```

### Filtering Campaigns
```typescript
// For admin dashboard
const hrCampaigns = await prisma.campaign.findMany({
  where: {
    companyId,
    campaignType: 'HR_CAMPAIGN'
  }
})

// For manager's shared results
const teamShares = await prisma.campaign.findMany({
  where: {
    createdBy: userId,
    campaignType: 'TEAM_SHARE'
  }
})
```

### Auto-Adding Team Members
```typescript
// In assessment save endpoint
if (campaign.campaignType === 'TEAM_SHARE') {
  const manager = await findManagerProfile(campaign.createdBy)
  await createTeamMember({
    managerId: manager.id,
    email: assessmentUser.email,
    name: assessmentUser.name,
    status: 'ACTIVE'
  })
}
```

## Troubleshooting

### Issue: Campaigns showing in wrong dashboard
**Check**: Campaign's `campaignType` field
**Fix**: Ensure proper filtering by campaignType in queries

### Issue: Duplicate participants
**Check**: Campaign's `participants` array for Clerk IDs
**Fix**: Only store email addresses, never Clerk IDs

### Issue: Team members not auto-adding
**Check**: Campaign type is TEAM_SHARE
**Check**: Manager profile exists
**Fix**: Ensure assessment save logic checks campaign type

## Best Practices

1. **Always set campaignType** when creating campaigns
2. **Filter by campaignType** in all campaign queries
3. **Store only emails** in participants array
4. **Use createdBy** for ownership tracking
5. **Test separation** between admin and manager views
6. **Validate user permissions** before showing campaigns

## Migration Notes

When migrating existing campaigns:
1. Set appropriate `campaignType` based on creator's role
2. Clean participants array of any Clerk IDs
3. Ensure `createdBy` is populated for TEAM_SHARE campaigns
4. Verify data isolation between views

## Future Enhancements

Potential improvements to consider:
- Campaign templates for common assessments
- Scheduling and automation for HR campaigns
- Team hierarchy support for nested teams
- Cross-team sharing with permissions
- Campaign analytics dashboard