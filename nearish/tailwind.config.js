/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Courier New', 'monospace'],
      },
      colors: {
        france: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        philly: {
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
        }
      },
      animation: {
        'heartbeat': 'heartbeat 1.4s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'bounce-in': 'bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.2)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.2)' },
          '70%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.4) translateY(20px)' },
          '60%': { transform: 'scale(1.05) translateY(-4px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
        'glass-lg': '0 20px 60px 0 rgba(0, 0, 0, 0.3)',
        'glow-france': '0 0 20px rgba(251, 191, 36, 0.3)',
        'glow-philly': '0 0 20px rgba(96, 165, 250, 0.3)',
      }
    },
  },
  plugins: [],
}
