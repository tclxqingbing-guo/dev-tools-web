/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#0F172A',
          card: '#1E293B',
          hover: '#334155',
        },
        accent: {
          DEFAULT: '#22C55E',
          hover: '#16A34A',
        },
      },
    },
  },
  plugins: [],
}
