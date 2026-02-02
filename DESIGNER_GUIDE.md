# Designer Guide - Rusty Byte Color System

## Changing Colors - Single File Method

**To change the entire color scheme, edit only this file:**
```
tailwind.config.ts
```

## Color Definitions

All colors are defined in `tailwind.config.ts`. Simply change the hex values:

### Background Colors (Dark Theme)
```typescript
'tavern': {
  'dark': '#191204',      // Darkest background (pages)
  'medium': '#251a06',    // Medium background (cards)
  'light': '#3a2a0a',     // Light background (hover)
}
```

### Accent Colors (Golden/Bisque Theme)
```typescript
'accent': {
  DEFAULT: '#dbac75',     // Main accent color
  'light': '#e8c799',     // Light variant
  'dark': '#c89a5f',      // Dark variant
}
```

### Button Colors
```typescript
backgroundColor: {
  'btn-primary': '#dbac75',
  'btn-primary-hover': '#e8c799',
  'btn-secondary': '#3a2a0a',
  'btn-secondary-hover': '#4a3a1a',
}
```

## Example: Changing to a Blue Theme

Want to change from golden/brown to blue? Just update the hex values:

```typescript
// In tailwind.config.ts
'tavern': {
  'dark': '#0a1628',      // Dark blue
  'medium': '#1a2742',    // Medium blue
  'light': '#2a3f5f',     // Light blue
},
'accent': {
  DEFAULT: '#60a5fa',     // Bright blue
  'light': '#93c5fd',     // Light blue
  'dark': '#3b82f6',      // Dark blue
}
```

Save the file, and the entire app updates automatically!

## Testing Your Changes

After editing `tailwind.config.ts`:
1. Save the file
2. The dev server will auto-reload
3. Check these pages to see changes:
   - `/` - Home page
   - `/login` - Login form
   - `/register` - Register form
   - `/dashboard` - Dashboard (must be logged in)

## Color Usage Throughout the App

Your changes will automatically affect:
- All page backgrounds
- All cards and panels
- All text colors
- All buttons
- All borders
- All navigation elements
- All form inputs

**No other files need to be edited!**

## Need Help?

The complete design system documentation is in `DESIGN_SYSTEM.md`
