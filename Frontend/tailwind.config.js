/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  plugins: [
    require('tailwindcss-animated')
  ],
  theme: {
    fontFamily: {
      mainfont: ['Roboto Mono', 'monospace'],
      silkscreen: ['Silkscreen', 'sans-serif'],
    },
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'lg2' : '1400px',
      'xl': '1920px',
      '2xl': '2560px',
    },
    extend: {
      animation: {
        'rotate-y': 'rotateY 1s linear',
        'rotate-y-flat': 'rotateYFlat 1s linear',
      },
      colors: {
        "buttonred": "#D30F18",
        "buttonlightred": "#F32F38",
        "secondary-green": "#2C5747",
      },
    },
  },
  plugins: [],
}