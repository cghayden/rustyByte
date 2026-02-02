# Rusty Byte Design System

## Color Palette

### Backgrounds
- `bg-ui-bg` or `bg-tavern-dark` - Main page background (#191204)
- `bg-ui-card` or `bg-tavern-medium` - Cards, panels, forms (#251a06)
- `bg-tavern-light` - Hover states, lighter sections (#3a2a0a)

### Text
- `text-ui-text` or `text-accent` - Primary text (#dbac75)
- `text-ui-text-muted` or `text-accent-dark` - Secondary/muted text (#c89a5f)
- `text-black` - Text on light backgrounds (buttons)

### Borders
- `border` or `border-ui-border` - Default border color (#dbac75)
- `border-accent/20` - Subtle borders (20% opacity)
- `border-accent/30` - Medium borders (30% opacity)

### Accents
- `bg-accent` or `text-accent` - Main accent color (#dbac75)
- `bg-accent-light` - Lighter accent (#e8c799)
- `bg-accent-dark` - Darker accent (#c89a5f)

## Component Patterns

### Buttons

**Primary Button (Call-to-action)**
```tsx
className="bg-btn-primary hover:bg-btn-primary-hover text-btn-primary font-semibold px-4 py-2 rounded-md transition-colors"
// OR simpler:
className="bg-accent hover:bg-accent-light text-black font-semibold px-4 py-2 rounded-md transition-colors"
```

**Secondary Button**
```tsx
className="bg-btn-secondary hover:bg-btn-secondary-hover text-btn-secondary px-4 py-2 rounded-md transition-colors"
// OR simpler:
className="bg-tavern-light hover:bg-tavern-medium text-accent px-4 py-2 rounded-md transition-colors"
```

**Danger Button**
```tsx
className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
```

### Cards/Panels
```tsx
className="bg-ui-card border border-accent/20 rounded-lg p-6 shadow-md"
// OR:
className="bg-tavern-medium border border-accent/20 rounded-lg p-6 shadow-md"
```

### Form Inputs
```tsx
className="w-full px-3 py-2 bg-tavern-dark border border-accent/30 rounded-md text-accent focus:outline-none focus:ring-2 focus:ring-accent"
```

### Links
```tsx
// Default link
className="text-accent hover:text-accent-light underline"

// Button-style link
className="bg-accent hover:bg-accent-light text-black px-3 py-1.5 rounded-xl transition-colors"
```

### Navigation Items
```tsx
// Active state
className="bg-accent text-black px-3 py-1.5 rounded-xl"

// Inactive state
className="bg-tavern-dark text-accent hover:bg-accent hover:text-black px-3 py-1.5 rounded-xl transition-colors"
```

## Usage Examples

### Page Layout
```tsx
<div className="min-h-screen bg-ui-bg">
  <div className="max-w-7xl mx-auto px-4 py-6">
    <h1 className="text-3xl font-bold text-ui-text">Page Title</h1>
    <p className="text-ui-text-muted">Subtitle or description</p>
  </div>
</div>
```

### Form
```tsx
<div className="bg-ui-card border border-accent/20 rounded-lg p-6">
  <h2 className="text-2xl font-bold mb-6">Form Title</h2>
  
  <input
    type="text"
    className="w-full px-3 py-2 bg-tavern-dark border border-accent/30 rounded-md text-accent focus:ring-2 focus:ring-accent"
  />
  
  <button className="bg-accent hover:bg-accent-light text-black font-semibold px-4 py-2 rounded-md">
    Submit
  </button>
</div>
```

## Migration Guide

Replace old classes with new ones:
- `bg-tavern-primary` → `bg-tavern-dark`
- `bg-tavern-secondary-light` → `bg-tavern-medium`
- `bg-bisque` → `bg-accent`
- `text-bisque` → `text-accent`
- `border-bisque` → `border-accent`
- `hover:bg-bisque-80` → `hover:bg-accent-light`

## Legacy Support

The old class names still work via CSS aliases in globals.css, but new code should use the design system classes above.
