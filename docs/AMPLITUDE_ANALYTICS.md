# Amplitude Analytics Implementation Guide

## Setup Steps

### 1. Get Your Amplitude API Key
1. Log in to your Amplitude account
2. Go to Settings → Projects
3. Select your project (or create one for tools.getcampfire.com)
4. Copy the API Key

### 2. Add Environment Variable
Add to your `.env.local` file:
```env
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_api_key_here
```

### 3. Verify Installation
The analytics setup is already complete with:
- ✅ Amplitude SDK installed
- ✅ Analytics library created (`/src/lib/amplitude.ts`)
- ✅ Analytics provider added to layout
- ✅ Custom hooks for easy tracking (`/src/hooks/useAnalytics.ts`)

## Events Being Tracked

### Automatic Tracking
- **Page Views**: Every route change is tracked
- **Sessions**: User sessions are automatically tracked
- **Attribution**: Traffic sources and campaigns

### Tool Events
- `Tool Started`: When a user begins any tool
- `Tool Progress`: Progress through tool stages
- `Tool Completed`: Successful tool completion
- `Tool Abandoned`: If user leaves before completing

### User Actions
- `Context Selected`: Which context users choose (new role, project, etc.)
- `Content Shared`: When users share their results
- `File Downloaded`: PDF downloads
- `Challenges Selected`: Which challenges users identify with

## Implementation Examples

### Basic Event Tracking
```typescript
import { useAnalytics } from '@/hooks/useAnalytics'

function MyComponent() {
  const analytics = useAnalytics()
  
  const handleClick = () => {
    analytics.trackAction('Button Clicked', {
      button_name: 'Start Tool',
      location: 'homepage'
    })
  }
}
```

### Tool Tracking Pattern
```typescript
// At tool start
useEffect(() => {
  analytics.trackToolStart('Tool Name')
}, [])

// During progress
analytics.trackToolProgress('Tool Name', stageName, percentComplete)

// On completion
analytics.trackToolComplete('Tool Name', {
  completionTime: timeInSeconds,
  // other relevant data
})
```

### Error Tracking
```typescript
try {
  // some operation
} catch (error) {
  analytics.trackError('Operation Failed', error.message, {
    tool: 'Tool Name',
    stage: currentStage
  })
}
```

## Event Properties to Track

### For Tools
- `tool_name`: Which tool is being used
- `stage`: Current stage/step in the tool
- `context`: User's selected context (for HFE tool)
- `completion_time`: How long it took
- `items_created`: Number of items/responses

### For User Profile
- `role`: User's selected role
- `challenges`: Array of selected challenges
- `tools_recommended`: Which tools were shown

### For Engagement
- `share_method`: How content was shared
- `file_type`: What was downloaded
- `time_spent`: Session duration

## Dashboard Setup in Amplitude

### Recommended Charts
1. **Tool Funnel**: Track drop-off between stages
2. **Most Used Tools**: Bar chart of tool starts
3. **Completion Rates**: % who finish each tool
4. **Average Time to Complete**: By tool
5. **Share/Download Rates**: Engagement metrics

### User Segments
- By role (Manager, IC, etc.)
- By challenge type
- By tool completion
- By engagement level

### Key Metrics
- Daily/Weekly Active Users
- Tool Completion Rate
- Average Session Duration
- Most Common User Paths
- Error Rates by Tool

## Testing Analytics

### In Development
1. Open browser console
2. Look for Amplitude logs
3. Check Network tab for amplitude requests

### In Amplitude Dashboard
1. Go to User Look-Up
2. Search by your test user ID
3. View real-time event stream

## Privacy Considerations

- We don't track any PII (personally identifiable information)
- User inputs/responses are not sent to Amplitude
- Only behavioral data and anonymous IDs are tracked
- Users can opt-out via browser settings

## Adding Analytics to New Tools

1. Import the hook:
```typescript
import { useAnalytics } from '@/hooks/useAnalytics'
```

2. Initialize in component:
```typescript
const analytics = useAnalytics()
```

3. Add tracking calls:
```typescript
// Start
analytics.trackToolStart('New Tool Name')

// Progress
analytics.trackToolProgress('New Tool Name', stage, progress)

// Complete
analytics.trackToolComplete('New Tool Name', data)
```

## Troubleshooting

### Events Not Showing Up
- Check if API key is set in `.env.local`
- Verify you're not in an ad blocker
- Check browser console for errors
- Wait 1-2 minutes for events to appear

### Wrong Event Properties
- Use consistent naming conventions
- Check property types (strings, numbers, arrays)
- Avoid nested objects in properties