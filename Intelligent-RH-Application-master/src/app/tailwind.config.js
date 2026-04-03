/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6366f1',   // Indigo
          secondary: '#a855f7', // Purple
          accent: '#22d3ee',    // Cyan
          dark: '#0f172a',
        }
      },
      animation: {
        'blob': 'blob 7s infinite',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        shimmer: {
          '0%': { 'background-position': '-200% 0' },
          '100%': { 'background-position': '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
