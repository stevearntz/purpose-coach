# Share Link Fix Documentation

## Issue
The change-reflection tool was showing an incomplete share page (missing the actual content) when sharing results.

## Root Cause
The change-reflection tool was missing the share page component at `/src/app/change-reflection/share/[id]/page.tsx`.

## Solution
1. Created the missing share page following the pattern from change-style tool
2. Updated the `handleShare` function in the main page to properly structure the share data
3. Added print styles and classes to support printing functionality

## Key Changes

### 1. Created Share Page
- Path: `/src/app/change-reflection/share/[id]/page.tsx`
- Displays all collected change reflection data in a clean, shareable format
- Includes proper metadata for social sharing
- Shows:
  - Change types with icons
  - Change description
  - Current emotions
  - Concerns and positive changes
  - Coping strategies
  - Support needs
  - People impacted
  - Selected person and anticipated emotions

### 2. Updated Data Structure
Changed the share data structure from:
```typescript
{
  type: 'change-reflection',
  toolName: 'Change Reflection',
  results: { data, guide, selectedPerson }
}
```

To:
```typescript
{
  type: 'change-reflection',
  toolName: 'Change Reflection',
  data: {
    changeTypes: data.changeTypes,
    changeDescription: data.changeDescription,
    currentEmotions: data.currentEmotions,
    concerns: data.negativeChanges,
    positiveChanges: data.positiveChanges,
    copingStrategies: data.inControl,
    supportNeeds: data.whatsNew,
    peopleImpacted: data.impactedPeople,
    selectedPerson: data.selectedPerson,
    anticipatedEmotions: data.anticipatedEmotions
  }
}
```

### 3. Added Print Support
- Added print-specific CSS styles
- Added `print-section` class to the main container
- Added `no-print` class to navigation and action buttons

## Pattern for Future Tools
When implementing share functionality for tools:

1. Create share page at `/src/app/[tool-name]/share/[id]/page.tsx`
2. Structure share data with `type` and `data` fields
3. Include proper metadata for social sharing
4. Add print styles if needed
5. Follow the established pattern from change-style or change-reflection

## Testing
To test the share functionality:
1. Complete a change reflection
2. Click the Share button on the summary page
3. Copy the generated URL
4. Open in a new tab/window to verify content displays correctly