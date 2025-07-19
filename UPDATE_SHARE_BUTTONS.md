# Share Button Update Guide

## Files that need updating:

1. ✅ `/src/app/page.tsx` - Homepage (Updated)
2. ✅ `/src/app/team-canvas/page.tsx` - Team Canvas (Updated)
3. ✅ `/src/app/user-guide/page.tsx` - User Guide (Updated)
4. ✅ `/src/app/purpose/page.tsx` - Purpose Coach (Updated)
5. ⏳ `/src/app/burnout-assessment/page.tsx` - Burnout Assessment
6. ⏳ `/src/app/career-drivers/page.tsx` - Career Drivers
7. ⏳ `/src/app/change-readiness/page.tsx` - Change Readiness
8. ⏳ `/src/app/coaching-cards/page.tsx` - Coaching Cards
9. ⏳ `/src/app/decision-making-audit/page.tsx` - Decision Making Audit
10. ⏳ `/src/app/hopes-fears-expectations/page.tsx` - Hopes, Fears & Expectations
11. ⏳ `/src/app/trust-audit/page.tsx` - Trust Audit

## Update Pattern:

### 1. Add import:
```tsx
import ShareButton from '@/components/ShareButton'
```

### 2. Create handleShare function (if inline):
```tsx
const handleShare = async () => {
  const shareData = {
    // ... existing share data
  }
  
  const response = await fetch('/api/share', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(shareData)
  })
  
  if (!response.ok) {
    throw new Error('Failed to create share link')
  }
  
  const { id, url } = await response.json()
  const fullUrl = url || `${window.location.origin}/tool-name/share/${id}`
  
  // Track share event (keep existing tracking)
  analytics.trackShare(...)
  
  return fullUrl
}
```

### 3. Replace button:
```tsx
// Before:
<button onClick={async () => { /* share logic */ }}>
  SHARE
</button>

// After:
<ShareButton onShare={handleShare} />
// Or with custom styling:
<ShareButton 
  onShare={handleShare}
  className="bg-[#color] hover:bg-[#darker]"
>
  SHARE
</ShareButton>
```

### 4. Remove unused state (if any):
- Remove `isSharing` state
- Remove `copied` state
- Remove related imports if no longer needed