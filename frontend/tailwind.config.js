/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1D4ED8',
          dark: '#1E40AF',
          light: '#3B82F6',
        },
        success: '#10B981',
        danger: '#EF4444',
      },

      keyframes: {
        typingDot: {
          '0%, 80%, 100%': {
            transform: 'scale(0.75)',
            opacity: '0.4',
          },
          '40%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
      },

      animation: {
        typingDot: 'typingDot 1.2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
      },
    },
  },
  plugins: [],
}