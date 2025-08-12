# Assessment Data Integration Guide

This guide explains how to integrate assessment tools with the database to save detailed results.

## Overview

We now have a comprehensive system for saving assessment results to the database. Each assessment should save:
- Raw responses
- Calculated scores
- AI-generated summaries
- Insights and recommendations
- User profile data

## Database Schema

The `AssessmentResult` model stores:
```prisma
model AssessmentResult {
  id              String   // Unique ID
  invitationId    String   // Links to invitation
  toolId          String   // e.g., "purpose-coach"
  toolName        String   // e.g., "Purpose Coach"
  responses       Json     // Raw responses
  scores          Json?    // Calculated scores
  summary         String?  // AI summary
  insights        Json?    // Detailed insights
  recommendations Json?    // Action items
  userProfile     Json?    // User data
  completedAt     DateTime // Completion time
  shareId         String?  // For sharing
}
```

## Integration Steps

### 1. Import the utility functions

```typescript
import { saveAssessmentResult, prepareAssessmentData } from '@/lib/assessment-utils'
```

### 2. Save data when assessment completes

Add this to your assessment completion handler:

```typescript
// Example for Purpose Coach tool
const handleAssessmentComplete = async () => {
  // Prepare the assessment data
  const assessmentData = {
    inviteCode: inviteCode, // from URL params
    toolId: 'purpose-coach',
    toolName: 'Purpose Coach',
    responses: {
      userName,
      userRole,
      challenges,
      conversations,
      // ... all other collected data
    },
    summary: purposeStatement,
    insights: {
      coreValues,
      strengthsIdentified,
      keyThemes
    },
    recommendations: actionItems,
    userProfile: {
      name: userName,
      role: userRole,
      challenges: challenges
    }
  }
  
  try {
    // Save to database
    const result = await saveAssessmentResult(assessmentData)
    
    // Store the share ID for the share page
    setShareId(result.assessmentResult.shareId)
    
    // Mark invitation as completed
    await markInvitationComplete(inviteCode)
    
    // Show success state
    setShowResults(true)
  } catch (error) {
    console.error('Failed to save assessment:', error)
    // Still show results even if save fails
    setShowResults(true)
  }
}
```

### 3. Update share pages to use saved data

Share pages can retrieve saved assessment data:

```typescript
// In share/[id]/page.tsx
import { getAssessmentByShareId } from '@/lib/assessment-utils'

export default async function SharePage({ params }) {
  const assessment = await getAssessmentByShareId(params.id)
  
  if (!assessment) {
    return <NotFoundPage />
  }
  
  return (
    <ShareView
      toolName={assessment.toolName}
      summary={assessment.summary}
      insights={assessment.insights}
      recommendations={assessment.recommendations}
      userProfile={assessment.userProfile}
    />
  )
}
```

## Tool-Specific Examples

### Purpose Coach
```typescript
const saveData = {
  toolId: 'purpose-coach',
  toolName: 'Purpose Coach',
  responses: { userName, userRole, challenges, conversations },
  summary: purposeStatement,
  insights: { coreValues, strengths },
  recommendations: actionItems
}
```

### Team Charter
```typescript
const saveData = {
  toolId: 'team-charter',
  toolName: 'Team Canvas',
  responses: { teamName, purpose, people, values },
  summary: `${purpose.exists}. ${purpose.outcome}`,
  insights: { values, impact },
  recommendations: nextSteps
}
```

### HR Partnership Assessment
```typescript
const saveData = {
  toolId: 'hr-partnership',
  toolName: 'HR Partnership Assessment',
  responses: allResponses,
  scores: { partnershipScore, maturityLevel },
  insights: strengths,
  recommendations: improvements
}
```

### Burnout Assessment
```typescript
const saveData = {
  toolId: 'burnout-assessment',
  toolName: 'Burnout Risk Assessment',
  responses: surveyResponses,
  scores: { overall: overallScore, categories: categoryScores },
  summary: riskLevel,
  insights: riskFactors,
  recommendations: actionPlan
}
```

## Testing

To test the integration:

1. Complete an assessment with an invite code
2. Check the database for the saved result:
   ```bash
   npx prisma studio
   # Navigate to AssessmentResult table
   ```
3. Visit the dashboard → Results → Individuals
4. Click on a completed assessment to see saved data
5. Test the share page with the shareId

## Benefits

With this integration:
- ✅ Full assessment history is preserved
- ✅ Rich data for analytics and insights
- ✅ Individual results show detailed information
- ✅ Share pages can display saved data
- ✅ PDFs can be regenerated from saved data
- ✅ Follow-up actions can reference past assessments

## Migration Notes

For existing tools that need updating:
1. Add the saveAssessmentResult call to completion handler
2. Structure your data according to the schema
3. Test with a real invitation flow
4. Verify data appears in the enhanced results view

## API Endpoints

- `POST /api/assessments/save` - Save assessment results
- `GET /api/assessments/results` - Retrieve results (with filters)
- `POST /api/assessments/results` - Get single result by shareId