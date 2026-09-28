/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        agri: {
          green: '#15803D',   // Agricultural green primary accent
          light: '#16A34A',
          sage: '#DCFCE7',    // Soft sage green secondary accent
          border: '#22C55E',
        },
        ivory: {
          bg: '#FAF9F5',      // Warm off-white / ivory background
          card: '#FFFFFF',
          soft: '#F4F3EE',
        },
        charcoal: {
          DEFAULT: '#1A202C', // Deep charcoal readable text
          muted: '#64748B',
        },
        weather: {
          blue: '#0284C7',
          sky: '#E0F2FE',
        },
        alert: {
          amber: '#D97706',   // Warning amber
          red: '#DC2626',     // High-risk alert red
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
}
