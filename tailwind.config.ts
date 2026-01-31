import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'tavern-primary': '#191204', // Dark brown/black background
        // 'tavern-secondary': '#b8914a', // Lighter golden brown accent
        'tavern-secondary': '#dbac75', // bisque
        'bisque-custom': '#ffe4c4', // Bisque color
      },
    },
  },
  plugins: [],
} satisfies Config
