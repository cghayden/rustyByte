# Theme System - Implementation Guide

This document outlines how to implement a multi-theme system for Rusty Byte, allowing users to switch between different color schemes (tavern, ocean, space, etc.) while maintaining the current design patterns.

---

## Overview

**Goal**: Create a flexible theming system where:
- Multiple themes can coexist (tavern, ocean, space, etc.)
- Users can select their preferred theme
- Theme persists across sessions (localStorage + database)
- Class names follow a consistent, Tailwind-like naming convention

---

## 1. Naming Convention

### Current System (tavern-specific)
```
tavern-dark, tavern-medium, tavern-light
accent, accent-light, accent-dark
btn-primary, btn-secondary
```

### Proposed System (theme-agnostic + numbered scale)

#### Base Color Scale (50-950, like Tailwind)
Each theme defines a color palette from lightest to darkest:

| Class | Purpose |
|-------|---------|
| `theme-50` | Lightest (text on dark, subtle highlights) |
| `theme-100` | Very light |
| `theme-200` | Light |
| `theme-300` | Light-medium |
| `theme-400` | Medium-light |
| `theme-500` | **Base/Default** |
| `theme-600` | Medium-dark |
| `theme-700` | Dark |
| `theme-800` | Very dark |
| `theme-900` | Darkest (backgrounds) |
| `theme-950` | Near black |

#### Semantic/Functional Colors
These map to the numbered scale but provide clear intent:

| Class | Purpose | Example Mapping |
|-------|---------|-----------------|
| `theme-bg-dark` | Darkest page background | → theme-950 |
| `theme-bg-medium` | Card/panel background | → theme-900 |
| `theme-bg-light` | Hover states, highlights | → theme-800 |
| `theme-text-primary` | Main text color | → theme-100 |
| `theme-text-secondary` | Muted/secondary text | → theme-300 |
| `theme-text-dark` | Text on light backgrounds | → theme-900 |
| `theme-border` | Default border color | → theme-400 |

#### Button Colors
| Class | Purpose |
|-------|---------|
| `theme-button-primary` | Primary action button background |
| `theme-button-primary-hover` | Primary button hover state |
| `theme-button-secondary` | Secondary button background |
| `theme-button-secondary-hover` | Secondary button hover state |
| `theme-button-danger` | Destructive action (delete, etc.) |
| `theme-button-danger-hover` | Danger button hover |
| `theme-button-disabled` | Disabled button state |
| `theme-button-text-primary` | Text on primary buttons |
| `theme-button-text-secondary` | Text on secondary buttons |

#### Complementary/Accent Colors
For highlights, links, focus states:

| Class | Purpose |
|-------|---------|
| `theme-accent` | Main accent color |
| `theme-accent-light` | Light accent (hover) |
| `theme-accent-dark` | Dark accent (active/pressed) |
| `theme-complementary` | Complementary highlight color |
| `theme-complementary-light` | Light complementary |
| `theme-complementary-dark` | Dark complementary |

#### Utility Colors (theme-aware)
| Class | Purpose |
|-------|---------|
| `theme-white` | White or near-white for the theme |
| `theme-black` | Black or near-black for the theme |
| `theme-success` | Success/positive color |
| `theme-warning` | Warning color |
| `theme-error` | Error/danger color |
| `theme-info` | Informational color |

---

## 2. Theme Definitions

### Tavern Theme (Current - Warm Golden Brown)
```css
--tavern-50: #faf6f0;
--tavern-100: #e8c799;
--tavern-200: #dbac75;
--tavern-300: #c89a5f;
--tavern-400: #a67d45;
--tavern-500: #8a6535;
--tavern-600: #6a4d28;
--tavern-700: #4a3a1a;
--tavern-800: #3a2a0a;
--tavern-900: #251a06;
--tavern-950: #191204;
```

### Ocean Theme (Cool Blue)
```css
--ocean-50: #f0f9ff;
--ocean-100: #e0f2fe;
--ocean-200: #bae6fd;
--ocean-300: #7dd3fc;
--ocean-400: #38bdf8;
--ocean-500: #0ea5e9;
--ocean-600: #0284c7;
--ocean-700: #0369a1;
--ocean-800: #075985;
--ocean-900: #0c4a6e;
--ocean-950: #082f49;
```

### Space Theme (Deep Purple/Cosmic)
```css
--space-50: #faf5ff;
--space-100: #f3e8ff;
--space-200: #e9d5ff;
--space-300: #d8b4fe;
--space-400: #c084fc;
--space-500: #a855f7;
--space-600: #9333ea;
--space-700: #7e22ce;
--space-800: #6b21a8;
--space-900: #581c87;
--space-950: #2e1065;
```

### Forest Theme (Natural Green)
```css
--forest-50: #f0fdf4;
--forest-100: #dcfce7;
--forest-200: #bbf7d0;
--forest-300: #86efac;
--forest-400: #4ade80;
--forest-500: #22c55e;
--forest-600: #16a34a;
--forest-700: #15803d;
--forest-800: #166534;
--forest-900: #14532d;
--forest-950: #052e16;
```

---

## 3. Implementation Approaches

### Option A: CSS Custom Properties (Recommended)

**How it works:**
- Define all colors as CSS variables
- Swap variable values when theme changes
- No need for dynamic class names

**globals.css:**
```css
/* Default theme (tavern) */
:root {
  --theme-50: #faf6f0;
  --theme-100: #e8c799;
  /* ... etc */
  --theme-950: #191204;
  
  --theme-bg-dark: var(--theme-950);
  --theme-bg-medium: var(--theme-900);
  --theme-bg-light: var(--theme-800);
  --theme-text-primary: var(--theme-100);
  --theme-button-primary: var(--theme-200);
  /* ... etc */
}

/* Ocean theme */
[data-theme="ocean"] {
  --theme-50: #f0f9ff;
  --theme-100: #e0f2fe;
  /* ... etc */
  --theme-950: #082f49;
}

/* Space theme */
[data-theme="space"] {
  --theme-50: #faf5ff;
  /* ... etc */
}
```

**Usage in components (unchanged):**
```tsx
<div className="bg-theme-bg-dark text-theme-text-primary">
  <button className="bg-theme-button-primary">Click me</button>
</div>
```

**Switching themes:**
```tsx
// Just add data-theme attribute to <html> or <body>
document.documentElement.setAttribute('data-theme', 'ocean');
```

**Pros:**
- ✅ Class names stay the same (no dynamic string building)
- ✅ Easy to add new themes
- ✅ Works with Tailwind's @theme directive
- ✅ No re-render needed, just CSS changes
- ✅ Instant theme switching

**Cons:**
- ⚠️ Need to set up Tailwind to use CSS variables

---

### Option B: Dynamic Class Names

**How it works:**
- Store theme name in context/state
- Build class names dynamically: `${theme}-bg-dark`

**ThemeContext:**
```tsx
const ThemeContext = createContext({ theme: 'tavern' });

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('tavern');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

**Usage in components:**
```tsx
const { theme } = useTheme();

<div className={`${theme}-bg-dark ${theme}-text-primary`}>
  <button className={`${theme}-button-primary`}>Click me</button>
</div>
```

**Pros:**
- ✅ Clear which theme is being used in markup

**Cons:**
- ❌ Every component needs theme context
- ❌ Dynamic strings don't get Tailwind autocomplete
- ❌ Requires full re-render on theme change
- ❌ Can't use `className="tavern-bg-dark"` directly

---

### Recommendation: Option A (CSS Custom Properties)

CSS variables are the standard approach for theming. You write `bg-theme-bg-dark` once, and it automatically adapts to whatever theme is active.

---

## 4. Storing Theme Preference

### localStorage (Immediate, per-device)
```tsx
// Save
localStorage.setItem('theme', 'ocean');

// Load (on app init)
const savedTheme = localStorage.getItem('theme') || 'tavern';
document.documentElement.setAttribute('data-theme', savedTheme);
```

### Database (Synced across devices)
```prisma
model User {
  id       String  @id @default(cuid())
  username String  @unique
  // ... other fields
  theme    String  @default("tavern")
}
```

### Combined Approach (Best UX)
1. On page load: Check localStorage for instant theme (no flash)
2. After auth: Fetch user's theme from database
3. If different: Update localStorage to match database
4. On theme change: Update both localStorage AND database

```tsx
// ThemeProvider.tsx
useEffect(() => {
  // Immediate: use localStorage
  const localTheme = localStorage.getItem('theme');
  if (localTheme) {
    document.documentElement.setAttribute('data-theme', localTheme);
  }
  
  // Then sync with database if logged in
  if (user) {
    fetchUserTheme().then(dbTheme => {
      if (dbTheme !== localTheme) {
        localStorage.setItem('theme', dbTheme);
        document.documentElement.setAttribute('data-theme', dbTheme);
      }
    });
  }
}, [user]);
```

---

## 5. Preventing Flash of Wrong Theme

Add this script in `<head>` (before page renders):

**app/layout.tsx:**
```tsx
<head>
  <script dangerouslySetInnerHTML={{
    __html: `
      (function() {
        const theme = localStorage.getItem('theme') || 'tavern';
        document.documentElement.setAttribute('data-theme', theme);
      })();
    `
  }} />
</head>
```

This runs synchronously before React hydrates, preventing any flash.

---

## 6. Implementation Steps

### Phase 1: Refactor Current Colors to CSS Variables
1. [ ] Update `globals.css` to define all tavern colors as CSS variables
2. [ ] Create Tailwind utility classes that reference CSS variables
3. [ ] Update existing components to use new class names
4. [ ] Verify tavern theme still works

### Phase 2: Add Theme Infrastructure
1. [ ] Add `data-theme` attribute support in globals.css
2. [ ] Create ThemeProvider context
3. [ ] Add theme toggle to dashboard/profile page
4. [ ] Implement localStorage persistence
5. [ ] Add inline script to prevent flash

### Phase 3: Add Database Sync
1. [ ] Add `theme` field to User model
2. [ ] Create API endpoint to update theme
3. [ ] Sync localStorage with database on login
4. [ ] Update theme when user changes it

### Phase 4: Add More Themes
1. [ ] Define ocean theme colors
2. [ ] Define space theme colors
3. [ ] Define forest theme colors (optional)
4. [ ] Create theme preview/selection UI

---

## 7. Theme Selector UI Ideas

### Simple Dropdown (Dashboard)
```tsx
<select value={theme} onChange={(e) => setTheme(e.target.value)}>
  <option value="tavern">🍺 Tavern (Warm Brown)</option>
  <option value="ocean">🌊 Ocean (Cool Blue)</option>
  <option value="space">🚀 Space (Purple)</option>
  <option value="forest">🌲 Forest (Green)</option>
</select>
```

### Visual Swatches
```tsx
<div className="flex gap-2">
  {themes.map(t => (
    <button
      key={t.name}
      onClick={() => setTheme(t.name)}
      className="w-8 h-8 rounded-full border-2"
      style={{ backgroundColor: t.primaryColor }}
      aria-label={t.label}
    />
  ))}
</div>
```

---

## 8. Files to Modify

| File | Changes |
|------|---------|
| `globals.css` | Add CSS variables, theme selectors |
| `tailwind.config.ts` | Reference CSS variables |
| `app/layout.tsx` | Add flash-prevention script |
| `components/ThemeProvider.tsx` | New - theme context & persistence |
| `app/dashboard/page.tsx` | Add theme selector UI |
| `prisma/schema.prisma` | Add `theme` field to User |
| `app/api/auth/me/route.ts` | Return user's theme |
| All components | Update to use `theme-*` class names |

---

## 9. Migration Path

To avoid breaking changes during transition:

1. **Keep old classes working** - Map old names to new:
   ```css
   .tavern-dark { @apply theme-bg-dark; }
   .accent { @apply theme-accent; }
   ```

2. **Gradually update components** - Replace old classes with new

3. **Remove old classes** - Once all components are updated

---

## Notes

- Consider adding a "system" option that respects `prefers-color-scheme`
- Each theme could have light/dark variants if needed later
- Themes could be extended to include fonts, border radius, etc.
