/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced playful luxury theme with better contrast
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe3',
          200: '#d1d8c7',
          300: '#b4bfa3',
          400: '#8B9A7D', // Primary sage (from current app)
          500: '#6d7e60',
          600: '#56654b',
          700: '#44503d',
          800: '#384234',
          900: '#2f372d',
        },
        // Vibrant accent colors for personality
        accent: {
          purple: '#a78bfa',
          pink: '#f472b6',
          orange: '#fb923c',
          teal: '#2dd4bf',
          blue: '#60a5fa',
        },
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        // Success/warning/error colors with better contrast
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#059669',
        },
        warning: {
          light: '#fef3c7',
          DEFAULT: '#f59e0b',
          dark: '#d97706',
        },
        danger: {
          light: '#fee2e2',
          DEFAULT: '#ef4444',
          dark: '#dc2626',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-lg': '0 20px 50px 0 rgba(31, 38, 135, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
