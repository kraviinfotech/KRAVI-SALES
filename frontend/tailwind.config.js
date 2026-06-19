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
          DEFAULT: '#1D4ED8', // blue-700
          dark: '#1E40AF', // blue-800
          light: '#3B82F6', // blue-500
        },
        success: '#10B981', // emerald-500
        danger: '#EF4444', // red-500
      }
    },
  },
  plugins: [],
}
