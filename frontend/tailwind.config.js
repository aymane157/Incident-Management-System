/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3a1362',
        'primary-light': '#512285',
        'primary-dark': '#290b49',
        secondary: '#00A3E0',
        sidebar: '#180d27',
        background: '#f3f4f8',
        surface: '#FFFFFF',
        text: '#1a1a1a',
        muted: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'premium': '0 4px 20px rgba(58, 19, 98, 0.08)',
      },
    },
  },
  plugins: [],
}