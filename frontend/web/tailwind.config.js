/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 类型主色
        'book': {
          light: '#FFF0F3',
          DEFAULT: '#FF9AAD',
          dark: '#E8899A',
        },
        'song': {
          light: '#F0F9FF',
          DEFAULT: '#7DD3FC',
          dark: '#38BDF8',
        },
        'video': {
          light: '#F0FDF4',
          DEFAULT: '#86EFAC',
          dark: '#4ADE80',
        },
        // 辅助色
        'cream': '#FFF9F5',
        'honey': {
          light: '#FFF3E0',
          DEFAULT: '#FFB347',
          dark: '#F59E0B',
        },
        // 文字色
        'text': {
          primary: '#4A4A4A',
          secondary: '#9CA3AF',
          light: '#D1D5DB',
        },
        // 保留原有 primary
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        }
      },
      borderRadius: {
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 24px rgba(0, 0, 0, 0.12)',
      }
    },
  },
  plugins: [],
}
