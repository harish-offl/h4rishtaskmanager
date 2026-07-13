/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[class~="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: '#F3F3F1',
        card: '#FFFFFF',
        dark1: '#1F1F1F',
        dark2: '#333333',
        border: '#E3E3E3',
        muted: '#777777',
        success: '#2E8B57',
        warning: '#D89B2B',
        danger: '#D9534F',
        info: '#4D7CFE',
      },
    },
  },
  plugins: [],
}
