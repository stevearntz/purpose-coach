# ShareButton Component Usage Guide

The `ShareButton` component provides a consistent way to handle sharing functionality across all tools with inline confirmation instead of browser alerts.

## Features

- **Inline Status Feedback**: Shows "Creating Link...", "Link Copied!", or error messages directly in the button
- **No Browser Alerts**: Provides a seamless user experience without interrupting modals
- **Multiple Variants**: Supports primary, secondary, and icon-only button styles
- **Error Handling**: Gracefully handles and displays errors
- **Customizable**: Accepts custom styles and content

## Basic Usage

### 1. With Async Share Handler

```tsx
import ShareButton from '@/components/ShareButton';

const MyComponent = () => {
  const handleShare = async () => {
    // Create share data
    const response = await fetch('/api/share', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    const { url } = await response.json();
    const fullUrl = `${window.location.origin}${url}`;
    
    // Return the URL - ShareButton will handle copying
    return fullUrl;
  };

  return <ShareButton onShare={handleShare} />;
};
```

### 2. With Pre-existing URL

```tsx
<ShareButton shareUrl={existingShareUrl} />
```

### 3. With Custom Content

```tsx
<ShareButton onShare={handleShare}>
  <Share2 className="w-5 h-5" />
  <span>Share Results</span>
</ShareButton>
```

## Variants

### Primary (default)
```tsx
<ShareButton onShare={handleShare} />
```

### Secondary
```tsx
<ShareButton 
  onShare={handleShare} 
  variant="secondary"
/>
```

### Icon Only
```tsx
<ShareButton 
  onShare={handleShare} 
  variant="icon"
  showIcon={true}
/>
```

## Migration Examples

### Before (with alert):
```tsx
<button onClick={async () => {
  try {
    const url = await createShareLink();
    await navigator.clipboard.writeText(url);
    alert('✨ Share link copied!');
  } catch (error) {
    alert('Failed to share');
  }
}}>
  <Share2 /> Share
</button>
```

### After (with ShareButton):
```tsx
<ShareButton onShare={async () => {
  const url = await createShareLink();
  return url;
}} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onShare` | `() => Promise<string> \| string` | - | Async function that returns the URL to share |
| `shareUrl` | `string` | - | Direct URL to share (if already available) |
| `variant` | `'primary' \| 'secondary' \| 'icon'` | `'primary'` | Button style variant |
| `className` | `string` | `''` | Additional CSS classes |
| `children` | `ReactNode` | - | Custom button content |
| `showIcon` | `boolean` | `true` | Whether to show the share icon |

## Status Flow

1. **Idle**: Shows "Share" or custom children
2. **Loading**: Shows "Creating Link..." with spinner
3. **Copied**: Shows "Link Copied!" for 2 seconds
4. **Error**: Shows error message for 3 seconds

## Error Handling

The component automatically catches and displays errors:
- Network errors
- Clipboard API failures
- Custom errors thrown in `onShare`

## Styling

The component uses Tailwind classes and respects the variant prop. You can override styles with the `className` prop:

```tsx
<ShareButton 
  onShare={handleShare}
  className="custom-colors custom-spacing"
/>
```