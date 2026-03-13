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
          DEFAULT: '#F5F5F7',
          card: '#FFFFFF',
          hover: '#E8E8ED',
        },
        accent: {
          DEFAULT: '#5E6B7A',
          hover: '#4B5763',
        },
      },
    },
  },
  plugins: [],
}
