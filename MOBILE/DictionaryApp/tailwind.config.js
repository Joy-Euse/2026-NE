/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#4338CA',
        accent: '#8B5CF6',
        background: '#F8FAFC',
        card: '#FFFFFF',
        text: '#111827',
        secondary: '#6B7280',
      },
    },
  },
  plugins: [],
};
