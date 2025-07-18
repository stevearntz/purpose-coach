# Creating New Tools - Quick Guide

## 1. Quick Start (5 minutes)

1. **Copy the template**:
   ```bash
   cp src/lib/TOOL_TEMPLATE.tsx src/app/[your-tool-name]/page.tsx
   ```

2. **Add your tool config** to `src/lib/toolConfigs.ts`:
   ```typescript
   yourToolName: {
     gradient: "from-[#COLOR1] to-[#COLOR2]", // Your gradient colors
     title: "Your Tool Name",
     subtitle: "Your catchy subtitle.",
     description: "A brief description of what your tool does."
   }
   ```

3. **Important Color Usage**:
   - Use `[COLOR2]` (the darker gradient stop) for:
     - Secondary buttons (borders and text)
     - Print button (border and icon)
     - Previous button (border and text)
     - Any less prominent UI elements
   - This maintains consistency across all tools

4. **Update the template**:
   - Replace `TOOL_NAME` with your tool's key
   - Add your state variables and interfaces
   - Implement your tool's logic

## 2. Design System

All tools share these consistent elements:

- **Layout**: 
  - Intro page: Full vibrant gradient background
  - Subsequent pages: Muted gradient (30% opacity) over dark gray background
- **Cards**: `bg-white/15` with `backdrop-blur-sm` and white borders
- **Inputs**: Rounded with white borders and backdrop blur
- **Buttons**: 
  - Primary: White background with purple text
  - Secondary: Transparent with white border
- **Typography**: White text with various opacity levels

### Gradient Pattern
- **Intro Screen**: Full vibrant gradient (like main homepage)
  - White text on gradient background
  - `bg-white/15` cards with `backdrop-blur`
  - White primary button with colored text
- **Working Screens**: Light gradient (10% opacity)
  - Dark text for readability
  - White cards with subtle borders
  - Gradient-colored buttons and accents

## 3. Reusable Components

- `ToolLayout`: Handles gradient background and back button
- `ToolIntroCard`: Standard intro screen layout
- `toolStyles`: Consistent styling classes

## 4. Common Patterns

### Progress Bar
```jsx
<div className={toolStyles.progressBar}>
  <div
    className={toolStyles.progressFill}
    style={{ width: `${progress}%` }}
  />
</div>
```

### Navigation Buttons
```jsx
<button className={toolStyles.primaryButton}>Next</button>
<button className={toolStyles.secondaryButton}>Back</button>
```

### Input Fields
```jsx
<input
  type="text"
  className={toolStyles.input}
  placeholder="Your placeholder"
/>
```

## 5. Gradient Colors

Choose gradient colors that complement the tool's purpose:
- Trust/Relationships: Orange to Red `from-[#FFA62A] to-[#DB4839]`
- Purpose/Vision: Purple to Pink (like home page)
- Growth/Learning: Green gradients
- Energy/Motivation: Yellow to Orange
- Calm/Reflection: Blue gradients

## 6. Adding to Navigation

Don't forget to:
1. Add your tool to the main page tools mapping
2. Update the tool visual icons
3. Add the route to any navigation menus