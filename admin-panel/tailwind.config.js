/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Same brand scale as the public site — anchored to logo blue #2B5ED3 = brand-600.
        brand: {
          50: '#EFF3FE',
          100: '#DCE5FC',
          200: '#B9CCF8',
          300: '#89A8F0',
          400: '#5D86E5',
          500: '#406FDB',
          600: '#2B5ED3',
          700: '#224EB4',
          800: '#193D8F',
          900: '#122C68',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 12px 28px -18px rgba(16,24,40,0.18)',
        drawer: '-24px 0 60px -24px rgba(16,24,40,0.30)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
        'toast-in': {
          from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.28s cubic-bezier(0.16,1,0.3,1)',
        'toast-in': 'toast-in 0.25s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
}
