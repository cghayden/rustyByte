import type { Config } from 'tailwindcss'

/**
 * RUSTY BYTE DESIGN SYSTEM
 * 
 * To change the color scheme, update the hex values below.
 * All colors throughout the app will automatically update.
 */

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ============================================
         * BACKGROUND COLORS (Dark to Light)
         * ============================================ */
        'tavern': {
          'dark': '#191204',      // Darkest - Main page backgrounds
          'medium': '#251a06',    // Medium - Cards, panels, forms
          'light': '#3a2a0a',     // Lightest - Hover states, interactive elements
        },
        
        /* ============================================
         * ACCENT COLORS (Golden/Bisque)
         * ============================================ */
        'accent': {
          DEFAULT: '#dbac75',     // Main accent - Text, borders, highlights
          'light': '#e8c799',     // Light accent - Hover states, buttons
          'dark': '#c89a5f',      // Dark accent - Muted text
        },
        
        /* ============================================
         * SEMANTIC UI COLORS
         * These reference the colors above for clarity
         * ============================================ */
        'ui': {
          'bg': '#191204',        // Page background (tavern-dark)
          'card': '#251a06',      // Card/panel background (tavern-medium)
          'border': '#dbac75',    // Border color (accent)
          'text': '#dbac75',      // Primary text color (accent)
          'text-muted': '#c89a5f', // Secondary text (accent-dark)
        },
      },
      
      /* ============================================
       * BUTTON COLORS
       * Pre-defined for common button patterns
       * ============================================ */
      backgroundColor: {
        'btn-primary': '#dbac75',      // Primary button background
        'btn-primary-hover': '#e8c799', // Primary button hover
        'btn-secondary': '#3a2a0a',    // Secondary button background
        'btn-secondary-hover': '#4a3a1a', // Secondary button hover
      },
      textColor: {
        'btn-primary': '#191204',      // Text on primary buttons (dark on light)
        'btn-secondary': '#dbac75',    // Text on secondary buttons (light on dark)
      },
      borderColor: {
        DEFAULT: '#dbac75', // Default border color (accent)
      },
    },
  },
  plugins: [],
} satisfies Config
