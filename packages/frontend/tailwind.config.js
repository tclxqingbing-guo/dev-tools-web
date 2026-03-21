/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 不使用 Google Fonts，避免国内网络阻断；依赖系统 UI 与中文字体回退
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
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
