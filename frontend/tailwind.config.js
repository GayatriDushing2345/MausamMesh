/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#061321',
          900: '#0B1F33', // Deep ink blue
          800: '#122D47',
          700: '#1B3D5E',
        },
        monsoon: {
          700: '#0A5F67',
          DEFAULT: '#0E7C86', // Monsoon teal
          400: '#2DB3C0',
          100: '#E6F6F7',
        },
        paddy: {
          DEFAULT: '#2E8B57', // Paddy green
          600: '#236F44',
          100: '#E8F5EE',
        },
        paper: {
          DEFAULT: '#F6F3EC', // Warm paper
          soft: '#EFECE3',
        },
        sky: {
          weather: '#5BB8F5',
        },
        imd: {
          green: '#2E9E4F',
          yellow: '#F2C230',
          orange: '#F28C28',
          red: '#D64545',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['var(--font-sora)', 'var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
        devanagari: ['var(--font-devanagari)', 'Noto Sans Devanagari', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
}
